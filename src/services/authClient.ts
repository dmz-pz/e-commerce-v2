import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:4000", // Asumimos que el backend está en 5000, ajustaremos si es necesario
});

export const { signIn, signUp, signOut, useSession } = authClient;
