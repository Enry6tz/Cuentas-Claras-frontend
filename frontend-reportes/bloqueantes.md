# Bloqueantes — Grupo A Frontend

## Estado: Sin bloqueantes activos

Todos los requisitos de frontend de Grupo A están implementados e integrados con el backend existente.

---

## Dependencias de Grupo B (no bloqueantes para Grupo A)

Los siguientes items son responsabilidad de Grupo B y están fuera del alcance de Grupo A:

| Item | Impacto en Grupo A | Estado |
|------|-------------------|--------|
| Cálculo real de balances | `balanceTotal` siempre devuelve `"0.00"` (hardcoded en backend) | Esperando Grupo B |
| Módulo de gastos (`/expenses`) | Página es placeholder "coming soon" | Esperando Grupo B |
| Módulo de pagos (`/payments`) | Página es placeholder "coming soon" | Esperando Grupo B |

Cuando Grupo B implemente los endpoints de gastos y pagos, las páginas `/expenses` y `/payments` podrán completarse.

---

## Decisiones pendientes documentadas

### 1. Admin metadata claim exacto de Clerk
- **Contexto**: El frontend detecta admin con `user.publicMetadata?.role === 'admin'`
- **Backend**: `clerk-jwt.strategy.ts` lee `payload.public_metadata?.role === 'admin'`
- **Estado**: Ambos lados usan `role === 'admin'`. Requiere que el JWT template de Clerk tenga configurado `publicMetadata` correctamente.
- **Acción requerida**: Verificar que en el dashboard de Clerk la plantilla de JWT incluye `public_metadata` y que el admin tenga `role: "admin"` en su `publicMetadata`.

### 2. CREATOR no puede abandonar viaje
- **Backend**: Devuelve `400` con mensaje "El creador no puede abandonar el viaje. Transfiere la propiedad primero."
- **Frontend**: El componente `ParticipantActions` no muestra el botón "Salir" para el CREATOR (condición: `isCurrentUser && currentUserRole !== 'CREATOR'`). Consistente con el backend.
- **Estado**: Implementado correctamente. Sin bloqueante.

---

## Items resueltos (previamente potenciales bloqueantes)

| Item | Resolución |
|------|-----------|
| `addParticipant` enviaba `email` en lugar de `userId` | Corregido: ahora envía `{ userId: user.id }` |
| Dashboard leía campo inexistente `totalBalance` | Corregido: ahora lee `balanceTotal` |
| Actividad reciente no se renderizaba | Corregido: ahora renderiza `recentActivity` del backend |
| Botones Edit/Delete visibles a no-CREATOR | Corregido: condicionados a `isCreator` |
