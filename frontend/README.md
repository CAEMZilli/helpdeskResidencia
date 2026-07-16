# CATI — Frontend

**CATI** (Centro de Atención Técnica Informática) es el sistema de helpdesk del
Departamento de Informática de la Secretaría del
Bienestar (Xalapa, Veracruz). Consume la API REST ya existente en la raíz de este
repositorio (`../server.ts`, documentada en `../openapi.yaml`).

## Stack

| Capa | Elección | Motivo |
|---|---|---|
| Build tool | Vite + React 18 + TypeScript | SPA simple, arranque rápido, encaja con un backend REST puro |
| Routing | React Router v6 | Rutas anidadas por rol con guards |
| Server state | TanStack Query v5 | Cache, invalidación tras mutaciones, y `refetchInterval` para el polling del técnico |
| Client state (sesión) | Zustand + `persist` | Guarda `{ user, token }` en `localStorage` |
| UI | Tailwind CSS v4 + shadcn/ui (Radix) | Componentes accesibles, consistentes, fáciles de ensamblar |
| Formularios | React Hook Form + Zod | Validación en cliente que espeja las reglas del backend |
| HTTP | Axios (instancia única + interceptors) | Inyecta el JWT y maneja 401 de forma centralizada |

## Requisitos

- Node.js 18+
- El backend corriendo (ver raíz del repo: `npm install`, configurar `.env` con
  `DATABASE_URL` y `JWT_SECRET`, `npx prisma migrate deploy`, `npx tsx server.ts`).
  Por defecto escucha en `http://localhost:3000`.

## Instalación y arranque

```bash
cd frontend
npm install
cp .env.example .env     # ajusta VITE_API_URL si el backend no corre en localhost:3000
npm run dev
```

La app queda disponible en `http://localhost:5173` (puerto por defecto de Vite).

```bash
npm run build   # build de producción (tsc -b && vite build)
npm run preview # sirve el build de producción localmente
```

## Cómo darse de alta el primer usuario

El backend no tiene registro público: los usuarios se crean desde el panel de
**Administrador → Usuarios → Nuevo usuario**, que usa `POST /api/user`. Como ese
endpoint hoy no exige JWT (ver "Limitaciones conocidas" abajo), para arrancar el
sistema desde cero puedes crear el primer usuario `ADMINISTRADOR` directamente con
`curl`/Postman contra `POST /api/user` (necesitas al menos un `Departamento` creado
antes; también se puede insertar directo en la base de datos con Prisma Studio).
Una vez que exista un admin, el resto de usuarios se gestiona desde la UI.

## Datos de prueba

Para poblar la base con departamentos, usuarios, máquinas y tickets ficticios
(con fechas de creación/cierre históricas, no solo "ahora"), corre desde la
raíz del backend:

```bash
npx tsx scripts/seed-demo.ts
```

Es idempotente — se puede volver a correr sin duplicar lo que ya haya creado.
Al final imprime las credenciales de los usuarios nuevos (todos con la misma
contraseña, indicada en el propio script).

## Arquitectura

```
src/
  api/          # una función por endpoint de la API (axios), sin lógica de UI
  hooks/        # TanStack Query hooks (useTickets, useUsers, useDepartments, useCatServices)
  store/        # authStore (zustand persist): user, token, login/logout
  types/        # tipos que reflejan los modelos de prisma/schema.prisma
  constants/    # roles.ts: labels, colores de estatus, flujo de estatus, home por rol
  components/
    ui/         # primitivas shadcn/ui (button, input, select, table, dialog...)
    layout/     # ProtectedRoute, AppShell (sidebar + topbar reutilizado por los 3 roles)
    tickets/    # TicketStatusBadge y demás piezas compartidas de tickets
    users/      # RoleSelect, UserFormDialog
  pages/
    LoginPage.tsx
    usuario/    # NewTicketPage, MyTicketsPage
    tecnico/    # TicketQueuePage (con polling)
    admin/      # DashboardPage, UsersPage, DepartmentsPage, CatServicesPage
```

### Autenticación y sesión

1. `LoginPage` llama a `POST /api/auth/login` y guarda `{ user, token }` en
   `authStore` (persistido en `localStorage`, sobrevive a refrescos de página).
2. El interceptor de request de `apiClient` (`src/api/client.ts`) agrega
   `Authorization: Bearer <token>` a **todas** las peticiones, incluidas las de
   `/api/user` — aunque hoy ese recurso no lo exija, así el frontend queda listo
   para cuando se proteja.
3. El interceptor de response detecta `401`, limpia la sesión y redirige a
   `/login`.
4. `ProtectedRoute` (`src/components/layout/ProtectedRoute.tsx`) bloquea rutas
   sin token y redirige a usuarios autenticados con un rol distinto hacia su
   propio home (`/admin`, `/tecnico`, `/usuario`).

### Por qué polling y no WebSockets

