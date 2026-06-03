# Integraciones Backend — Grupo A Frontend

## Arquitectura de integración

- **Base URL**: `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:3001`)
- **Auth**: Bearer JWT de Clerk, inyectado automáticamente por interceptor en `src/lib/axios.ts`
- **Wrapper de respuestas**: Todas las respuestas del backend vienen en `{ data: T }` (TransformInterceptor global)
- **Errores**: `{ message, statusCode, error? }` — el interceptor de respuesta redirige a `/sign-in` en 401 sin token

---

## Endpoints consumidos

### Auth / Usuarios

| Método | Endpoint | Archivo frontend | Descripción |
|--------|----------|-----------------|-------------|
| GET | `/users/me` | `src/lib/api/users.ts` → `getMe()` | Perfil del usuario autenticado |
| GET | `/users/search?q=` | `src/lib/api/users.ts` → `searchUsers()` | Búsqueda de usuarios por email (máx 10, ≥3 chars) |

### Viajes

| Método | Endpoint | Archivo frontend | Descripción |
|--------|----------|-----------------|-------------|
| GET | `/trips` | `src/lib/api/trips.ts` → `listTrips()` | Listar viajes del usuario |
| GET | `/trips/:id` | `src/lib/api/trips.ts` → `getTrip()` | Detalle del viaje con participaciones |
| POST | `/trips` | `src/lib/api/trips.ts` → `createTrip()` | Crear viaje (usuario queda como CREATOR) |
| PATCH | `/trips/:id` | `src/lib/api/trips.ts` → `updateTrip()` | Editar viaje (solo CREATOR) |
| DELETE | `/trips/:id` | `src/lib/api/trips.ts` → `deleteTrip()` | Soft-delete del viaje (solo CREATOR) |

### Integrantes

| Método | Endpoint | Archivo frontend | Descripción |
|--------|----------|-----------------|-------------|
| GET | `/trips/:id/participants` | `src/lib/api/participants.ts` → `listParticipants()` | Listar integrantes con user data |
| POST | `/trips/:id/participants` | `src/lib/api/participants.ts` → `addParticipant()` | Agregar integrante (`{ userId }` UUID) |
| PATCH | `/trips/:id/participants/:userId` | `src/lib/api/participants.ts` → `changeRole()` | Cambiar rol (`{ role }`) |
| DELETE | `/trips/:id/participants/:userId` | `src/lib/api/participants.ts` → `removeParticipant()` | Quitar integrante (balance=0) |
| DELETE | `/trips/:id/participants/me` | `src/lib/api/participants.ts` → `leaveTrip()` | Abandonar viaje (balance=0, no CREATOR) |

### Dashboard y Admin

| Método | Endpoint | Archivo frontend | Descripción |
|--------|----------|-----------------|-------------|
| GET | `/dashboard` | `src/lib/api/dashboard.ts` → `getDashboard()` | Estadísticas y actividad del usuario |
| GET | `/admin/trips` | `src/lib/api/dashboard.ts` → `getAdminTrips()` | Todos los viajes (solo admin global) |

---

## Flujo de agregar integrante (detalle)

El backend espera `{ userId: uuid }` en el body de `POST /trips/:id/participants`.

El flujo correcto implementado:
1. Usuario escribe email en `AddParticipantDialog`
2. Se hace debounce de 300ms y se llama `GET /users/search?q=<email>` (≥3 chars)
3. El resultado devuelve array de `UserPublic` con `{ id, name, email, avatarUrl }`
4. Al hacer click en "Agregar", se llama `addParticipant(tripId, user.id)` → POST con `{ userId: user.id }`

---

## Contratos de respuesta verificados

### GET /dashboard
```json
{
  "data": {
    "activeTrips": 2,
    "totalTrips": 5,
    "balanceTotal": "0.00",
    "recentActivity": [
      {
        "type": "expense",
        "description": "Cena",
        "amount": "150.00",
        "tripName": "Bariloche",
        "tripId": "uuid",
        "date": "2026-05-10T00:00:00.000Z"
      }
    ]
  }
}
```

### GET /trips/:id (con participaciones)
```json
{
  "data": {
    "id": "uuid",
    "name": "Bariloche",
    "participations": [
      {
        "id": "uuid",
        "userId": "uuid",
        "role": "CREATOR",
        "currentBalance": "0.00",
        "joinedAt": "...",
        "user": { "id": "uuid", "name": "Ana", "email": "...", "avatarUrl": null }
      }
    ]
  }
}
```

### POST /trips/:id/participants — Request
```json
{ "userId": "uuid" }
```

---

## Gestión de errores por código

| Status | Manejo en frontend |
|--------|--------------------|
| 400 | Toast "El viaje está finalizado" o mensaje del backend |
| 401 | Redirección a `/sign-in` (si no hay token) |
| 403 | Toast "No tenés permiso para realizar esta acción" |
| 404 | Toast "No se encontró ningún usuario" / "No se encontró el viaje" |
| 409 | Toast "El usuario ya es participante" / "El usuario tiene saldo pendiente" |

---

## Cache management (TanStack Query)

| Query Key | Invalidado por |
|-----------|---------------|
| `['dashboard']` | No invalidado manualmente — se refresca por `staleTime: 60s` |
| `['trips']` | `createTrip`, `updateTrip`, `deleteTrip` |
| `['trips', id]` | `updateTrip`, `deleteTrip` |
| `['trips', id, 'participants']` | `addParticipant`, `changeRole`, `removeParticipant`, `leaveTrip` |
| `['users', 'me']` | No invalidado — `staleTime: 5min` |
| `['users', 'search', q]` | No invalidado — `staleTime: 30s` |
| `['admin', 'trips']` | No invalidado — `staleTime: 60s` |
