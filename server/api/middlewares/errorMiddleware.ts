import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appErrors.ts";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Caso A: Errores operativos controlados por ti (400, 404, 409, etc.)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Caso C: Errores inesperados o caídas de infraestructura (500)
  console.error("💥 Error Crítico No Controlado:", err);
  res.status(500).json({
    success: false,
    error: "Ocurrió un error interno e inesperado en el servidor.",
  });
};
