import { z } from "zod";

// Helper robusto: convierte "" o null en undefined antes de validar como opcional
const optionalString = (schema?: z.ZodString) =>
  z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val ?? undefined),
    (schema || z.string()).optional().nullable()
  );

// Helper para campos booleanos (acepta tanto booleanos true/false como strings "true"/"false")
const booleanField = (defaultValue = false) =>
  z.preprocess((val) => {
    if (val === undefined || val === null || val === "") return defaultValue;
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true";
    return Boolean(val);
  }, z.boolean());

export const createProductSchema = z.object({
  name: z
    .string({ message: "El nombre del producto es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(150, "El nombre no puede exceder los 150 caracteres"),

  description: z
    .string({ message: "La descripción es obligatoria" })
    .default(""),

  barcode: optionalString(
    z.string().min(3, "El código de barras es demasiado corto").max(50, "El código de barras es demasiado largo")
  ),

  price: z.coerce
    .number({ message: "El precio debe ser un número válido" })
    .positive("El precio debe ser mayor a cero"),

  discountPrice: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.number().positive("El precio de descuento debe ser mayor a cero").optional().nullable()
  ),

  stock: z.coerce
    .number()
    .int("El stock debe ser un número entero")
    .nonnegative("El stock no puede ser negativo")
    .default(0),

  brand: optionalString(),

  unit: z
    .enum(["UNID", "KG", "GR"], {
      error: "Unidad inválida. Use: UNID, KG o GR",
    })
    .default("UNID"),

  isRecommended: booleanField(false),

  isActive: booleanField(true),

  subcategoryId: z.string({ error: "La subcategoría es obligatoria" }).uuid({
    message: "El ID de la subcategoría debe ser un formato UUID válido",
  }),

  taxRateId: z.string({ error: "La tasa de impuesto es obligatoria" }).uuid({
    message: "El ID de la tasa de impuesto debe ser un formato UUID válido",
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
    id: z.string({ error: "El ID del producto es requerido" }).uuid({
      message: "El ID del producto debe ser un formato UUID válido",
    }),
  }),
  body: createProductSchema.partial(), // Anidamos la versión parcial aquí
});

export const updateProductActivitySchema = z.object({
  params: z.object({
    id: z.string({ error: "El ID del producto es requerido" }).uuid({
      message: "El ID del producto debe ser un formato UUID válido",
    }),
  }),
  body: z.object({
    isActive: z.boolean({
      message: "El estado de activación 'isActive' es obligatorio",
    }),
  }),
});