El backend actual es REST puro (Express) sin ningún mecanismo de push
(no hay Socket.io, SSE, etc.) y, por decisión explícita, no se modificó para este
trabajo. Para que el panel del técnico se sienta "en vivo", `useTickets({ poll: true })`
usa `refetchInterval` de TanStack Query (cada 8s) además de `refetchOnWindowFocus`.
Es una solución simple que no requiere tocar el servidor. Si en el futuro se agrega
un servidor de WebSockets/SSE, basta con reemplazar ese hook por una suscripción y
quitar el polling, sin tocar el resto de la UI (los componentes solo consumen el
hook, no el mecanismo de transporte).

### Roles y permisos

`Usuario.rol` es un `string` libre en el backend (no hay enum ni validación de
valores permitidos, y **no hay ningún middleware de autorización por rol** —
cualquier usuario autenticado puede llamar cualquier endpoint protegido). El
frontend define la lista cerrada de roles válidos en `src/types/index.ts`
(`ADMINISTRADOR`, `TECNICO`, `USUARIO`) y toda la restricción de acceso (rutas,
botones, navegación) vive exclusivamente en el cliente. Esto es adecuado para la
UI, pero **no reemplaza controles de seguridad del lado del servidor**.

### Sin filtrado server-side

Ningún `GET` de la API acepta query params de filtrado (ni por estatus, ni por
usuario asignado, ni por creador). Todas las pantallas de listado
(`MyTicketsPage`, `TicketQueuePage`, `DashboardPage`) traen la lista completa vía
TanStack Query y filtran/agrupan en el cliente con `useMemo`. Es razonable para el
volumen de tickets de una dependencia de gobierno estatal; si el volumen creciera
mucho, valdría la pena agregar paginación/filtrado en el backend.

## Limitaciones conocidas (heredadas del backend, por decisión del equipo)

- **`/api/user` no requiere JWT.** Se registra antes del `authMiddleware` en
  `server.ts`. Es una decisión temporal para facilitar el testeo; el plan es
  protegerlo una vez terminado el proyecto. El frontend ya envía el header
  `Authorization` en esas llamadas para no requerir cambios cuando se corrija.
- **No hay autorización por rol en el backend.** Un usuario con rol `USUARIO`
  podría, llamando la API directamente (no desde esta UI), hacer lo mismo que un
  `ADMINISTRADOR`. Toda restricción de rol en esta app es solo de experiencia de
  usuario, no un control de seguridad real.
- **`GET /api/user` devuelve el hash de `password`** en el JSON. El cliente API
  (`src/api/users.ts`) lo descarta explícitamente al mapear la respuesta para que
  nunca llegue a un componente ni se guarde en cache.
- **Sin WebSockets**: ver sección de polling arriba.

## Flujo funcional por rol

- **Usuario** (`/usuario`): crea tickets (`Nuevo ticket`) seleccionando un
  servicio del catálogo y, opcionalmente, una máquina de su propio departamento
  (el departamento se toma automáticamente del usuario, no se selecciona); y
  consulta el estatus de los suyos en `Mis tickets` (solo lectura, con
  departamento y máquina visibles).
- **Técnico** (`/tecnico`): ve dos columnas — tickets sin asignar (puede
  "tomarlos") y tickets asignados a él (puede avanzar su estatus siguiendo el
  flujo `ABIERTO → EN_PROGRESO → ATENDIDO → CERRADO`), con el departamento y la
  máquina reportada visibles en cada tarjeta. Se refresca solo cada 8s.
  En `/tecnico/historial` ve únicamente los tickets que **él mismo** cerró,
  con fecha de creación, fecha de cierre y duración calculada.
- **Administrador** (`/admin`): dashboard con conteo de tickets por técnico y
  estatus, tabla de todos los tickets con filtros (incluye departamento,
  máquina, fecha de creación y de cierre); gestión de usuarios (alta, cambio
  de rol, activar/desactivar, baja); CRUD de departamentos, de máquinas
  (`/admin/maquinas`) y del catálogo de servicios.

## Ticket: fecha de cierre

`Ticket.fechaCierre` (nullable) se gestiona enteramente en el backend
(`src/controllers/ticketControllers.ts` → `updateTicket`): se registra
automáticamente al cambiar `status` a `CERRADO`, y se limpia si el ticket se
reabre a cualquier otro estatus. El frontend nunca la envía manualmente —
solo la muestra formateada con `formatDateTime`/`formatDuration`
(`src/lib/utils.ts`).

## Ticket: departamento y máquina

- El **departamento** de un ticket no es un campo propio — se deriva de la
  relación `Ticket.creadoPor → Usuario.departamento`, que ya existía en el
  backend. Solo hizo falta anidar el `include` de Prisma en
  `src/services/ticketServices.ts` (backend) para exponerlo; no requirió
  migración.
- La **máquina** sí es un campo nuevo y opcional (`Ticket.maquinaId`, migración
  `add_maquina_to_ticket`), ya que no todos los problemas están atados a un
  equipo específico. El selector en `NewTicketPage` solo muestra máquinas del
  mismo departamento del usuario (vía `useCurrentUser` + `useMachines`).
- El catálogo de máquinas se administra en `/admin/maquinas` (CRUD completo,
  igual que Departamentos y Catálogo de servicios).
