import { getPrisma } from "../db.ts";
import { RegisterUserInput } from "../schemas/authSchema";

type UserCreateInput = Omit<RegisterUserInput, "password" | "birthdate"> & {
  passwordHash: string;
  birthdate?: Date; // Sobreescribimos a tipo Date nativo para Prisma
};

export class UserRepository {
  private prisma = getPrisma()
  async create(data: UserCreateInput) {
    try {
      const newUser = await this.prisma.user.create({
        data,
      });
      return newUser;
    } catch (error: any) {
      throw new Error(
        `Error al crear el usuario en la base de datos: ${error.message}`,
      );
    }
  }

  async getByEmail(email: string) {
    try {

      const user = await this.prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al buscar usuario por email: ${error.message}`);
      }

      throw new Error("Error inesperado al buscar usuario por email");
    }
  }

  async getById(id: string) {
    try { // Alineado con tu inicializador[cite: 5]
      return await this.prisma.user.findUnique({
        where: { id },
      });
    } catch (error: any) {
      throw new Error(`Error al buscar usuario por ID: ${error.message}`);
    }
  }
}

export const userRepository = new UserRepository();
