import { getPrisma } from "../db.ts";
import { RegisterUserInput } from "../schemas/authSchema";

type UserCreateInput = Omit<RegisterUserInput, "password" | "birthdate"> & {
  passwordHash: string;
  birthdate?: Date; // Sobreescribimos a tipo Date nativo para Prisma
};

export class UserRepository {
  async create(data: UserCreateInput) {
    try {
      const prisma = getPrisma();
      const newUser = await prisma.user.create({
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
      const prisma = getPrisma();

      const user = await prisma.user.findUnique({
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
}

export const userRepository = new UserRepository();
