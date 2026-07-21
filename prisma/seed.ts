import { getPrisma } from "../server/api/db";
import axios from "axios";
import fs from "fs";
import path from "path";

const prisma = getPrisma();
const API_URL = "http://localhost:3000/api"; // Ajusta la ruta base de tu enrutador Express si es necesario

async function main() {
  console.log("🌱 Iniciando proceso de sembrado e-commerce (idempotente)...");

  // ==========================================
  // 1. CREACIÓN DE CATEGORÍA Y SUBCATEGORÍA (Vía Prisma ORM directo)
  // ==========================================
  let category = await prisma.category.findFirst({
    where: { name: "Alimentos" },
    include: { subcategories: true },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "Alimentos",
        subcategories: {
          create: [{ name: "Víveres" }],
        },
      },
      include: {
        subcategories: true,
      },
    });
    console.log("🆕 Categoría 'Alimentos' y Subcategoría 'Víveres' creadas en Base de Datos.");
  } else {
    console.log("♻️ Categoría y Subcategoría de Alimentos ya existen.");
  }

  const subcategoryId = category.subcategories[0].id;

  // ==========================================
  // 2. CREACIÓN DE USUARIOS (Vía HTTP Loopback / registerSchema de Zod)
  // ==========================================
  const seedUsers = [
    {
      cedula: "12345678", // 8 dígitos exactos
      firstName: "Admin",
      lastName: "Supermercado",
      phone: "04121234567",
      email: "admin@supermercado.com",
      password: "Password123", // Cumple: Mayúscula, Minúscula, Número y min 8 caracteres
      birthdate: "1988-10-12", // Formato fecha válido
      role: "ADMINISTRADOR",
    },
    {
      cedula: "87654321",
      firstName: "Juan",
      lastName: "Cliente",
      phone: "04128765432",
      email: "cliente@gmail.com",
      password: "Password123",
      birthdate: "1995-04-20",
      role: "CLIENTE",
    },
    {
      cedula: "15984263",
      firstName: "Pedro",
      lastName: "Picker",
      phone: "04141598426",
      email: "picker@supermercado.com",
      password: "Password123",
      birthdate: "1992-07-15",
      role: "STAFF_PICKER",
    },
    {
      cedula: "36925814",
      firstName: "Carlos",
      lastName: "Delivery",
      phone: "04163692581",
      email: "delivery@supermercado.com",
      password: "Password123",
      birthdate: "1994-11-05",
      role: "DELIVERY",
    },
  ];

  for (const user of seedUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      try {
        // Enviar petición HTTP al controlador de autenticación real
        const response = await axios.post(`${API_URL}/auth/register`, user);
        console.log(`👤 Usuario Creado vía API: ${user.firstName} [${user.role}] - Status: ${response.status}`);
      } catch (error: any) {
        console.error(
          `❌ Error al registrar al usuario ${user.email} con Zod:`,
          error.response?.data || error.message
        );
      }
    } else {
      console.log(`♻️  El usuario ${user.email} ya existe en base de datos.`);
    }
  }

  // ==========================================
  // 3. CREACIÓN DE PRODUCTO DE PRUEBA (Vía HTTP Loopback / productSchema + Multer)
  // ==========================================
  const barcodeTest = "7501055310884";
  const existingProduct = await prisma.product.findUnique({
    where: { barcode: barcodeTest },
  });

  if (!existingProduct) {
    try {
      // Creamos una imagen mock de prueba temporalmente si no existe una para subir
      const mockImagePath = path.join(__dirname, "temp-mock-product.jpg");
      if (!fs.existsSync(mockImagePath)) {
        fs.writeFileSync(mockImagePath, "fake image binary content for testing");
      }

      // Preparar el FormData para cumplir con el middleware de Multer y el body parser
      const formData = new FormData();
      formData.append("name", "Harina de Maíz Precocida 1kg");
      formData.append("description", "Harina de maíz blanco perfecta para hacer arepas tradicionales.");
      formData.append("barcode", barcodeTest);
      formData.append("price", "1.45"); // Se coerceará a number por Zod
      formData.append("discountPrice", ""); // Vacío que pasa por preprocess a undefined / null
      formData.append("stock", "150"); // Se coerceará a int por Zod
      formData.append("unit", "KG"); // Enum válido
      formData.append("subcategoryId", subcategoryId); // UUID real
      formData.append("isRecommended", "false");
      formData.append("isActive", "true");
      
      // Adjuntar la imagen real requerida
      const fileBuffer = fs.readFileSync(mockImagePath);
      const fileBlob = new Blob([fileBuffer], { type: 'image/jpeg' }); 
      formData.append("image", fileBlob, "nombre-de-tu-archivo.jpg"); 
      
      const response = await axios.post(`${API_URL}/products`, formData);

      console.log(`🛒 Producto de prueba creado vía API - Status: ${response.status}`);

      // Eliminar el archivo de pruebas temporal de forma segura
      if (fs.existsSync(mockImagePath)) {
        fs.unlinkSync(mockImagePath);
      }
    } catch (error: any) {
      console.error(
        "❌ Error al registrar el producto de prueba en Zod/Multer:",
        error.response?.data || error.message
      );
    }
  } else {
    console.log("♻️  El producto de prueba ya existe en el catálogo.");
  }

  console.log("\n========================================================");
  console.log("✅ ¡Semillero auditado y cargado correctamente!");
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("💥 Error fatal en el sembrado:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });