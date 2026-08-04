import odbc from 'odbc';
import { prisma, shutdownDatabase } from '../server/api/db';
import { UnitType } from '../generated/prisma/enums';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const DSN = process.env.ODBC_DSN || 'Conexion_Mine';
const UID = process.env.ODBC_UID || 'lector';
const PWD = process.env.ODBC_PWD || 'DsI2018';
const connectionString = `DSN=${DSN};UID=${UID};PWD=${PWD}`;

const IMAGES_DIR = process.env.IMAGES_DIR || 'C:\\Users\\DMZ\\Videos\\scraping-imagenes-plansuarez\\catalogo_productos';
// Usaremos este directorio para guardar las versiones optimizadas antes de subirlas manualmente a R2
const OPTIMIZED_DIR = path.join(process.cwd(), 'uploads', 'products_optimized');

const PUBLIC_URL = process.env.PUBLIC_URL || 'https://images.minegociosup.com';
const SKIP_OPTIMIZATION = process.env.SKIP_IMAGE_OPTIMIZATION === 'true';

const SYNC_QUERY = `
SELECT 
    p.cod_interno,
    b.cod_barra,
    p.txt_descripcion_corta,
    p.txt_descripcion_larga,
    p.ind_inactivo,
    p.ind_pesado, 
    imp.cod_impuesto,
    imp.porc_impuesto,
    pre.mto_moneda AS precio_usd,
    mon.tasa_vig
FROM DBA.tv_producto AS p
INNER JOIN DBA.tv_barra AS b ON p.cod_interno = b.cod_interno
INNER JOIN DBA.td_tipo_impuesto AS imp ON p.cod_impuesto = imp.cod_impuesto
OUTER APPLY (
    SELECT TOP 1 mto_precio, mto_moneda 
    FROM DBA.ta_precio_producto 
    WHERE cod_interno = p.cod_interno AND mto_moneda > 0
    ORDER BY fecha_cambio DESC
) AS pre
CROSS JOIN (
    SELECT tasa_vig FROM DBA.tb_moneda WHERE cod_internacional = 'USD'
) AS mon
WHERE p.ind_inactivo = 'A'
`;

