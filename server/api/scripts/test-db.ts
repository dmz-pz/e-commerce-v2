import "dotenv/config";
import { prisma} from "../db.ts";

async function main() {
  if (false) {
    console.error(
      "USE_MOCK_DATABASE=true o falta DATABASE_URL. Ajusta las env vars.",
    );
    process.exit(1);
  }

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
