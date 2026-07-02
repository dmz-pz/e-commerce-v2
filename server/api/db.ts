import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

export const useMock = "";

dotenv.config();
if (!process.env.DATABASE_URL) {
  console.error("❌ ERROR: process.env.DATABASE_URL no está definida en db.ts");
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (prisma) {
    return prisma;
  }
  prisma = new PrismaClient({ adapter });
  return prisma;
}

export async function shutdownDatabase(): Promise<void> {
  try {
    if (prisma) {
      await prisma.$disconnect();
      prisma = null;
    }
  } catch (error) {
    console.error("Error disconnecting Prisma:", error);
  }

  try {
    await pool.end();
  } catch (error) {
    console.error("Error closing pg pool:", error);
  }
}
