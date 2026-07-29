# Plan de Ajuste de Estados Logísticos e Interfaz (Rutas Múltiples)

Este plan detalla los cambios para ocultar o deshabilitar las acciones de "Asignar Repartidor" y "Cancelar Orden" en el panel del Staff/Picker una vez que un pedido ya cuenta con un repartidor asignado.

## Problema Detectado
El componente `OrderCard.tsx` (tarjeta de pedido en el panel del Picker) lee la propiedad obsoleta `order.deliveryPersonId` para decidir si oculta los botones de cancelación y asignación. Como esa propiedad ya no existe en la raíz del modelo `Order` (ahora vive dentro de la relación `DeliveryJob`), el panel asume que nunca hay un repartidor asignado y deja los botones activos de forma errónea.

## Solución Propuesta

### 1. Backend (`orderRepository.ts`)
En todos los métodos de consulta de órdenes (`getAll`, `getById`, `getByCustomerId`, `updateStatus` y `assignDelivery`), actualizaremos la relación `deliveryJobs` para que incluya los datos de usuario del motorizado (`deliveryPerson`):
```typescript
deliveryJobs: { 
  orderBy: { assignedAt: "desc" }, 
  take: 1,
  include: { deliveryPerson: true }
}
```

### 2. Frontend (`OrderCard.tsx`)
Derivaremos el `deliveryPersonId` y el `deliveryPerson` localmente a partir del primer elemento del arreglo `order.deliveryJobs`:
```typescript
const activeJob = order.deliveryJobs?.[0];
const deliveryPersonId = activeJob && activeJob.status !== 'FAILED' ? activeJob.deliveryPersonId : undefined;
const deliveryPerson = activeJob && activeJob.status !== 'FAILED' ? activeJob.deliveryPerson : undefined;
```
Luego, reemplazaremos todas las llamadas a `order.deliveryPersonId` y `order.deliveryPerson` por las nuevas variables calculadas.

---

## Cambios Propuestos por Archivo

### [MODIFY] [orderRepository.ts](file:///c:/Users/DMZ/Documents/DSI/e-commerce-v2/server/api/repositories/orderRepository.ts)
* Modificar el include de `deliveryJobs` en las líneas 42, 59, 76, 135 y 309 para incluir `{ include: { deliveryPerson: true } }`.

### [MODIFY] [OrderCard.tsx](file:///c:/Users/DMZ/Documents/DSI/e-commerce-v2/src/components/staff/OrderCard.tsx)
* Definir las variables `deliveryPersonId` y `deliveryPerson` al inicio del componente.
* Reemplazar las 7 referencias a `order.deliveryPersonId` por la variable local `deliveryPersonId`.
* Reemplazar la referencia a `order.deliveryPerson` por la variable local `deliveryPerson`.

---

## Plan de Verificación
1. Ejecutar `pnpm lint` para comprobar que no existan errores de tipos.
2. Simular en la interfaz el flujo de asignación y validar que las tarjetas de pedidos asignados oculten el botón "Cancelar" y "Asignar Repartidor", mostrando en su lugar el cartel azul de "En Reparto con: [Nombre del Motorizado]".
