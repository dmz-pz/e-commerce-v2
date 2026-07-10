import type { NextFunction, Request, Response } from "express";
import * as z from "zod";

export const validateResource =
  (schema: z.ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (result.success) {
      // opcional: reemplazar con lo parseado (incluye coerciones/transforms)
      req.body = (result.data as any).body;
      req.query = (result.data as any).query;
      req.params = (result.data as any).params;
      return next();
    }

    return res.status(400).json({
      status: "fail",
      message: "Datos inválidos",
      issues: result.error.issues,
      errors: z.treeifyError(result.error),
    });
  };
