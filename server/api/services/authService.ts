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
    const payload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });

    // 4. Retornar solo los datos que el controlador necesita para responder
    return {
      token,
      user: {
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
      firtsName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
    };
  }
}

export const authService = new AuthService();
