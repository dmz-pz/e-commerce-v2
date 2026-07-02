import { getPrisma } from "../db.ts";

export class UserRepository {
  async create(data: {
    cedula: string;
    FirtsName: string;
    LastName: string;
    phone: string;
    email: string;
    passwordHash: string;
    birthdate?: Date;
    role?: any;
    deletedAt?: Date;
  }) {
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
