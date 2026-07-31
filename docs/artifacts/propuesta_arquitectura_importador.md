# Propuesta de Arquitectura Final: Importador y Sincronización del Catálogo

Hemos definido el diseño técnico para la carga inicial y la sincronización diaria de productos del e-commerce a partir del análisis de las columnas reales de la base de datos del supermercado físico del cliente y sus tipos de datos específicos.

---

## 1. Diseño y Modelado de Datos (Prisma Schema)

Para soportar el IVA dinámico, los precios en dólares (moneda estable), y la tasa de cambio diaria, realizaremos las siguientes adiciones en [schema.prisma](file:///c:/Users/DMZ/Documents/DSI/e-commerce-v2/prisma/schema.prisma):

```prisma
// ==========================================
// MÓDULO ADICIONAL: IMPUESTOS Y FINANZAS
// ==========================================

model ExchangeRate {
  id        String   @id @default(uuid())
  rate      Decimal  @db.Decimal(10, 4) // Tasa de cambio del día (ej. 36.5432)
  currency  String   @default("VES")
  updatedAt DateTime @updatedAt

  @@map("exchange_rates")
}

model TaxRate {
  id         String    @id @default(uuid())
  code       String    @unique           // Corresponde a "cod_impuesto" de origen (guardado como String)
  name       String                      // Nombre amigable (ej. "IVA 16%" o "Exento")
  percentage Decimal   @db.Decimal(5, 2) // Corresponde a "porc_impuesto" (ej. 16.00)
  products   Product[]

  @@map("tax_rates")
}
```

### Modificación al Modelo de Producto:
Relacionamos el producto con su tasa de impuesto correspondiente:

```prisma
model Product {
  // ... campos existentes ...
  price          Decimal      @db.Decimal(10, 2) // Precio base en USD
  isActive       Boolean      @default(true)
  
  // Relación con el Impuesto
  taxRateId      String
  taxRate        TaxRate      @relation(fields: [taxRateId], references: [id])
  
  // ... resto de campos y relaciones ...
}
```

---

## 2. Mapeo de Columnas (Origen vs. Destino)

El script de sincronización (`scripts/syncCatalog.ts`) conectará con la base de datos del cliente y cruzará las tablas de **Productos**, **Precios**, **Códigos de Barra** e **Impuestos** según el siguiente mapeo:

| Tabla Origen (Supermercado) | Columna Origen | Campo Destino (E-commerce) | Regla de Negocio / Transformación |
| :--- | :--- | :--- | :--- |
| **tv_barra** (Unida por `cod_interno`) | `cod_barra` | `Product.barcode` | Código de barras del producto (cruzar por `cod_interno` con la tabla de productos). |
| **Productos** | `txt_descripcion_corta` | `Product.name` | Nombre comercial del producto. |
| **Productos** | `txt_descripcion_larga` | `Product.description` | Descripción detallada del producto. |
| **Productos** | `ind_inactivo` | `Product.isActive` | En origen es `char`. Si es `'A'` (Activo) entonces `isActive = true`. Cualquier otro valor es `false`. |
| **Productos** | `ind_pesado` | `Product.unit` | Si es `1` (Verdadero), unit es `KG`. Si es `0` (Falso), unit es `UNID`. |
| **Productos** | `cod_impuesto` | `Product.taxRateId` | Relación con la tabla `TaxRate` del e-commerce. |
| **Precios del Producto** | `mto_precio` | `Product.price` | Precio en **dólares (USD)** obtenido directamente (indicado por `mnt_moneda`). |
| **Precios del Producto** | `fecha_cambi` | *N/A* | Se utiliza para sincronización incremental (saber si el precio cambió desde la última ejecución). |
| **Tipo de Impuesto** | `cod_impuesto` | `TaxRate.code` | Identificador de impuesto (convertido a String, ej. `"1"`). |
| **Tipo de Impuesto** | `txt_impuesto` / `porc_impuesto` | `TaxRate.name` | Nombre dinámico amigable basado en el porcentaje: `porc_impuesto > 0 ? "IVA " + porc_impuesto + "%" : "Exento"`. |
| **Tipo de Impuesto** | `porc_impuesto` | `TaxRate.percentage` | Porcentaje de IVA para cálculos (ej. 16.00). |

---

## 3. Flujo de Sincronización Diario (Batch Script)

### Paso 1: Sincronización de Tasas e Impuestos
1. El script lee la tabla de **Tipos de Impuesto** de la base de datos física del cliente.
2. Crea o actualiza en la tabla `TaxRate` de e-commerce mapeando el `cod_impuesto` de tipo entero a `TaxRate.code` como `string`.
3. El campo `TaxRate.name` se genera automáticamente: si el porcentaje del impuesto es mayor a 0, se nombra `"IVA X%"` (donde X es el valor, ej. 16%); si es 0, se nombra `"Exento"`.
4. Si la base de datos física entrega la **Tasa de Cambio**, el script consulta ese valor y actualiza la fila única de `ExchangeRate` en el e-commerce.

### Paso 2: Sincronización Incremental de Productos
1. El script extrae del e-commerce la fecha y hora de la última sincronización.
2. Consulta en la base de datos física los productos cuyas filas (o precios en la tabla de precios mediante `fecha_cambi`) se hayan modificado después de la última sincronización, realizando un `JOIN` con la tabla `tv_barra` para obtener su correspondiente `cod_barra`.
3. Realiza un **Upsert** (Crear o Actualizar) en la tabla `Product`:
   * Si es un producto nuevo, se asocia inicialmente a la subcategoría/categoría comodín `"Sin Categorizar"` / `"Varios"`.
   * Si el producto deja de existir en origen o tiene fecha de desincorporación, se marca con `isActive = false` y `stock = 0`.

### Paso 3: Aplanado Automático de Imágenes (Sólo Importación Inicial)
1. El script escanea recursivamente la carpeta local del cliente.
2. Para cada archivo `categoria/subcategoria/[barcode].png`:
   * Si el `barcode` ya fue insertado en la base de datos:
     * El script asegura la existencia de la categoría y subcategoría en el e-commerce (sanitizando el nombre a minúsculas y sin acentos para la URL, ej: `alimentos/lacteos`).
     * Reubica el producto de la categoría comodín a esta subcategoría real.
     * Copia físicamente el archivo a la carpeta del e-commerce (`public/uploads/products/[barcode].png`) y crea el registro de imagen correspondiente.
