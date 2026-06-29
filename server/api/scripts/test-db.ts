import "dotenv/config";
import { getPrisma, useMock } from "../db.ts";

async function main() {
  if (useMock) {
    console.error(
      "USE_MOCK_DATABASE=true o falta DATABASE_URL. Ajusta las env vars.",
    );
    process.exit(1);
  }

  const prisma = getPrisma();

  try {
    const rows = await prisma.product.findMany({ take: 5 });
    console.log("Rows:", rows);
  } catch (err) {
    console.error("Error querying DB:", err);
  } finally {
    try {
      await prisma.$disconnect();
    } catch (_) {}
  }
}

main();
