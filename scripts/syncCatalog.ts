import odbc from 'odbc';
import { prisma, shutdownDatabase } from '../server/api/db';
import { UnitType } from '../generated/prisma/enums';
import fs from 'fs';
import path from 'path';

const DSN = process.env.ODBC_DSN;
const UID = process.env.ODBC_UID;
const PWD = process.env.ODBC_PWD;
const connectionString = `DSN=${DSN};UID=${UID};PWD=${PWD}`;

const TAXONOMY_PATH = path.join(process.cwd(), 'prisma', 'data', 'taxonomy-mapping.json');
const PUBLIC_URL = process.env.PUBLIC_URL || 'https://images.minegociosup.com';

interface TaxonomyData {
  categories: Array<{
    name: string;
    subcategories: string[];
  }>;
  products: Record<string, { category: string; subcategory: string }>;
}

const SYNC_QUERY = `
SELECT 
    p.cod_interno,
    p.cod_departamento,
    b.cod_barra,
    p.txt_descripcion_corta,
    p.txt_descripcion_larga,
    p.ind_inactivo,
    p.ind_pesado, 
    imp.cod_impuesto,
    imp.porc_impuesto,
    pre.mto_moneda,
    pre.mto_precio,
    mon.tasa_vig
FROM DBA.tv_producto AS p
LEFT JOIN DBA.tv_barra AS b ON p.cod_interno = b.cod_interno
INNER JOIN DBA.td_tipo_impuesto AS imp ON p.cod_impuesto = imp.cod_impuesto
CROSS APPLY (
    SELECT TOP 1 mto_precio, mto_moneda 
    FROM DBA.ta_precio_producto 
    WHERE cod_interno = p.cod_interno AND (mto_moneda > 0 OR mto_precio > 0)
    ORDER BY fecha_cambio DESC
) AS pre
CROSS JOIN (
    SELECT tasa_vig FROM DBA.tb_moneda WHERE cod_internacional = 'USD'
) AS mon
WHERE p.ind_inactivo = 'A'
`;

