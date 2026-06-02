# Progreso — Grupo A Frontend

## Fecha: 2026-06-02

## Estado general: COMPLETO ✅

---

## Feature 1 — Autenticación y Perfil

| Elemento | Estado |
|----------|--------|
| Clerk SignIn page (`/sign-in`) | ✅ Ya implementado |
| Clerk SignUp page (`/sign-up`) | ✅ Ya implementado |
| Auth token sync con axios (JWT Bearer) | ✅ Ya implementado |
| Middleware Clerk protegiendo rutas autenticadas | ✅ Ya implementado |
| Cuenta del usuario (`/account`) via Clerk UserProfile | ✅ Ya implementado |
| API client `getMe()` y `searchUsers()` | ✅ Ya implementado |
| Redirección 401 a `/sign-in` | ✅ Ya implementado |

---

## Feature 2 — Viajes

| Elemento | Estado |
|----------|--------|
| Página listado `/trips` | ✅ Ya implementado |
| Página detalle `/trips/[id]` | ✅ Ya implementado |
| Crear viaje (dialog + POST /trips) | ✅ Ya implementado |
| Editar viaje (dialog + PATCH /trips/:id) | ✅ Ya implementado |
| Eliminar viaje (confirm dialog + DELETE /trips/:id) | ✅ Ya implementado |
| Botones Editar/Eliminar restringidos a CREATOR | ✅ Corregido en esta sesión |
| Estados: loading, error, vacío, success | ✅ Ya implementado |

---

## Feature 3 — Integrantes

| Elemento | Estado |
|----------|--------|
| `ParticipantsList` component | ✅ Ya implementado |
| `AddParticipantDialog` component | ✅ Ya implementado |
| `ParticipantActions` component | ✅ Ya implementado |
| API client `listParticipants()` | ✅ Ya implementado |
| API client `addParticipant()` — contrato corregido | ✅ Corregido en esta sesión |
| API client `changeRole()` | ✅ Ya implementado |
| API client `removeParticipant()` | ✅ Ya implementado |
| API client `leaveTrip()` | ✅ Ya implementado |
| Búsqueda de usuario por email → `userId` para POST | ✅ Corregido en esta sesión |
| Roles CREATOR/SUPERVISOR/MEMBER con badges | ✅ Ya implementado |
| Balance por participante | ✅ Ya implementado |
| Estados: loading (skeleton), error, vacío, success | ✅ Ya implementado |
| Manejo de error 409 (ya participante) | ✅ Ya implementado |
| Manejo de error 409 (balance ≠ 0) | ✅ Ya implementado |

---

## Feature 4 — Dashboard y Admin Global

| Elemento | Estado |
|----------|--------|
| Página dashboard `/dashboard` | ✅ Ya implementado |
| Stats cards (viajes activos, total, balance) | ✅ Ya implementado |
| Campo `balanceTotal` corregido (era `totalBalance`) | ✅ Corregido en esta sesión |
| Actividad reciente renderizada con datos reales | ✅ Corregido en esta sesión |
| Skeleton loading en actividad reciente | ✅ Nuevo en esta sesión |
| Panel admin (visible solo si `role === 'admin'`) | ✅ Ya implementado |
| Admin fetching de GET /admin/trips | ✅ Ya implementado |
| Links a trip detail desde admin panel | ✅ Ya implementado |
| Quick actions (nuevo viaje, mis viajes) | ✅ Ya implementado |
| Detección admin via `user.publicMetadata.role` | ✅ Ya implementado |

---

## Correcciones aplicadas en esta sesión

1. **Bug crítico**: `addParticipant` enviaba `{ email }` en lugar de `{ userId }` — el backend espera UUID.
2. **Bug crítico**: `AddParticipantDialog` llamaba `addParticipant(tripId, user.email)` en lugar de `addParticipant(tripId, user.id)`.
3. **Bug medio**: `DashboardData` interface tenía campo `totalBalance` pero el backend devuelve `balanceTotal`.
4. **Bug medio**: Dashboard page leía `stats?.totalBalance` (siempre undefined) en lugar de `stats?.balanceTotal`.
5. **Mejora UX**: Dashboard "Actividad reciente" mostraba placeholder hardcoded; ahora renderiza `recentActivity` del backend.
6. **Bug UX**: Trip detail mostraba botones Editar/Eliminar a todos los usuarios; ahora solo al CREATOR.
7. **Bug lint**: `trip-form-dialog.tsx` tenía `setState` síncrono dentro de `useEffect`; refactorizado a lazy initializers + `key` en `DialogContent`.
8. **Nuevo tipo**: `ActivityItem` agregado a `src/types/index.ts`.
