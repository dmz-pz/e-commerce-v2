import { error } from "console";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;
  if (!token) {
    return res.status(401).json({
      error: "Acceso denegado. No se encontro ninguna sesión activa.",
    });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("SECRET no existe para la firma del jwt");
    }

    // Verificamos el token firmado
    const decoded = jwt.verify(token, secret) as {
      id: string;
      name: string;
      email: string;
      role: string;
    };

    req.user = decoded;

    next(); // Continuamos a la ruta protegida
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        code: "TOKEN_EXPIRADO",
        error: "Tu sesión ha expirado. Por favor, inicia sesión de nuevo.",
      });
    }
    return res.status(403).json({ error: "Token inválido o alterado." });
  }
}
