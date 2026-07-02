import { Request, Response, NextFunction } from "express";

// Este middleware recibe los roles permitidos para la ruta
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Si el middleware requireAuth se ejecutó antes, req.user ya existe
    if (!req.user) {
      return res
        .status(401)
        .json({ status: "fail", message: "No autenticado" });
    }

    // Verificamos si el rol del usuario está en la lista de roles permitidos
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "No tienes los permisos necesarios para realizar esta acción.",
      });
    }

    return next();
  };
};
