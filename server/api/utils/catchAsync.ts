import type { Request, Response, NextFunction } from "express";

/**
 * Wrapper para envolver funciones asíncronas en controladores Express.
 * Captura cualquier excepción o promesa rechazada y la transfiere al
 * middleware global de errores (`next(error)`).
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
