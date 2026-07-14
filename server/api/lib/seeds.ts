import { getPrisma } from "../db";
const prisma = getPrisma();

async function main() {
  console.log("🌱 Buscando o creando datos iniciales en la base de datos...");

  // 1. Buscamos si ya existe la categoría base para evitar errores de duplicación
  let category = await prisma.category.findFirst({
    where: { name: "Tecnología" },
    include: { subcategories: true },
  });

  // 2. Si no existe, creamos la estructura relacional completa en un solo paso
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "Tecnología",
        subcategories: {
          create: [{ name: "Componentes de PC" }],
        },
      },
      include: {
        subcategories: true,
      },
    });
    console.log("🆕 Nueva categoría y subcategoría creadas correctamente.");
  } else {
    console.log(
      "♻️ Se encontraron datos existentes. Extrayendo identificadores...",
    );
  }

  // 3. Obtenemos de forma segura la subcategoría generada o existente
  const targetSubcategory = category.subcategories[0];

  console.log("\n========================================================");
  console.log("✅ ¡Entorno de pruebas listo en PostgreSQL!");
  console.log(`📂 Modelo Category: ${category.name} (ID: ${category.id})`);
  console.log(`🏷️  Modelo Subcategory: ${targetSubcategory.name}`);
  console.log(`📌 UUID PARA COPIAR EN YAAK: ${targetSubcategory.id}`);
  console.log("========================================================\n");
}

main()
  .catch((error) => {
    console.error("❌ Hubo un error procesando el semillero:", error);
    process.exit(1);
  })
  .finally(async () => {
    // Desconectamos el cliente de forma limpia para liberar recursos de la BD
    await prisma.$disconnect();
  });
