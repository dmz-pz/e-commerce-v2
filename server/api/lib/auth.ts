import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../db";


export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
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