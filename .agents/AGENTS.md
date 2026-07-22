# Reglas del Proyecto (Workspace Rules)

- **Confirmación Previa de Edición de Archivos:** Para cualquier modificación de código en el proyecto, siempre presentar la propuesta detallada al usuario y solicitar su validación previa antes de modificar los archivos.


## 1. Visión General & Stack
Sistema Full-Stack de e-commerce y gestión de pedidos.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **Frontend:** React, Vite, Tailwind CSS, TypeScript.
- **Gestor de paquetes:** `pnpm` (no usar `npm` ni `yarn`).

---

## 2. Comandos Obligatorios
Ejecuta estos comandos exactamente como se especifican:
- **Desarrollo:** `pnpm run dev`
- **Migraciones DB:** `npx prisma migrate dev`

---

## 3. Convenciones de Código y Patrones
- **TypeScript:** Cero tolerancia a `any`. Define interfaces o tipos explícitos para todo payload o respuesta.
- **Nombrado:**
  - Componentes React: `PascalCase` (ej. `OrderCard.tsx`).
  - Servicios y utilidades: `camelCase` (ej. `orderService.ts`).


- **Manejo de Errores:** Bloques `try/catch` centralizados en servicios. Lanza excepciones estructuradas (`AppError`).
- **Commits:** Sigue la convención Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`).

---

## 4. Reglas Operativas ("If / Then")
- **SI** modificas el esquema de la base de datos (`schema.prisma`):
  → Ejecuta inmediatamente `npx prisma generate` antes de tocar controladores o servicios.
- **SI** agregas una nueva ruta o endpoint de la API:
  → Crea/actualiza los tipos DTO correspondientes en `types/`.
- **SI** un comando de test falla:
  → Corrige el error antes de pasar a la siguiente tarea; nunca ignores un test fallido.

---

## 5. Límites y Seguridad
- **NUNCA** modifiques o expongas archivos de entorno (`.env`, `.env.local`).
- **NUNCA** alteres scripts de despliegue o infraestructura sin autorización explícita.
- **Pide confirmación** si una refactorización requiere borrar tablas o modificar más de 5 archivos simultáneamente.

---

## 6. Definition of Done (Criterios de Aceptación)
Antes de marcar una tarea como completada, el agente DEBE:
1. Ejecutar `pnpm typecheck` y asegurar 0 errores de compilación.
