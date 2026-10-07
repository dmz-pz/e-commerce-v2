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
            birthdate: {
                type: "date",
                required: false,
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

                // Prevenir inyección de roles: Forzar siempre a CLIENTE en el registro público
                if (body.role) {
                    body.role = "CLIENTE";
                }

                // 1. Validación Zod
                try {
                    registerSchema.parse({ body });
                } catch (error: any) {
                    const firstError = error.errors?.[0]?.message || "Error de validación";
                    throw new APIError("BAD_REQUEST", { message: firstError });
                }

                // Convertir birthdate a Date object para que better-auth lo acepte si su type es "date"
                if (body.birthdate && typeof body.birthdate === "string") {
                    body.birthdate = new Date(body.birthdate);
                }

                // Función auxiliar para manejar conflictos (Cuentas Invitadas vs Registros Abandonados)
                const handleAccountConflict = async (user: any, fieldName: string) => {
                    // 1. Caso: Cuenta Invitada (creada por Staff)
                    const isGuest = user.email.startsWith('guest_') && user.email.includes('@minegocio.local');
                    if (isGuest) {
                        const suffix = `_migrating_${Date.now()}`;
                        await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                cedula: user.cedula + suffix,
                                phone: user.phone + suffix,
                                email: user.email + suffix,
                            }
                        });
                        console.log(`[AUTH] Cuenta invitada renombrada para ceder datos legítimos (${fieldName}: ${user[fieldName]}).`);
                        return true; 
                    }

                    // 2. Caso: Registro Abandonado (No verificado y expirado > 1 hr)
                    const hoursSinceCreation = (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60);
                    if (!user.emailVerified && hoursSinceCreation >= 1) {
                        await prisma.user.delete({ where: { id: user.id } });
                        console.log(`[AUTH] Limpiado registro abandonado por ${fieldName} (${user[fieldName]}) para permitir registro legítimo.`);
                        return true;
                    }

                    return false; // Es una cuenta real verificada o en periodo de gracia
                };

                try {
                    // 2. Validación de duplicados y migración de fantasmas
                    const existingCedula = await prisma.user.findUnique({
                        where: { cedula: body.cedula },
                    });
                    if (existingCedula) {
                        const handled = await handleAccountConflict(existingCedula, 'cedula');
                        if (!handled) throw new APIError("BAD_REQUEST", { message: "La cédula ingresada ya se encuentra registrada por otro usuario." });
                    }

                    const existingPhone = await prisma.user.findFirst({
                        where: { phone: body.phone },
                    });
                    if (existingPhone) {
                        const handled = await handleAccountConflict(existingPhone, 'phone');
                        if (!handled) throw new APIError("BAD_REQUEST", { message: "El número de teléfono ingresado ya se encuentra registrado por otro usuario." });
                    }

                    const existingUser = await prisma.user.findUnique({
                        where: { email },
                    });
                    if (existingUser) {
                        const handled = await handleAccountConflict(existingUser, 'email');
                        if (!handled) throw new APIError("BAD_REQUEST", { message: "El correo electrónico ingresado ya se encuentra registrado por otro usuario." });
                    }
                } catch (error) {
                    if (error instanceof APIError) {
                        throw error;
                    }
                    console.error("[AUTH] Error procesando migración de cuenta fantasma:", error);
                    throw new APIError("INTERNAL_SERVER_ERROR", { message: "Error interno procesando el registro." });
                }
            }
        }),
        after: createAuthMiddleware(async (ctx) => {
            if (ctx.path === "/sign-up/email" && ctx.body && typeof ctx.body === "object") {
                const body = ctx.body as any;
                const cedula = body.cedula;
                if (!cedula) return;

                // 3. Migrar el historial de pedidos de la cuenta fantasma a la nueva cuenta real
                try {
                    const newUser = await prisma.user.findUnique({ where: { cedula } });
                    if (!newUser) return;

                    // Buscamos todas las cuentas fantasma asociadas a esta cédula (que fueron renombradas)
                    const ghostUsers = await prisma.user.findMany({
                        where: { email: { startsWith: `guest_${cedula}@minegocio.local` } }
                    });

                    for (const ghost of ghostUsers) {
                        // Traspasamos las órdenes
                        await prisma.order.updateMany({
                            where: { customerId: ghost.id },
                            data: { customerId: newUser.id }
                        });
                        // Eliminamos permanentemente al fantasma
                        await prisma.user.delete({ where: { id: ghost.id } });
                        console.log(`[AUTH] Historial migrado exitosamente del fantasma ${ghost.id} al usuario real ${newUser.id}`);
                    }
                } catch (err) {
                    console.error("[AUTH] Error en post-migración de cuenta fantasma:", err);
                }
            }
        }),
    },
});