async function syncCatalog() {
  console.log(`[+] Conectando a la base de datos externa ODBC (DSN: ${DSN})...`);
  let connection;
  try {
    connection = await odbc.connect(connectionString);
  } catch (error) {
    console.error('[-] Error al conectar con ODBC:', error);
    process.exit(1);
  }

  console.log('[+] Obteniendo catálogo masivo (todos los activos)...');
  let rows;
  try {
    rows = await connection.query(SYNC_QUERY);
  } catch (error) {
    console.error('[-] Error ejecutando la consulta:', error);
    await connection.close();
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('[-] No se encontraron productos.');
    await connection.close();
    return;
  }

  console.log(`[+] Obtenidos ${rows.length} productos de la base de datos origen.`);

  // La tasa de cambio viene en todas las filas (por el cross join), tomamos la primera
  const tasaVig = rows[0].tasa_vig;
  
  if (tasaVig) {
    console.log(`[+] Sincronizando Tasa de Cambio del día: ${tasaVig}`);
    const exchangeRate = await prisma.exchangeRate.findFirst();
    if (exchangeRate) {
      await prisma.exchangeRate.update({
        where: { id: exchangeRate.id },
        data: { rate: Number(tasaVig) }
      });
    } else {
      await prisma.exchangeRate.create({
        data: { rate: Number(tasaVig), currency: 'VES' }
      });
    }
  }

  // Obtener la categoría comodín
  let defaultCategory = await prisma.category.findUnique({ where: { name: 'Sin Categorizar' } });
  if (!defaultCategory) {
    defaultCategory = await prisma.category.create({ data: { name: 'Sin Categorizar' } });
  }

  let defaultSubcategory = await prisma.subcategory.findFirst({ 
    where: { name: 'Varios', categoryId: defaultCategory.id } 
  });
  if (!defaultSubcategory) {
    defaultSubcategory = await prisma.subcategory.create({
      data: { name: 'Varios', categoryId: defaultCategory.id }
    });
  }

  console.log('[+] Sincronizando Impuestos y Productos...');
  
  let successCount = 0;
  
  for (const row of rows) {
    // 1. Manejo del Impuesto
    const codImpuesto = String(row.cod_impuesto);
    const percentage = Number(row.porc_impuesto);
    const taxName = percentage > 0 ? `IVA ${percentage}%` : 'Exento';

    let taxRate = await prisma.taxRate.findUnique({ where: { code: codImpuesto } });
    if (!taxRate) {
      taxRate = await prisma.taxRate.create({
        data: { code: codImpuesto, name: taxName, percentage }
      });
    }

    // 2. Manejo del Producto
    const isActive = row.ind_inactivo === 'A';
    const unit = (row.ind_pesado === 1 || row.ind_pesado === '1') ? UnitType.KG : UnitType.UNID;
    const price = row.precio_usd ? Number(row.precio_usd) : 0;
    
    const externalId = String(row.cod_interno);
    const barcode = row.cod_barra ? String(row.cod_barra) : null;

    try {
      await prisma.product.upsert({
        where: { externalId },
        update: {
          name: row.txt_descripcion_corta || 'Sin Nombre',
          description: row.txt_descripcion_larga || '',
          barcode,
          price,
          unit,
          isActive,
          taxRateId: taxRate.id
        },
        create: {
          externalId,
          name: row.txt_descripcion_corta || 'Sin Nombre',
          description: row.txt_descripcion_larga || '',
          barcode,
          price,
          unit,
          isActive,
          taxRateId: taxRate.id,
          subcategoryId: defaultSubcategory.id,
          stock: 0
        }
      });
      successCount++;
    } catch (e) {
      console.error(`[-] Error al hacer upsert del producto ${externalId}:`, e);
    }
  }

  console.log(`[+] Importación de catálogo completada: ${successCount} productos.`);
  
  console.log('[+] Procesando imágenes locales con Sharp (generación offline para R2)...');
  if (fs.existsSync(IMAGES_DIR)) {
    if (!SKIP_OPTIMIZATION && !fs.existsSync(OPTIMIZED_DIR)) {
      fs.mkdirSync(OPTIMIZED_DIR, { recursive: true });
    }
    
    let imagesProcessed = 0;
    const categoriesDirs = fs.readdirSync(IMAGES_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
    
    for (const catDir of categoriesDirs) {
      const catName = catDir.name;
      // Crear/buscar categoria en BD
      let category = await prisma.category.findUnique({ where: { name: catName } });
      if (!category) {
        category = await prisma.category.create({ data: { name: catName } });
      }

      const subPath = path.join(IMAGES_DIR, catName);
      const subcategoriesDirs = fs.readdirSync(subPath, { withFileTypes: true }).filter(d => d.isDirectory());

      for (const subDir of subcategoriesDirs) {
        const subName = subDir.name;
        // La restricción de unicidad es [name, categoryId]
        let subcategory = await prisma.subcategory.findUnique({ 
          where: { name_categoryId: { name: subName, categoryId: category.id } } 
        });
        if (!subcategory) {
          subcategory = await prisma.subcategory.create({ 
            data: { name: subName, categoryId: category.id } 
          });
        }

        const imgPath = path.join(subPath, subName);
        const images = fs.readdirSync(imgPath, { withFileTypes: true }).filter(f => f.isFile() && /\.(png|webp|jpe?g)$/i.test(f.name));

        for (const img of images) {
          const barcode = path.parse(img.name).name;
          const sourceFilePath = path.join(imgPath, img.name);
          
          // Buscar producto usando el código de barras
          const product = await prisma.product.findUnique({ where: { barcode } });
          if (product) {
            // Reubicar de "Sin Categorizar" a su categoria real
            await prisma.product.update({
              where: { id: product.id },
              data: { subcategoryId: subcategory.id }
            });
            
            // Verificamos si ya existe la imagen asociada en BD
            const existingImg = await prisma.productImage.findFirst({ where: { productId: product.id } });
            if (!existingImg) {
               // Nombres de archivos optimizados (locales, listos para arrastrar a R2)
               const fullFilename = `${barcode}-full.webp`;
               const thumbFilename = `${barcode}-thumb.webp`;
               
               if (!SKIP_OPTIMIZATION) {
                 console.log(`[+] Optimizando y guardando imagen para: ${barcode}`);
                 const fullDestPath = path.join(OPTIMIZED_DIR, fullFilename);
                 const thumbDestPath = path.join(OPTIMIZED_DIR, thumbFilename);

                 // Leer buffer original
                 const fileBuffer = fs.readFileSync(sourceFilePath);

                 // Generar Versión Full
                 await sharp(fileBuffer)
                   .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
                   .webp({ quality: 80 })
                   .toFile(fullDestPath);

                 // Generar Versión Thumb
                 await sharp(fileBuffer)
                   .resize({ width: 300, height: 300, fit: 'cover' })
                   .webp({ quality: 75 })
                   .toFile(thumbDestPath);
               } else {
                 console.log(`[+] Registrando URLs en base de datos para: ${barcode} (omitiendo optimización física)`);
               }
               
               // Crear registro en BD apuntando al dominio público de Cloudflare
               // (Asumiendo que subirás estos archivos directamente en el root del bucket, bajo un folder 'products/')
               const fullUrl = `${PUBLIC_URL}/products/${fullFilename}`;
               const thumbUrl = `${PUBLIC_URL}/products/${thumbFilename}`;
               
               await prisma.productImage.create({
                 data: { productId: product.id, url: fullUrl, thumbUrl }
               });
            }
            imagesProcessed++;
          }
        }
      }
    }
    console.log(`[+] Procesamiento completado: ${imagesProcessed} productos reubicados y vinculados a sus fotos.`);
  } else {
    console.log(`[-] Error: El directorio de imágenes no existe en la ruta: ${IMAGES_DIR}`);
  }
  
  await connection.close();
  await shutdownDatabase();
}

syncCatalog().catch(e => {
  console.error(e);
  process.exit(1);
});
