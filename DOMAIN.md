# TripSplit — Dominio y Restricciones (Frontend)

## Dominio

TripSplit es una app para dividir gastos de viajes entre amigos. El frontend es una SPA con Next.js App Router que se comunica con un backend NestJS via REST API. La autenticacion la maneja Clerk (signup, login, logout, sesiones).

---

## Conceptos clave para la UI

### Trip (viaje)
Unidad principal de la app. Un grupo de personas que viajan juntas y comparten gastos.

- Tiene un **nombre**, fechas opcionales, y una **moneda base** (ej: USD, EUR).
- Puede estar **ACTIVE** (acepta gastos y pagos) o **FINALIZED** (solo lectura).
- Cada trip muestra: lista de participantes, gastos, pagos, y balances.

### Participation (participacion)
La relacion entre un usuario y un trip. Define que rol tiene.

- **CREATOR**: creo el trip. Puede cerrarlo, agregar/remover participantes.
- **SUPERVISOR**: permisos intermedios (definir segun necesidad).
- **MEMBER**: participante regular.
- Cada participante tiene un `currentBalance` que indica cuanto le deben (positivo) o cuanto debe (negativo).

### Expense (gasto)
Un gasto dentro de un trip. Ejemplo: "Cena en restaurante — $120".

- Tiene un `originalAmount` en una `originalCurrency`.
- Si la moneda es distinta a la moneda base del trip, se guarda un tipo de cambio (`exchangeRate`) y el monto convertido (`baseAmount`).
- Cada gasto tiene **detalles (ExpenseDetail)**: por cada participante, cuanto pago y cuanto le corresponde.

### ExpenseDetail (detalle de gasto)
Para cada gasto, cada participante tiene:
- `amountPaid`: lo que puso de su bolsillo.
- `amountOwed`: su parte justa del gasto.
- Balance neto = `amountPaid - amountOwed`. Positivo = le deben. Negativo = debe.

### Payment (pago)
Un pago directo para saldar deudas. Ejemplo: "Juan le paga $50 a Maria".
- `debtor`: quien paga (devuelve dinero).
- `creditor`: quien recibe.

---

## Reglas de Negocio que afectan la UI

### BR01 — Balances no son en tiempo real
Los balances se calculan en batch en el backend. Despues de crear un gasto o pago, los balances pueden no actualizarse inmediatamente. Considerar mostrar un estado de "recalculando" o hacer un refetch explicito.

### BR02 — Solo el creator controla el trip
En la UI, los botones de "Cerrar trip", "Agregar participante", "Remover participante" solo deben ser visibles/habilitados si el usuario actual tiene rol `CREATOR`.

### BR03 — Moneda base
Todos los montos mostrados en reportes y balances deben estar en la moneda base del trip. Si un gasto fue en otra moneda, mostrar ambos (original y convertido).

### BR03b — Simplificacion de deudas
La pantalla de "quien debe a quien" debe mostrar transacciones simplificadas (minimas), no todas las deudas individuales.

### BR04/BR05 — No se puede salir con deuda
Si un usuario intenta salir de un trip o el creator intenta removerlo, y su balance no es 0, la UI debe mostrar un error claro: "Debe saldar su deuda antes de salir".

---

## Restricciones Tecnicas

### Auth con Clerk
- `ClerkProvider` envuelve toda la app en `providers.tsx`.
- `clerkMiddleware()` en `middleware.ts` protege las rutas `/(authenticated)/*`.
- Las paginas `/sign-in` y `/sign-up` usan componentes de Clerk (`<SignIn />`, `<SignUp />`).
- El boton de **sign-out** esta en el `<UserButton />` del `TopBar` (siempre visible en rutas autenticadas).
- La pagina `/account` usa `<UserProfile />` de Clerk para gestionar el perfil.

### Token sync con el backend
- `AuthTokenSync` en `providers.tsx` captura la funcion `getToken()` de Clerk.
- `axios` tiene un interceptor que agrega el header `Authorization: Bearer <token>` en cada request.
- Si el backend responde 401, el interceptor redirige a `/sign-in`.

### API Client
- Usar siempre la instancia de axios de `@/lib/axios.ts` — ya tiene el token y el base URL configurado.
- Todas las respuestas del backend vienen envueltas en `{ data: ... }`. Al usar axios, el resultado real esta en `response.data.data`.

### Tipos
- Los tipos estan en `src/types/index.ts`. Actualmente solo existen `User` y `ApiResponse<T>`.
- Al implementar trips, expenses, payments: agregar las interfaces correspondientes ahi.

### State Management
- **Server state** (datos del backend): usar TanStack Query. Crear hooks en `src/hooks/` (ej: `use-trips.ts`, `use-expenses.ts`).
- **Client state** (UI): usar Zustand. Actualmente solo `ui-store.ts` (sidebar toggle).
- No duplicar datos del servidor en stores de Zustand.

### Validacion de formularios
- Usar Zod para definir schemas en `src/schemas/`.
- Usar React Hook Form con `@hookform/resolvers/zod` para conectar schemas a formularios.

### Precision numerica
Los montos vienen del backend como **strings** (porque son Decimal). Al mostrarlos en la UI:
- Usar `formatCurrency()` de `@/lib/utils.ts` para formato con moneda.
- Para calculos en el frontend (si fueran necesarios), convertir a `number` con cuidado o usar una libreria de precision decimal.
- Nunca mostrar mas de 2 decimales en montos.

### Rutas protegidas
Las siguientes rutas requieren autenticacion (definido en `middleware.ts`):
- `/dashboard`
- `/trips`
- `/expenses`
- `/payments`
- `/account`

Si un usuario no autenticado intenta acceder, se redirige a `/sign-in`.

---

## Estructura de la UI

### Layout autenticado
Todas las paginas autenticadas comparten:
- **Sidebar** (izquierda): navegacion principal (Dashboard, Trips, Expenses, Payments, Account).
- **TopBar** (arriba): boton hamburguesa (mobile) + UserButton de Clerk (sign-out).

### Paginas actuales

| Ruta | Estado | Descripcion |
|------|--------|-------------|
| `/` | Implementada | Landing page (redirige a /dashboard si autenticado) |
| `/sign-in` | Implementada | Login con Clerk |
| `/sign-up` | Implementada | Registro con Clerk |
| `/dashboard` | Placeholder | Cards vacias (Active Trips, Total Expenses, Your Balance) |
| `/trips` | Placeholder | Icono + "Trip management coming soon" |
| `/expenses` | Placeholder | Icono + "Expense tracking coming soon" |
| `/payments` | Placeholder | Icono + "Payment management coming soon" |
| `/account` | Implementada | Clerk UserProfile (gestionar perfil, cambiar password, etc.) |

### Convencion para implementar paginas nuevas
1. Crear el hook en `src/hooks/` (ej: `use-trips.ts`) con TanStack Query.
2. Crear el schema Zod en `src/schemas/` si hay formularios.
3. Agregar tipos en `src/types/index.ts`.
4. Crear componentes reutilizables en `src/components/` si aplica.
5. Implementar la pagina en `src/app/(authenticated)/`.
