# Flujo de autenticación y datos — Cuentas Claras

Este documento explica paso a paso cómo viaja una petición GET desde que el usuario
abre una página hasta que los datos llegan al componente React, y cómo se transfiere
el JWT de Clerk para mantener la sesión sincronizada entre frontend y backend.

---

## Diagrama general

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Next.js)                         │
│                                                                     │
│  ┌──────────┐    ┌────────────┐    ┌──────────┐    ┌────────────┐  │
│  │ Clerk    │───>│ middleware  │───>│ Providers│───>│ Página     │  │
│  │ (sesión) │    │ (protege   │    │ (token   │    │ (useQuery) │  │
│  │          │    │  rutas)    │    │  sync)   │    │            │  │
│  └──────────┘    └────────────┘    └──────────┘    └─────┬──────┘  │
│                                                          │         │
│                                    ┌─────────────────────▼───────┐ │
│                                    │ axios interceptor           │ │
│                                    │ Authorization: Bearer <JWT> │ │
│                                    └─────────────┬───────────────┘ │
└──────────────────────────────────────────────────┼─────────────────┘
                                                   │ HTTP GET
                                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         BACKEND (NestJS)                             │
│                                                                      │
│  ┌───────┐    ┌──────────────┐    ┌────────────┐    ┌────────────┐  │
│  │ CORS  │───>│ ClerkAuth    │───>│ Controller │───>│ Transform  │  │
│  │ check │    │ Guard        │    │ + Service  │    │ Interceptor│  │
│  │       │    │ (valida JWT) │    │ (lógica)   │    │ {data:...} │  │
│  └───────┘    └──────┬───────┘    └────────────┘    └────────────┘  │
│                      │                                               │
│               ┌──────▼───────┐                                       │
│               │ ClerkJwt     │                                       │
│               │ Strategy     │                                       │
│               │ (JWKS + DB)  │                                       │
│               └──────────────┘                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Paso a paso: GET /users/me

### 1. El usuario navega a `/dashboard`

El browser hace un request a Next.js. Antes de llegar a la página, pasa por:

**`src/middleware.ts`** — Clerk middleware intercepta la request.

```ts
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)' /* ... */]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // ← redirige a /sign-in si no hay sesión
  }
});
```

- Si el usuario NO está autenticado → redirige a `/sign-in`.
- Si SÍ está autenticado → deja pasar. Clerk ya tiene la sesión (cookie `__session`).

---

### 2. Providers inyectan el token

Cuando la página carga, el árbol de componentes es:

```
ClerkProvider          ← maneja la sesión, expone useAuth()
  └─ QueryClientProvider  ← TanStack Query
       └─ TooltipProvider
            └─ AuthTokenSync   ←  conecta Clerk con axios
                 └─ {children}  ← las páginas
```

**`src/app/providers.tsx` → AuthTokenSync:**

```ts
function AuthTokenSync({ children }) {
  const { getToken } = useAuth(); // ← de Clerk

  useEffect(() => {
    setAuthToken(getToken); // ← registra getToken en axios
  }, [getToken]);

  return <>{children}</>;
}
```

Esto se ejecuta UNA vez al montar. Le pasa a axios la función `getToken` de Clerk
para que pueda pedir un JWT fresco en cada request.

---

### 3. El componente pide datos con TanStack Query

En un hook (por ejemplo `src/hooks/use-user.ts`):

```ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/users/me');
      return data.data; // ← el backend envuelve en { data: ... }
    },
  });
}
```

TanStack Query se encarga de:
- **Cache**: no repite la request si los datos tienen menos de 60s (`staleTime`).
- **Retry**: reintenta 1 vez si falla.
- **Estados**: devuelve `isLoading`, `isError`, `data` al componente.

---

### 4. Axios agrega el JWT automáticamente

**`src/lib/axios.ts`:**

```ts
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

export function setAuthToken(getToken: () => Promise<string | null>) {
  api.interceptors.request.use(async (config) => {
    const token = await getToken(); // ← pide JWT fresco a Clerk
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
```

El interceptor de request se ejecuta ANTES de cada llamada HTTP:
1. Llama a `getToken()` de Clerk → devuelve un JWT firmado con RS256.
2. Lo adjunta como `Authorization: Bearer eyJhbGciOi...`.
3. Si el token está por expirar, Clerk lo renueva automáticamente.

El interceptor de response maneja errores:
- Si el backend responde **401** → redirige a `/sign-in`.