async function syncCatalog(): Promise<void> {
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

  // 1. Sincronización de la Tasa de Cambio del día
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

  // 2. Carga del archivo de mapeo de taxonomía JSON
  let taxonomyMapping: TaxonomyData = { categories: [], products: {} };
  if (fs.existsSync(TAXONOMY_PATH)) {
    try {
      const rawData = fs.readFileSync(TAXONOMY_PATH, 'utf-8');
      taxonomyMapping = JSON.parse(rawData) as TaxonomyData;
      console.log(`[+] Mapeo de taxonomía cargado con éxito: ${taxonomyMapping.categories.length} categorías y ${Object.keys(taxonomyMapping.products).length} productos mapeados.`);
    } catch (err) {
      console.error('[-] Error al leer o parsear taxonomy-mapping.json:', err);
    }
  } else {
    console.warn(`[-] Advertencia: No se encontró ${TAXONOMY_PATH}. Los productos se asignarán a la categoría comodín.`);
  }

  // 3. Categoría y Subcategoría comodín por defecto
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

  // 4. Pre-crear o asegurar todas las Categorías y Subcategorías en la base de datos
  console.log('[+] Sincronizando árbol de Categorías y Subcategorías...');
  const subcategoryCache = new Map<string, string>(); // Clave: `${catName}:::${subName}` -> subcategoryId

  for (const cat of taxonomyMapping.categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name }
    });

    for (const subName of cat.subcategories) {
      const subcategory = await prisma.subcategory.upsert({
        where: { name_categoryId: { name: subName, categoryId: category.id } },
        update: {},
        create: { name: subName, categoryId: category.id }
      });
      subcategoryCache.set(`${cat.name}:::${subName}`, subcategory.id);
    }
  }

  console.log('[+] Sincronizando Impuestos, Productos e Imágenes...');
  let successCount = 0;
  let imagesLinkedCount = 0;
  let categorizedCount = 0;

  for (const row of rows) {
    // A. Manejo de Impuestos
    const codImpuesto = String(row.cod_impuesto);
    const percentage = Number(row.porc_impuesto);
    const taxName = percentage > 0 ? `IVA ${percentage}%` : 'Exento';

    let taxRate = await prisma.taxRate.findUnique({ where: { code: codImpuesto } });
    if (!taxRate) {
      taxRate = await prisma.taxRate.create({
        data: { code: codImpuesto, name: taxName, percentage }
      });
    }

    // B. Manejo del Producto
    const isActive = row.ind_inactivo === 'A';
    const deptStr = String(row.cod_departamento || '').trim();
    const deptNum = parseInt(deptStr, 10);

    const isWeightedDept = [4, 6, 8].includes(deptNum);
    const isKg = (row.ind_pesado === 4 || row.ind_pesado === '4' || row.ind_pesado === 1 || row.ind_pesado === '1' || isWeightedDept);
    const unit = isKg ? UnitType.KG : UnitType.UNID;

    const priceUSD = row.mto_moneda ? Number(row.mto_moneda) : 0;
    const priceLocal = row.mto_precio ? Number(row.mto_precio) : 0;
    const rate = row.tasa_vig ? Number(row.tasa_vig) : 1;
    const price = priceUSD > 0 ? priceUSD : (priceLocal > 0 ? priceLocal / rate : 0);

    const externalId = String(row.cod_interno).trim();
    const barcodeRaw = String(row.cod_barra || '').trim();
    const barcode = barcodeRaw !== '' ? barcodeRaw : null;

    // C. Determinar la Subcategoría desde el mapeo en memoria (O(1))
    let targetSubcategoryId = defaultSubcategory.id;
    const mapping = barcode ? taxonomyMapping.products[barcode] : undefined;

    if (mapping) {
      const cachedSubId = subcategoryCache.get(`${mapping.category}:::${mapping.subcategory}`);
      if (cachedSubId) {
        targetSubcategoryId = cachedSubId;
        categorizedCount++;
      }
    }

    try {
      const product = await prisma.product.upsert({
        where: { externalId },
        update: {
          name: row.txt_descripcion_larga || 'Sin Nombre',
          description: row.txt_descripcion_corta || '',
          barcode,
          price,
          unit,
          isActive,
          taxRateId: taxRate.id,
          subcategoryId: targetSubcategoryId
        },
        create: {
          externalId,
          name: row.txt_descripcion_larga || 'Sin Nombre',
          description: row.txt_descripcion_corta || '',
          barcode,
          price,
          unit,
          isActive,
          taxRateId: taxRate.id,
          subcategoryId: targetSubcategoryId,
          stock: 0
        }
      });
      successCount++;

      // D. Vinculación directa con Cloudflare R2 (si el producto está mapeado con imagen)
      if (mapping && barcode) {
        const existingImg = await prisma.productImage.findFirst({
          where: { productId: product.id }
        });

        if (!existingImg) {
          const fullFilename = `${barcode}-full.webp`;
          const thumbFilename = `${barcode}-thumb.webp`;
          const fullUrl = `${PUBLIC_URL}/products/${fullFilename}`;
          const thumbUrl = `${PUBLIC_URL}/products/${thumbFilename}`;

          await prisma.productImage.create({
            data: {
              productId: product.id,
              url: fullUrl,
              thumbUrl
            }
          });
          imagesLinkedCount++;
        }
      }
    } catch (e) {
      console.error(`[-] Error al hacer upsert del producto ${externalId}:`, e);
    }
  }

  console.log('\n======================================================');
  console.log(`✅ Sincronización de catálogo finalizada con éxito:`);
  console.log(`   - Total productos procesados: ${successCount}`);
  console.log(`   - Productos clasificados en sus categorías: ${categorizedCount}`);
  console.log(`   - Imágenes vinculadas desde Cloudflare R2: ${imagesLinkedCount}`);
  console.log('======================================================\n');

  await connection.close();
  await shutdownDatabase();
}

syncCatalog().catch(e => {
  console.error('[-] Error fatal en syncCatalog:', e);
  process.exit(1);
});
