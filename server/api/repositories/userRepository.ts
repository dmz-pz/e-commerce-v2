import { prisma } from "../db.ts";
import { RegisterUserInput } from "../schemas/authSchema";
import { AppError } from "../utils/appErrors.ts";
import { Role } from "../../../generated/prisma/enums.ts";

type UserCreateInput = Omit<RegisterUserInput, "password" | "birthdate"> & {
  passwordHash: string;
  birthdate?: Date; // Sobreescribimos a tipo Date nativo para Prisma
};

export class UserRepository {
  async create(data: UserCreateInput) {
    try {
      const newUser = await prisma.user.create({
        data,
      });
      return newUser;
    } catch (e: unknown) { const error = e as Error;
      throw new AppError(
        `Error al crear el usuario en la base de datos: ${error.message}`,
        500
      );
    }
  }

  async getByEmail(email: string) {
    try {

      const user = await prisma.user.findUnique({
        where: { email },
      });
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new AppError(`Error al buscar usuario por email: ${error.message}`, 500);
      }
      throw new AppError("Error inesperado al buscar usuario por email", 500);
    }
  }

  async getById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (e: unknown) { const error = e as Error;
      throw new AppError(`Error al buscar usuario por ID: ${error.message}`, 500);
    }
  }

  async updatePassword(id: string, passwordHash: string) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { passwordHash },
      });
    } catch (e: unknown) { const error = e as Error;
      throw new AppError(`Error al actualizar contraseña del usuario: ${error.message}`, 500);
    }
  }

  async getAll(filters?: { role?: Role }) {
    try {
      return await prisma.user.findMany({
        where: {
          deletedAt: null,
          ...(filters?.role ? { role: filters.role } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e: unknown) { const error = e as Error;
      throw new AppError(`Error al listar usuarios: ${error.message}`, 500);
    }
  }

  async updateRole(id: string, role: Role) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { role },
      });
    } catch (e: unknown) { const error = e as Error;
      throw new AppError(`Error al actualizar rol del usuario: ${error.message}`, 500);
    }
  }

  async softDelete(id: string) {
    try {
      return await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    } catch (e: unknown) { const error = e as Error;
      throw new AppError(`Error al dar de baja al usuario: ${error.message}`, 500);
    }
  }
}

export const userRepository = new UserRepository();
