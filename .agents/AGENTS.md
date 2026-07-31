# Reglas del Proyecto (Workspace Rules)

## 1. Visión General & Stack
Sistema Full-Stack de e-commerce y gestión de pedidos.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **Frontend:** React, Vite, Tailwind CSS, TypeScript.
- **Gestor de paquetes:** `pnpm` (prohibido usar `npm` o `yarn`).

---

## 2. Comandos Obligatorios
- **Desarrollo:** `pnpm run dev`
- **Migraciones DB:** `pnpx prisma migrate dev`
- **Verificación de Tipos:** `pnpm typecheck`

---

## 3. Reglas Generales de Código
- **TypeScript:** Cero tolerancia a `any`. Define interfaces o tipos explícitos para todo payload, respuesta o prop.
- **Manejo de Errores:** Bloques `try/catch` centralizados. Lanza excepciones estructuradas (`AppError`).
- **Commits:** Sigue la convención Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`).

---

## 4. Estándares del FRONTEND (React + Vite + Tailwind)

### Arquitectura y Estado
- **Desacoplamiento UI / Lógica:** El JSX debe ser mayoritariamente declarativo. La lógica compleja, peticiones HTTP y manejo de estado deben aislarse en **Custom Hooks**.
- **Server State vs. Client State:** Usar librerías de Server State (ej. TanStack Query) para peticiones a la API. Prohibido usar `useEffect` + `useState` para fetching de datos directo a menos que se indique explícitamente.
- **Cero `useEffect` Innecesarios:** Si un dato se puede derivar o calcular durante el renderizado, hazlo directamente sin `useEffect`.
- **Co-localización del Estado:** Mantén el estado tan cerca de donde se usa como sea posible. No elevar estado al árbol global innecesariamente.

### UI y CSS
- **CSS sobre JS:** Delega animaciones, estados interactivos (`:hover`, `:focus-within`, `:active`) y adaptabilidad responsive a Tailwind CSS / CSS nativo antes que a handlers o estados de JS.
- **Keys Estables:** Prohibido usar el `index` de un array como `key` en listas dinámicas; usa siempre IDs únicos.

### Convención de Nombres (Frontend)
- Componentes y Hooks UI: `PascalCase` (ej. `OrderCard.tsx`).
- Custom Hooks: `camelCase` iniciando con `use` (ej. `useOrderDetails.ts`).

---

## 5. Estándares del BACKEND (Node.js + Express + Prisma)

### Arquitectura y Base de Datos
- **Arquitectura en Capas:** Separación estricta entre Rutas, Controladores, Servicios y Capa de Datos (Prisma).
- **Tipado DTO:** Toda ruta de entrada debe validar y tipar su `req.body`, `req.params` y `req.query`.
- **Sincronización de Esquema:** Al modificar `schema.prisma`, ejecutar de inmediato `npx prisma generate`.

### Convención de Nombres (Backend)
- Archivos de servicios, controladores y rutas: `camelCase` (ej. `orderService.ts`, `authController.ts`).
- Tablas y columnas en DB: Respetar las convenciones establecidas en `schema.prisma`.

---

## 6. Flujo de Trabajo y Auditoría por Módulo ("If / Then")

- **SI** se solicita implementar un nuevo módulo o feature:
  1. **Fase 1 (Implementación):** Genera la funcionalidad mínima operable y limpia.
  2. **Fase 2 (Auditoría Obligatoria):** Revisa el código buscando anti-patrones (vicios en `useEffect`, mezclas de UI/lógica, tipos implícitos, consultas innecesarias a DB).
  3. **Fase 3 (Refactor):** Aplica las optimizaciones detectadas.
  *Un módulo NO se da por completado ni se pasa al siguiente sin haber superado esta auditoría.*

- **SI** se agrega o modifica un endpoint de la API:
  → Crea o actualiza los tipos DTO correspondientes en `types/` que consumirá el Frontend.

- **SI** un comando de test o `typecheck` falla:
  → Corrige el error inmediatamente; nunca ignores un fallo de compilación.

---

## 7. Límites y Seguridad
- **NUNCA** modifiques o expongas archivos de entorno (`.env`, `.env.local`).
- **NUNCA** alteres scripts de despliegue o infraestructura sin autorización explícita.
- **Pide confirmación** si una refactorización requiere borrar tablas o modificar más de 5 archivos simultáneamente.

---

## 8. Definition of Done (Criterios de Aceptación)
Antes de dar por entregada cualquier tarea, el agente DEBE verificar:
1. Ejecutar `pnpm typecheck` con 0 errores de compilación.
2. Confirmar cumplimiento de la auditoría de buenas prácticas (Frontend/Backend según corresponda).
3. Haber presentado la propuesta de cambios y recibido aprobación previa antes de editar archivos.