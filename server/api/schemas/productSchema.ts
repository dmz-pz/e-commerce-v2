import { z } from "zod";

const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === "" ? undefined : val), schema);

export const createProductSchema = z.object({
  name: z
    .string({ message: "El nombre del producto es obligatorio" })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder los 100 caracteres"),

  description: z
    .string({ message: "La descripción es obligatoria" })
    .min(10, "La descripción debe tener al menos 10 caracteres"),

  barcode: emptyStringToUndefined(
    z
      .string()
      .min(5, "El código de barras es demasiado corto")
      .max(50, "El código de barras es demasiado largo"),
  ).nullish(),

  price: z.coerce
    .number({ message: "El precio debe ser un número válido" })
    .positive("El precio debe ser mayor a cero"),

  discountPrice: emptyStringToUndefined(
    z.coerce
      .number()
      .positive("El precio de descuento debe ser mayor a cero")
      .nullish(),
  ),

  stock: z.coerce
    .number()
    .int("El stock debe ser un número entero")
    .nonnegative("El stock no puede ser negativo")
    .default(0),

  brand: emptyStringToUndefined(z.string()).nullish(),

  unit: z
    .enum(["UNID", "KG", "GR"], {
      error: "Unidad inválida. Use: UNID, KG o GR",
    })
    .default("UNID"),
  isRecommended: z
    .string()
    .default("false")
    .transform((val) => val === "true"),

  isActive: z
    .string()
    .default("true")
    .transform((val) => val === "true"),

  subcategoryId: z.string({ error: "La subcategoría es obligatoria" }).uuid({
    message: "El ID de la subcategoría debe ser un formato UUID válido",
  }),

  specifications: z
    .string()
    .nullish()
    .transform((str) => {
      if (str === "" || str == null) return null;

      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const createProductRequestSchema = z.object({
  body: createProductSchema, // Anidamos el esquema puro aquí adentro
});

export const updateProductRequestSchema = z.object({
  params: z.object({
    id: z.string().uuid("El ID del producto debe ser un UUID válido"),
  }),
  body: createProductSchema.partial(), // Anidamos la versión parcial aquí
});
