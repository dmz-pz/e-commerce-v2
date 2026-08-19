import { userRepository } from "../repositories/userRepository.ts";

export class UserService {
  private isGhostAccount(user: any) {
    if (!user) return false;
    const hoursSinceCreation = (new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60);
    return !user.emailVerified && hoursSinceCreation >= 1;
  }

  async checkAvailability(cedula?: string, phone?: string, email?: string) {
    const issues: { path: string[]; message: string }[] = [];

    if (cedula) {
      const exists = await userRepository.getByCedula(cedula);
      if (exists && !this.isGhostAccount(exists)) {
        issues.push({ path: ["cedula"], message: "Esta cédula ya se encuentra registrada." });
      }
    }

    if (phone) {
      const exists = await userRepository.getByPhone(phone);
      if (exists && !this.isGhostAccount(exists)) {
        issues.push({ path: ["phone"], message: "Este teléfono ya se encuentra registrado." });
      }
    }

    if (email) {
      const exists = await userRepository.getByEmail(email);
      if (exists && !this.isGhostAccount(exists)) {
        issues.push({ path: ["email"], message: "Este correo electrónico ya se encuentra registrado." });
      }
    }

    return issues;
  }
}

export const userService = new UserService();
