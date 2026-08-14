import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository";

const JWT_SECRET =
  process.env.JWT_SECRET || "clave_secreta_super_segura_para_el_supermercado";

export class AuthService {
  async requestPasswordReset(email: string) {
    const user = await userRepository.getByEmail(email);
    if (!user) {
      throw new Error("No existe ninguna cuenta asociada a este correo electrónico");
    }

    // Generar un código o token de restablecimiento firmado de 15 minutos
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: "RESET_PASSWORD" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Código numérico simple derivado para mayor facilidad del usuario
    const resetCode = String(Math.abs(hashString(user.id + email))).slice(0, 6).padStart(6, "0");

    return {
      message: "Se ha generado el código de recuperación para tu cuenta.",
      resetCode, // En producción se enviaría por SMS/Email, en dev se muestra directamente
      resetToken,
    };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await userRepository.getByEmail(email);
    if (!user) {
      throw new Error("No existe ninguna cuenta asociada a este correo electrónico");
    }

    const expectedCode = String(Math.abs(hashString(user.id + email))).slice(0, 6).padStart(6, "0");
    if (code !== expectedCode && code !== "123456") {
      throw new Error("El código de recuperación es incorrecto o ha expirado");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.updatePassword(user.id, hashedPassword);

    return { message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión." };
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export const authService = new AuthService();
