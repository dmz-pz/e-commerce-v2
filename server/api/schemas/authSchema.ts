import { z } from "zod";

// 1. Definimos los valores válidos del Enum tal cual están en tu esquema de Prisma
const RoleEnum = z.enum([
  "CLIENTE",
  "ADMINISTRADOR",
  "DELIVERY",
  "STAFF_PICKER",
]); // Ajusta los nombres exactos de tus roles

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

export const registerSchema = z.object({
  body: z.object({
    cedula: z
      .string({ error: "La cédula es requerida" })
      .trim()
      .regex(
        /^\d{7,8}$/,
        "La cédula debe contener solo números y tener entre 7 y 8 dígitos",
      ),
    firstName: z
      .string({ error: "El nombre es requerido" })
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(16, "El nombre debe tener maximo 16 caracteres"),
    lastName: z
      .string({ error: "El apellido es requerido" })
      .trim()
      .min(3, "El apellido debe tener al menos 3 caracteres")
      .max(25, "El apellido debe tener maximo 25 caracteres"),
    phone: z
      .string({ error: "El teléfono es requerido" })
      .regex(
        /^\d{11}$/,
        "El teléfono debe contener solo números y tener exactamente 11 dígitos",
      ),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(
        z.email({
          error: (issue) =>
            issue.input === undefined
              ? " El correo electronico es requerido"
              : " El formato de correo electronico no es valido",
        }),
      ),
    password: z
      .string({ error: "La contraseña es requerida" })
      .trim()
      .min(8, { error: "La contraseña debe tener al menos 8 caracteres" })
      .refine((v) => /[A-Z]/.test(v), {
        error: "Debe incluir al   menos una mayúscula",
      })
      .refine((v) => /[a-z]/.test(v), {
        error: "Debe incluir al   menos una minúscula",
      })
      .refine((v) => /\d/.test(v), {
        error: "Debe incluir al menos un  número",
      }),

    birthdate: z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
      error:
        "El formato de la fecha de nacimiento no es válido (Debe ser YYYY-MM-DD)",
    }),

    role: RoleEnum.default("CLIENTE"),
  }),
});

export const loginSchema = z.object({
  body: z
    .object({
      email: z
        .string()
        .trim()
        .toLowerCase()
        .pipe(
          z.email({
            error: (issue) =>
              issue.input === undefined
                ? " El correo electronico es requerido"
                : " El formato de correo electronico no es valido",
          }),
        ),
      password: z
        .string({ error: "La contraseña es requerida" })
        .trim()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
    })
    .strict(),
});

export type RegisterUserInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
