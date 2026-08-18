import { z } from "zod";

// 1. Definimos los valores válidos del Enum tal cual están en tu esquema de Prisma
const RoleEnum = z.enum([
  "CLIENTE",
  "ADMINISTRADOR",
  "DELIVERY",
  "STAFF_PICKER",
]); // Ajusta los nombres exactos de tus roles



export const registerSchema = z.object({
  body: z.object({
    cedula: z
      .string({ error: "La cédula es requerida" })
      .trim()
      .regex(
        /^[VE]-\d{7,8}$/,
        "La cédula debe ser V o E y contener entre 7 y 8 dígitos (ej: V-12345678).",
      ),
    name: z
      .string({ error: "El nombre es requerido" })
      .trim()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(40, "El nombre debe tener maximo 40 caracteres"),
    phone: z
      .string({ error: "El teléfono es requerido" })
      .regex(
        /^\+\d{12}$/,
        "El teléfono debe tener exactamente 13 dígitos",
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

    birthdate: z
      .string({ error: "La fecha de nacimiento es requerida" })
      .trim()
      .min(1, "La fecha de nacimiento es requerida")
      .refine((val) => !isNaN(Date.parse(val)), {
        error: "El formato de la fecha de nacimiento no es válido",
      })
      .refine(
        (val) => {
          const birthDateObj = new Date(val);
          const today = new Date();
          let age = today.getFullYear() - birthDateObj.getFullYear();
          const monthDiff = today.getMonth() - birthDateObj.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDateObj.getDate())
          ) {
            age--;
          }
          return age >= 18;
        },
        {
          error: "Debes ser mayor de edad (mínimo 18 años) para registrarte.",
        },
      ),

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

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(
        z.email({
          error: (issue) =>
            issue.input === undefined
              ? "El correo electrónico es requerido"
              : "El formato de correo electrónico no es válido",
        }),
      ),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(
        z.email({
          error: "El formato de correo electrónico no es válido",
        }),
      ),
    code: z
      .string({ error: "El código de recuperación es requerido" })
      .trim()
      .min(6, "El código de recuperación debe tener al menos 6 caracteres"),
    newPassword: z
      .string({ error: "La nueva contraseña es requerida" })
      .trim()
      .min(8, { error: "La contraseña debe tener al menos 8 caracteres" })
      .refine((v) => /[A-Z]/.test(v), {
        error: "Debe incluir al menos una mayúscula",
      })
      .refine((v) => /[a-z]/.test(v), {
        error: "Debe incluir al menos una minúscula",
      })
      .refine((v) => /\d/.test(v), {
        error: "Debe incluir al menos un número",
      }),
  }),
});

export type RegisterUserInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
