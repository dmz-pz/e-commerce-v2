import { z } from "zod";

// 1. Definimos los valores válidos del Enum tal cual están en tu esquema de Prisma
const RoleEnum = z.enum(["CLIENTE", "ADMINISTRADOR", "REPARTIDOR"]); // Ajusta los nombres exactos de tus roles

export const registerSchema = z.object({
  body: z.object({
    cedula: z
      .string({ message: "La cédula es requerida" })
      .min(7, "La cédula debe tener al menos 7 caracteres"),
    FirtsName: z
      .string({ message: "El nombre es requerido" })
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(16, "El nombre debe tener al menos 16 caracteres"),
    LastName: z
      .string({ message: "El apellido es requerido" })
      .min(3, "El apellido debe tener al menos 2 caracteres")
      .max(25, "El apellido debe tener maximo 25 caracteres"),
    phone: z
      .string({ message: "El teléfono es requerido" })
      .min(7, "Número de teléfono inválido")
      .max(11, "Número de telefono inválido"),
    email: z
      .string({ message: "El correo electrónico es requerido" })
      .email("El formato del correo electrónico no es válido"),
    password: z
      .string({ message: "La contraseña es requerida" })
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    birthdate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message:
          "El formato de la fecha de nacimiento no es válido (Debe ser YYYY-MM-DD)",
      }),
    // El rol acepta solo el Enum, es opcional en el body y por defecto es CLIENTE
    role: RoleEnum.default("CLIENTE"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "El correo electrónico es requerido" })
      .email("Formato de correo inválido"),
    password: z.string({ message: "La contraseña es requerida" }),
  }),
});

// 🔥 ¡MÁGICA DE TYPESCRIPT! Extraemos los tipos automáticamente eliminando el tipado manual
export type RegisterUserInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
