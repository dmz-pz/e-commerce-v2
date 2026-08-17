import { betterAuth } from "better-auth/minimal";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db";

import { sendPasswordResetEmail, sendVerificationEmail } from "./email"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url }) => {
            console.log("=== RESET PASSWORD URL GENERADA ===");
            console.log(url);
            console.log("===================================");

            void sendPasswordResetEmail(
                user.email,
                user.name,
                url,
            )
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            console.log("=== EMAIL VERIFICATION URL GENERADA ===");
            console.log(url);
            console.log("===================================");

            void sendVerificationEmail(
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
            if (ctx.path === "/sign-up/email" && ctx.body && typeof ctx.body === "object" && "email" in ctx.body) {
                const email = (ctx.body as any).email as string;
                if (!email) return;

                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (existingUser && !existingUser.emailVerified) {
                        const hoursSinceCreation = (new Date().getTime() - existingUser.createdAt.getTime()) / (1000 * 60 * 60);
                        if (hoursSinceCreation >= 1) {
                            await prisma.user.delete({ where: { id: existingUser.id } });
                            console.log(`[AUTH] Limpiado usuario fantasma (${email}) para permitir registro legítimo.`);
                        }
                    }
                } catch (error) {
                    console.error("[AUTH] Error limpiando usuario fantasma:", error);
                }
            }
        }),
    },
});