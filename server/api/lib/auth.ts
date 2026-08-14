import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db";

import { sendPasswordResetEmail } from "./email"

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }, request) => {
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
    // }
});