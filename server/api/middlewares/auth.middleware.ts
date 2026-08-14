import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.ts";

export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Better Auth extrae la cookie de sesión o el bearer token automáticamente de los headers
    const session = await auth.api.getSession({
      headers: req.headers as HeadersInit,
    });

    if (!session) {
      res.status(401).json({
        error: "Acceso denegado. No se encontro ninguna sesión activa.",
      });
      return;
    }

    // Adaptamos el usuario de Better Auth al formato que espera la app
    req.user = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as any).role || "CLIENTE",
    };

    next();
  } catch (error) {
    res.status(403).json({ error: "Error al verificar la sesión." });
    return;
  }
}
