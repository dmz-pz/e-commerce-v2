import * as z from "zod";

// Replicamos el Enum de Prisma para que Zod rechace cualquier texto inválido
const FulfillmentMethodEnum = z.enum(["DELIVERY", "PICK_UP"]);

export const createOrderSchema = z.object({
  body: z.object({
    // Datos de logística opcionales dictados por el cliente
    deliveryAddress: z.string().optional(),
    fulfillmentMethod: FulfillmentMethodEnum.optional(),

    // Carrito de compras limpio (Sin precios ni datos de identidad)
    items: z
      .array(
        z.object({
          productId: z
            .string({ error: "El ID del producto es requerido" })
            .uuid({ error: "El formato del ID del producto es inválido" }),

          // Soportamos pesajes con hasta 3 decimales para coincidir con @db.Decimal(10, 3)
          requestedQuantity: z
            .number({ error: "La cantidad es requerida" })
            .positive({
              error: "La cantidad debe ser estrictamente mayor a cero",
            })
            .transform((val) => Number(val.toFixed(3))),
        }),
      )
      .min(1, "La orden debe contener al menos un producto"),
  }),
});

// Exportamos el tipo inferido para usarlo más adelante en nuestro Controlador y Servicio
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