**Request HTTP que sale:**
```
GET http://localhost:3001/users/me
Headers:
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5. CORS en el backend

**`src/main.ts`:**

```ts
app.enableCors({
  origin: 'http://localhost:3000', // ← solo acepta requests del frontend
  credentials: true,
});
```

Si el origin no coincide → el browser bloquea la response.

---

### 6. ClerkAuthGuard intercepta la request

El controller tiene `@UseGuards(ClerkAuthGuard)`:

```ts
@UseGuards(ClerkAuthGuard)
@Controller('users')
export class UsersController {
  @Get('me')
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
```

`ClerkAuthGuard` extiende `AuthGuard('clerk-jwt')` de Passport.
Esto activa la estrategia `ClerkJwtStrategy`.

---

### 7. ClerkJwtStrategy valida el JWT

**`src/auth/strategies/clerk-jwt.strategy.ts`:**

```ts
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ← saca el token del header
  secretOrKeyProvider: passportJwtSecret({
    jwksUri: `${issuerUrl}/.well-known/jwks.json`, // ← clave pública de Clerk
    cache: true,       // ← cachea las claves
    rateLimit: true,   // ← evita spam al JWKS endpoint
  }),
  issuer: issuerUrl,   // ← verifica que el issuer sea Clerk
  algorithms: ['RS256'],
});
```

Proceso de validación:
1. Extrae el token del header `Authorization: Bearer <token>`.
2. Descarga (o usa cache de) la clave pública JWKS de Clerk.
3. Verifica la firma RS256 del JWT.
4. Verifica que el `issuer` coincida con el dominio de Clerk.
5. Verifica que el token no esté expirado (`exp`).

Si alguna verificación falla → responde **401 Unauthorized**.

---

### 8. Strategy.validate() busca el usuario en la DB

Si el JWT es válido, Passport llama a `validate()` con el payload decodificado:

```ts
async validate(payload: { sub: string; email?: string; ... }) {
  // 1. Buscar usuario por clerkId
  let user = await this.prisma.user.findUnique({
    where: { clerkId: payload.sub },
  });

  // 2. Si no existe (webhook no llegó aún), crearlo
  if (!user) {
    user = await this.prisma.user.create({
      data: {
        clerkId: payload.sub,
        email: payload.email ?? `${payload.sub}@clerk.dev`,
        name: [payload.first_name, payload.last_name].filter(Boolean).join(' ') || 'User',
        avatarUrl: payload.image_url ?? null,
      },
    });
  }

  return user; // ← esto queda en request.user
}
```

El objeto `user` retornado se adjunta a `request.user` automáticamente por Passport.

---

### 9. @CurrentUser() extrae el usuario

**`src/common/decorators/current-user.decorator.ts`:**

```ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // ← el user que devolvió validate()
  },
);
```

El controller recibe directamente el registro de la DB:

```ts
@Get('me')
getProfile(@CurrentUser() user: User) {
  return user; // ← devuelve el user tal cual
}
```

---

### 10. TransformInterceptor envuelve la respuesta

**`src/common/interceptors/transform.interceptor.ts`:**

```ts
intercept(context, next) {
  return next.handle().pipe(
    map((data) => ({ data })) // ← envuelve en { data: ... }
  );
}
```

**Response HTTP:**
```json
{
  "data": {
    "id": "a1b2c3d4-...",
    "clerkId": "user_2x...",
    "name": "Enrique",
    "email": "enrique@example.com",
    "avatarUrl": "https://...",
    "createdAt": "2026-04-13T...",
    "updatedAt": "2026-04-13T..."
  }
}
```

---

### 11. La respuesta llega al frontend

De vuelta en el frontend, axios recibe la response:

```ts
const { data } = await api.get('/users/me');
// data = { data: { id, name, email, ... } }

return data.data;
// → { id, name, email, ... }
```

TanStack Query almacena el resultado en cache con la key `['user', 'me']`
y el componente se re-renderiza con los datos.

---

## Resumen del viaje completo

```
                            FRONTEND
┌──────────────────────────────────────────────────────┐
│ 1. middleware.ts      → protege la ruta              │
│ 2. AuthTokenSync      → conecta Clerk con axios     │
│ 3. useQuery()         → dispara la petición          │
│ 4. axios interceptor  → adjunta Bearer <JWT>         │
└────────────────────────────┬─────────────────────────┘
                             │
                        HTTP GET /users/me
                   Authorization: Bearer eyJ...
                             │
                             ▼
                           BACKEND
┌──────────────────────────────────────────────────────┐
│ 5. CORS               → verifica origin              │
│ 6. ClerkAuthGuard      → activa la strategy          │
│ 7. ClerkJwtStrategy    → valida JWT con JWKS         │
│ 8. validate()          → busca/crea user en DB       │
│ 9. @CurrentUser()      → inyecta user al controller  │
│ 10. Controller         → ejecuta lógica              │
│ 11. TransformInterceptor → envuelve en { data }      │
└────────────────────────────┬─────────────────────────┘
                             │
                    { data: { id, name, ... } }
                             │
                             ▼
                          FRONTEND
┌──────────────────────────────────────────────────────┐
│ 12. axios response     → data.data                   │
│ 13. TanStack Query     → cachea y devuelve al comp.  │
│ 14. Componente         → se renderiza con los datos  │
└──────────────────────────────────────────────────────┘
```

---

## Cómo crear un nuevo GET endpoint (guía rápida)

### Backend

```ts
// src/trips/trips.controller.ts
@Get()
@ApiOperation({ summary: 'Listar viajes del usuario' })
findAll(@CurrentUser() user: User) {
  return this.tripsService.findByUser(user.id);
}
```

### Frontend

```ts
// src/hooks/use-trips.ts
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data } = await api.get('/trips');
      return data.data;
    },
  });
}
```

```tsx
// src/app/(authenticated)/trips/page.tsx
const { data: trips, isLoading } = useTrips();
```

El JWT se inyecta automáticamente. No hay que hacer nada extra para la auth.
