# Resumen de Cambios: Soporte para Rutas Múltiples y Corrección de UI de Órdenes

Se realizaron ajustes en las transiciones de estado de los motorizados y en la visualización de los botones del panel del Staff/Picker.

## Cambios Aplicados

### Backend
1. **[orderRepository.ts](file:///c:/Users/DMZ/Documents/DSI/e-commerce-v2/server/api/repositories/orderRepository.ts)**
   - Se añadió la relación `include: { deliveryPerson: true }` dentro de las consultas de `deliveryJobs` (en `getAll`, `getById`, `getByCustomerId`, `updateStatus` y `assignDelivery`).
   - **Resultado:** El backend ahora envía los datos del usuario motorizado junto con los detalles de la orden para que el frontend los pueda pintar.

2. **[orderService.ts](file:///c:/Users/DMZ/Documents/DSI/e-commerce-v2/server/api/services/orderService.ts)**
   - Se comentó la línea que forzaba el cambio a `busy` al asignar un pedido.

### Frontend
3. **[index.ts](file:///c:/Users/DMZ/Documents/DSI/e-commerce-v2/src/types/index.ts)**
   - Se agregó `deliveryPerson?: User` a la interfaz `DeliveryJob` para dar soporte estricto de tipos de TypeScript.

4. **[OrderCard.tsx](file:///c:/Users/DMZ/Documents/DSI/e-commerce-v2/src/components/staff/OrderCard.tsx)**
   - Se crearon variables locales calculadas `deliveryPersonId` y `deliveryPerson` a partir del arreglo `order.deliveryJobs?.[0]`.
   - Se reemplazaron todas las referencias a `order.deliveryPersonId` y `order.deliveryPerson` por las nuevas variables de compatibilidad.
   - **Resultado:** Si la orden ya cuenta con un motorizado, se ocultan/deshabilitan correctamente los botones de **"Asignar Repartidor"** y **"Cancelar Orden"**, mostrando en su lugar el estado "En Reparto con: [Nombre de motorizado]".

5. **[useDeliveryDashboard.ts](file:///c:/Users/DMZ/Documents/DSI/e-commerce-v2/src/hooks/useDeliveryDashboard.ts)**
   - Se removió la automatización que forzaba el estado `busy` al tomar o listar órdenes activas.
