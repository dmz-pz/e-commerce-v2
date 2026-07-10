// 📁 En: src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";

export const validateBody = (schema: ZodObject) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      // Si el schema usa transforms/refinements async, parseAsync es el correcto
      req.body = await schema.parseAsync(req.body);

      if (req.method === "POST" && !req.file) {
        return res.status(400).json({
          status: "fail",
          message: "La imagen del producto es obligatoria.",
        });
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: "fail",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      return res
        .status(400)
        .json({ status: "fail", message: (error as Error).message });
    }
  };
};
