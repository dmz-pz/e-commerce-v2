import type { NextFunction, Request, Response } from "express";
import * as z from "zod";

export const validateResource =
  (schema: z.ZodObject<any, any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (result.success) {
      // opcional: reemplazar con lo parseado (incluye coerciones/transforms)
      const data = result.data as z.infer<typeof schema>;
      if (data.body) req.body = data.body;
      if (data.query) req.query = data.query as unknown as Record<string, string | string[] | undefined>;
      if (data.params) req.params = data.params as unknown as Record<string, string>;
      return next();
    }

    return res.status(400).json({
      status: "fail",
      message: "Datos inválidos",
      issues: result.error.issues,
      errors: result.error.format(),
    });
  };
