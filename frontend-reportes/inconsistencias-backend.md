# Inconsistencias Backend — Grupo A Frontend

## Inconsistencias encontradas y su resolución

### 1. Campo `balanceTotal` vs `totalBalance` (RESUELTA)

**Archivo afectado**: `src/lib/api/dashboard.ts`

| Lado | Campo |
|------|-------|
| Backend `DashboardEntity` | `balanceTotal: string` |
| Frontend `DashboardData` (antes de fix) | `totalBalance: string` |

**Impacto**: El balance del dashboard siempre mostraba `$0` porque `stats?.totalBalance` era `undefined`.

**Resolución**: Actualizado el tipo `DashboardData` en `dashboard.ts` para usar `balanceTotal`. Actualizada la referencia en `dashboard/page.tsx`.

---

### 2. `addParticipant` enviaba `email` en lugar de `userId` (RESUELTA)

**Archivo afectado**: `src/lib/api/participants.ts`

| Lado | Campo enviado |
|------|--------------|
| Backend `AddParticipantDto` | `userId: string (UUID)` |
| Frontend `addParticipant()` (antes de fix) | `{ email: string }` |

**Impacto**: Todos los intentos de agregar un participante fallaban con error de validación `400` (DTO inválido) porque el backend esperaba un UUID y recibía un email.

**Resolución**: 
- `src/lib/api/participants.ts`: cambio de `addParticipant(tripId, email)` → `addParticipant(tripId, userId)`; body cambiado de `{ email }` a `{ userId }`.
- `src/components/trips/add-participant-dialog.tsx`: cambio de `addParticipant(tripId, user.email)` → `addParticipant(tripId, user.id)`.

El flujo correcto ya existía: el dialog busca usuarios por email usando `GET /users/search?q=`, obtiene su `id` (UUID), y lo usa en el POST.

---

### 3. `recentActivity` no incluido en el tipo frontend (RESUELTA)

**Archivo afectado**: `src/lib/api/dashboard.ts`, `src/types/index.ts`

| Lado | Incluye `recentActivity` |
|------|--------------------------|
| Backend `DashboardEntity` | Sí — `recentActivity: ActivityItemEntity[]` |
| Frontend `DashboardData` (antes de fix) | No |

**Impacto**: El componente de actividad reciente siempre mostraba el placeholder "Sin actividad aún", ignorando los datos reales del backend.

**Resolución**: 
- Agregado tipo `ActivityItem` a `src/types/index.ts`.
- Agregado campo `recentActivity: ActivityItem[]` a `DashboardData`.
- Dashboard page actualizado para renderizar `stats.recentActivity` cuando está disponible.

---

## Observaciones sin inconsistencia (verificadas correctas)

| Item verificado | Estado |
|----------------|--------|
| Roles `CREATOR / SUPERVISOR / MEMBER` (frontend vs backend) | Consistentes |
| `TripStatus: ACTIVE / FINALIZED` | Consistente |
| Wrapper `{ data: T }` en todas las respuestas | Consistente — `unwrap()` en todos los API clients |
| Auth: Bearer JWT en header `Authorization` | Consistente |
| Soft-delete de trips (`deletedAt`) | Backend filtra `deletedAt: null`; frontend no necesita manejarlo |
| Manejo de 401 → redirect `/sign-in` | Consistente con backend (ClerkAuthGuard → 401) |
| `DELETE /trips/:id/participants/me` para abandonar | Consistente |
| Respuesta 204 para DELETE (sin body) | Correcto — `removeParticipant` y `leaveTrip` no esperan body |
| `balanceTotal` en participaciones es `string` (Decimal de Prisma) | Tipado correcto como `string` en `Participation.currentBalance` |

---

## Capacidades backend no presentes (fuera de scope Grupo A)

Estas son limitaciones conocidas del backend actual, no errores:

| Endpoint / Feature | Estado backend | Impacto UI |
|-------------------|---------------|------------|
| Balance real por usuario | `balanceTotal: '0.00'` hardcoded | Dashboard siempre muestra $0 — esperando Grupo B |
| Gastos (`/trips/:id/expenses`) | Stub sin implementar | `/expenses` muestra placeholder |
| Pagos (`/trips/:id/payments`) | Stub sin implementar | `/payments` muestra placeholder |
| Transferencia de ownership CREATOR | No implementado | CREATOR no puede abandonar; documentado en UI |
