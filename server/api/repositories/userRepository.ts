import { prisma } from "../db.ts";
import { AppError } from "../utils/appErrors.ts";
import { Role } from "../../../generated/prisma/enums.ts";

export class UserRepository {
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
