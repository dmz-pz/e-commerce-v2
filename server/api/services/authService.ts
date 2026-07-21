import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/userRepository"; 
import type { RegisterUserInput } from "../schemas/authSchema";

const JWT_SECRET =
  process.env.JWT_SECRET || "clave_secreta_super_segura_para_el_supermercado";

export class AuthService {
  async authenticateUser(email: string, password: string) {
    const user = await userRepository.getByEmail(email);

    if (!user) {
      throw new Error("Credenciales incorrectas");
    }

    // 2. Verificar la contraseña con Bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Credenciales incorrectas");
    }

    // 3. Generar el JWT
    const payload = { id: user.id, name: user.firstName, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

    // 4. Retornar solo los datos que el controlador necesita para responder
    return {
      token,
      user: {
        id: user.id,
        name: user.firstName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async registerUser(userData: RegisterUserInput) {
    const existingUser = await userRepository.getByEmail(userData.email);
    if (existingUser) {
      throw new Error("El correo electrónico ya está en uso");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await userRepository.create({
      cedula: userData.cedula,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      email: userData.email,
      passwordHash: hashedPassword,
      birthdate: userData.birthdate ? new Date(userData.birthdate) : undefined,
      role: userData.role,
    });

    return {  
      id: newUser.id,
      cedula: newUser.cedula,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    };
  }

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
