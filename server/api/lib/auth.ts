import { betterAuth } from "better-auth/minimal";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { registerSchema } from "../schemas/authSchema.ts";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db";

import { sendPasswordResetEmail, sendVerificationEmailService } from "./email"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        autoSignIn: false,
        sendResetPassword: async ({ user, url }) => {
            void sendPasswordResetEmail(
                user.email,
                user.name,
                url,
            )
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url }) => {
            void sendVerificationEmailService(
                user.email,
                user.name,
                url,
            )
        },
    },
    user: {
        additionalFields: {
            cedula: {
                type: "string",
                required: true,
            },

            phone: {
                type: "string",
                required: true,
            },
            role: {
                type: "string",
                required: false,
                defaultValue: "CLIENTE",
            },
        },
    },
    // Agrega después los proveedores de redes sociales que necesites:
    // socialProviders: {
    //   google: { clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! }
    // },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path === "/sign-up/email" && ctx.body && typeof ctx.body === "object") {
                const body = ctx.body as any;
                const email = body.email as string;

                // 1. Validación Zod
                try {
                    registerSchema.parse({ body });
                } catch (error: any) {
                    const firstError = error.errors?.[0]?.message || "Error de validación";
                    throw new APIError("BAD_REQUEST", { message: firstError });
                }

                // Función auxiliar para revisar y limpiar cuentas fantasma
                const checkAndCleanGhost = async (user: any, fieldName: string) => {
                    const hoursSinceCreation = (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60);
                    if (!user.emailVerified && hoursSinceCreation >= 1) {
                        await prisma.user.delete({ where: { id: user.id } });
                        console.log(`[AUTH] Limpiado usuario fantasma por ${fieldName} (${user[fieldName]}) para permitir registro legítimo.`);
                        return true; // Era fantasma y fue limpiado
                    }
                    return false; // Es una cuenta real
                };

                try {
                    // 2. Validación de duplicados y limpieza de fantasmas
                    const existingCedula = await prisma.user.findUnique({
                        where: { cedula: body.cedula },
                    });
                    if (existingCedula) {
                        const cleaned = await checkAndCleanGhost(existingCedula, 'cedula');
                        if (!cleaned) throw new APIError("BAD_REQUEST", { message: "La cédula ingresada ya se encuentra registrada por otro usuario." });
                    }

                    const existingPhone = await prisma.user.findFirst({
                        where: { phone: body.phone },
                    });
                    if (existingPhone) {
                        const cleaned = await checkAndCleanGhost(existingPhone, 'phone');
                        if (!cleaned) throw new APIError("BAD_REQUEST", { message: "El número de teléfono ingresado ya se encuentra registrado por otro usuario." });
                    }

                    const existingUser = await prisma.user.findUnique({
                        where: { email },
                    });
                    if (existingUser) {
                        const cleaned = await checkAndCleanGhost(existingUser, 'email');
                        if (!cleaned) throw new APIError("BAD_REQUEST", { message: "El correo electrónico ingresado ya se encuentra registrado por otro usuario." });
                    }
                } catch (error) {
                    if (error instanceof APIError) {
                        throw error;
                    }
                    console.error("[AUTH] Error limpiando usuario fantasma:", error);
                    throw new APIError("INTERNAL_SERVER_ERROR", { message: "Error interno procesando el registro." });
                }
            }
        }),
    },
});