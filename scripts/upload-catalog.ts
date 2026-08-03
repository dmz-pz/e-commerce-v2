import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Configuración del cliente R2
const r2Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
});

// Ruta local donde tienes guardadas las 3,000 imágenes optimizadas
const LOCAL_FOLDER = path.join(process.cwd(), "uploads", "products_optimized");
const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

async function uploadSingleFile(fileName: string) {
    const filePath = path.join(LOCAL_FOLDER, fileName);
    const fileBuffer = fs.readFileSync(filePath);

    // Importante: La clave debe incluir el prefijo "products/"
    // para que coincida con https://images.minegociosup.com/products/nombre.webp
    const r2Key = `products/${fileName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: r2Key,
        Body: fileBuffer,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable", // Caché inmutable para la CDN
    });

    await r2Client.send(command);
}

async function runBulkUpload() {
    console.log("🚀 Iniciando subida de 3,000 imágenes a Cloudflare R2...\n");

    if (!fs.existsSync(LOCAL_FOLDER)) {
        console.error(`❌ La carpeta "${LOCAL_FOLDER}" no existe.`);
        return;
    }

    const files = fs.readdirSync(LOCAL_FOLDER).filter(file => !file.startsWith("."));
    const totalFiles = files.length;
    console.log(`📦 Se encontraron ${totalFiles} archivos para procesar.\n`);

    // Subimos en lotes concurrentes de 25 en 25
    const BATCH_SIZE = 25;
    let uploadedCount = 0;

    for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);

        await Promise.all(
            batch.map(async (file) => {
                try {
                    await uploadSingleFile(file);
                    uploadedCount++;
                } catch (err) {
                    console.error(`❌ Error subiendo ${file}:`, err);
                }
            })
        );

        const percentage = ((uploadedCount / totalFiles) * 100).toFixed(1);
        console.log(`⏳ Progreso: ${uploadedCount} / ${totalFiles} (${percentage}%)`);
    }

    console.log("\n🎉 ¡Carga masiva completada exitosamente!");
}

runBulkUpload();