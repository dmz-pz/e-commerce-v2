import { getPrisma } from "../server/api/db";

const prisma = getPrisma();
const API_BASE_URL = "http://localhost:3000/api";

// Helper para simular un archivo binario de imagen (1x1 píxel transparente) en Node.js
function createDummyImageBlob(): Blob {
  const base64Png =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const buffer = Buffer.from(base64Png, "base64");
  return new Blob([buffer], { type: "image/png" });
}

async function main() {
  console.log("🌱 [SEED] Iniciando proceso de sembrado de datos...");

  // ==========================================
  // PASO 1: Sembrado de Categorías (Prisma Directo)
  // ==========================================
  let category = await prisma.category.findFirst({
    where: { name: "Tecnología" },
    include: { subcategories: true },
  });

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
    console.log(
      "🆕 [DB] Nueva categoría y subcategoría creadas correctamente.",
    );
  } else {
    console.log("♻️ [DB] Categoría y subcategoría base ya existentes.");
  }

  const targetSubcategory = category.subcategories[0];

  // ==========================================
  // PASO 2: Sembrado de Usuarios (Vía API POST /auth/register)
  // ==========================================
  const usersToSeed = [
    {
      cedula: "12345678",
      firstName: "Cliente",
      lastName: "Pruebas",
      email: "cliente@supermercado.com",
      password: "Password123!",
      phone: "04120999903",
      birthdate: "2004-02-20",
      role: "CLIENTE",
    },
    {
      cedula: "87654321",
      firstName: "Picker",
      lastName: "Oficial",
      email: "picker@supermercado.com",
      password: "Password123!",
      phone: "04120999906",
      birthdate: "2004-02-20",
      role: "STAFF_PICKER",
    },
    {
      cedula: "11223344",
      firstName: "Admin",
      lastName: "General",
      email: "admin@supermercado.com",
      password: "Password123!",
      phone: "04120999905",
      birthdate: "2004-02-20",
      role: "ADMINISTRADOR",
    },
  ];

  console.log("\n👤 [API] Evaluando registro de usuarios de prueba...");
  for (const userData of usersToSeed) {
    // Verificamos de forma idempotente en la DB antes de disparar la petición HTTP
    const userExists = await prisma.user.findFirst({
      where: { email: userData.email },
    });

    if (!userExists) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        const result = await response.json();

        if (response.ok) {
          console.log(
            `✅ Usuario creado [${userData.role}]: ${userData.email}`,
          );
        } else {
          console.error(`❌ Error al crear [${userData.role}]:`, result);
        }
      } catch (error) {
        console.error(
          `💥 Error de red registrando al usuario ${userData.email}:`,
          error,
        );
      }
    } else {
      console.log(`♻️ Usuario existente [${userData.role}]: ${userData.email}`);
    }
  }

  // ==========================================
  // PASO 3: Sembrado de Productos (Vía API POST /products - multipart/form-data)
  // ==========================================
  const productsToSeed = [
    {
      name: "Memoria RAM DDR4 16GB",
      barcode: "7501055300011",
      price: "45.99",
      description: "Memoria ram de pruebas",
      discountPrice: "00.00",
      stock: "25",
      unit: "UNID",
      isRecommended: "true",
      isActive: "true",
      specifications: { switches: "red", layout: "ISO" },
      subcategoryId: targetSubcategory.id,
    },
    {
      name: "Pasta Térmica de Alta Densidad",
      barcode: "7501055300022",
      price: "15.50",
      description: "Pasta termina de pruebas",
      discountPrice: "00.00",
      stock: "25",
      isRecommended: "true",
      isActive: "true",
      specifications: { switches: "red", layout: "ISO" },
      unit: "GR", // Útil para simular picking fraccionado posteriormente
      subcategoryId: targetSubcategory.id,
    },
  ];

  console.log("\n📦 [API] Evaluando registro de catálogo de productos...");
  for (const prodData of productsToSeed) {
    const productExists = await prisma.product.findFirst({
      where: { barcode: prodData.barcode },
    });

    if (!productExists) {
      try {
        const formData = new FormData();

        // Adjuntamos la información del producto
        formData.append("name", prodData.name);
        formData.append("barcode", prodData.barcode);
        formData.append("price", prodData.price);
        formData.append("discountPrice", prodData.discountPrice);
        formData.append("subcategoryId", prodData.subcategoryId);
        formData.append("unitType", prodData.unit);

        // Simulamos la carga de la imagen requerida por tus controladores y Multer
        const dummyImage = createDummyImageBlob();
        formData.append("image", dummyImage, "test-product-image.png");

        const response = await fetch(`${API_BASE_URL}/products`, {
          method: "POST",
          body: formData, // Fetch se encarga automáticamente de establecer el Content-Type adecuado con el boundary
        });

        const result = await response.json();

        if (response.ok) {
          console.log(
            `✅ Producto creado: ${prodData.name} (${prodData.unit})`,
          );
        } else {
          console.error(`❌ Error al crear producto ${prodData.name}:`, result);
        }
      } catch (error) {
        console.error(
          `💥 Error de red registrando producto ${prodData.name}:`,
          error,
        );
      }
    } else {
      console.log(`♻️ Producto existente: ${prodData.name} (${prodData.unit})`);
    }
  }

  console.log("\n========================================================");
  console.log("✅ ¡Proceso de sembrado finalizado!");
  console.log(`📂 Subcategoría vinculada: ${targetSubcategory.name}`);
  console.log(`📌 UUID Subcategoría: ${targetSubcategory.id}`);
  console.log("========================================================\n");
}

main()
  .catch((error) => {
    console.error("💥 Error fatal durante la ejecución del seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
