import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];

  // Validamos que exista la cabecera y empiece con Bearer
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Acceso denegado. Credenciales invalidas",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET || "fallback_secret";

    // Verificamos el token firmado
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      role: string;
    };

    // Inyectamos los datos decodificados en la petición para que el controlador los use
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

// Middleware adicional por si quieres proteger rutas exclusivas de Administrador
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ error: "Acceso prohibido. Requiere rol de Administrador." });
  }
  next();
}
