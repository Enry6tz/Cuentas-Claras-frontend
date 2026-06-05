# MEGA-PROMPT — Rediseño visual de Cuentas Claras (frontend)

## Context

El frontend (`Cuentas-Claras-frontend`, Next.js 16 + React 19 + Tailwind v4 + shadcn estilo `base-nova` sobre `@base-ui/react` + lucide + Clerk) ya tiene **toda la lógica funcionando** (data fetching con react-query, forms con react-hook-form/zod, stores zustand, auth Clerk). Lo que falta es alinear la **capa visual** con los diseños entregados en `C:\Users\enriq\OneDrive\Desktop\cuentas-claras-disenio` (PNGs por pantalla).

Este documento **es el mega-prompt**: una guía de diseño + spec pantalla-por-pantalla, pensada para que un agente (o yo, en otra sesión) ejecute el rediseño de forma fiel. **No se implementa nada en esta sesión** (entregable acordado: solo el documento).

### Reglas duras (NO negociables)
1. **Solo cambios visuales.** No tocar: handlers, mutations, queries, validaciones zod, stores, rutas, llamadas API, props de datos. Solo cambia JSX de presentación + classNames Tailwind + tokens CSS.
2. **Reusar lo instalado.** Usar SIEMPRE los componentes de `src/components/ui/*` (shadcn ya generados) y `lucide-react`. No agregar dependencias nuevas.
3. **No tocar `account/page.tsx`** → queda el `<UserProfile/>` de Clerk como está (decisión del usuario). El diseño `perfil/*.png` es solo referencia futura, **fuera de alcance**.
4. **Fidelidad al diseño** dentro de lo razonable con los tokens del tema. Aproximar layout, jerarquía, colores, badges, iconos.
5. No cambiar textos/labels existentes salvo que el diseño muestre uno claramente distinto (los diseños están en español, el código ya está en español).

### Mapa diseño → código
| Carpeta diseño | Pantalla / archivo a tocar |
|---|---|
| `dashboard/` (`Inicio _ usuario`, `_ sin datos`, `_ Vista general _admin_`) | `src/app/(authenticated)/dashboard/page.tsx` (usuario + sin datos) y `admin/page.tsx` (vista admin) |
| `Inicio/` | duplicado de `dashboard/` (mismas imágenes) |
| `viaje/` (`Gastos lista/vacios`, `Pagos lista/vacios`, `Integrantes`, `Balances`) | `trips/[id]/page.tsx` + `expenses/payments/trips list` + `balances/*` + `trips/participants-list.tsx` |
| `gasto-form/` (`División Igual/Exacto/Porcentaje`, `Moneda preview`) | `expenses/expense-form-dialog.tsx` |
| `Detalle _ gasto-readonly.png` | (nuevo) detalle read-only de gasto — ver §3.7 |
| `pagos/` (`Registrar vacío`, `Prellenado`, `Validación`) | `payments/payment-form-dialog.tsx` |
| `integrantes-gestion/` (`Lista roles`, `Agregar`, `Cambiar rol`, `Confirmar quitar`, `Menú`, `Abandonar`) | `trips/participants-list.tsx`, `add-participant-dialog.tsx`, `participant-actions.tsx` |
| `perfil/` | **FUERA DE ALCANCE** (Clerk UserProfile) |

---

## 1. Design System — tokens (`src/app/globals.css`)

Ajustar el bloque `:root` para que `--primary` sea el azul royal del diseño (≈ Tailwind `blue-600`) en vez del índigo actual. Recalcular tints derivados sobre el mismo hue (~262.9).

```css
/* :root — reemplazar estas líneas */
--primary: oklch(0.546 0.245 262.881);        /* blue-600 */
--primary-foreground: oklch(0.985 0 0);
--secondary: oklch(0.962 0.026 262.881);       /* blue-50/100 tint */
--secondary-foreground: oklch(0.546 0.245 262.881);
--accent: oklch(0.962 0.026 262.881);
--accent-foreground: oklch(0.546 0.245 262.881);
--ring: oklch(0.546 0.245 262.881);
/* sidebar-primary / sidebar-ring / sidebar-accent → mismo blue-600 / tint */
```
`--success` (green) y `--warning` (amber) ya existen en `@theme inline` → reusarlos. `--destructive` (red) queda igual.

Verificación rápida del token: botón "Crear viaje" debe quedar azul vivo `#2563EB`-ish, no violeta.

---

## 2. Primitivos visuales compartidos (construir primero)

Estos patrones se repiten en casi todas las pantallas. Definirlos una vez y reusar.

### 2.1 Avatar con iniciales y color determinista — `src/lib/utils.ts`
Hoy los avatares usan `bg-primary/10 text-primary` (monocromo). El diseño usa **un color sólido por persona** con iniciales blancas. Agregar helpers puros (sin lógica de negocio):

```ts
const AVATAR_COLORS = [
  "bg-blue-600", "bg-emerald-600", "bg-red-500", "bg-violet-500",
  "bg-amber-600", "bg-teal-500", "bg-pink-500", "bg-indigo-500",
];
export function avatarColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
export function initials(name: string) {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p[1]?.[0] ?? "")).toUpperCase();
}
```
**Uso del seed:** usar un id estable (userId o email) como `seed` para que el color de cada persona sea consistente entre pantallas; las iniciales salen del nombre visible. Patrón de avatar reutilizable (con `AvatarFallback` del ui):
```tsx
<Avatar className="size-9">
  <AvatarFallback className={cn(avatarColor(p.userId), "text-white font-semibold")}>
    {initials(p.name)}
  </AvatarFallback>
</Avatar>
```
Tamaños vistos en diseño: `size-9` (listas/tablas), `size-7` (badges en tablas de gastos/pagos), `size-24` (perfil — fuera de alcance).

### 2.2 Status badge de viaje (usar `Badge`)
- **En curso / Activo** → punto verde + texto: `<Badge variant="secondary" className="bg-success/10 text-success border-transparent gap-1.5">` con `<span className="size-1.5 rounded-full bg-success" />` + "En curso".
- **Finalizado** → `<Badge variant="secondary" className="text-muted-foreground gap-1.5">` con punto gris.

### 2.3 Role badge / indicador de rol (tab Integrantes y tabla de gestión)
- **Creador** → badge sólido azul con icono `Crown`: `<Badge className="gap-1"><Crown className="size-3.5" />Creador</Badge>` (variant default = primary).
- **Supervisor** → `<Badge variant="secondary" className="gap-1"><Eye className="size-3.5" />Supervisor</Badge>`.
- **Miembro** → `<Badge variant="outline" className="gap-1"><User className="size-3.5" />Miembro</Badge>`.

### 2.4 Montos con color (helper de clase)
Positivo (te deben) → `text-success`; negativo (debés) → `text-destructive`; cero/saldado → `text-muted-foreground`. Prefijo `+`/`−` y formato ya existe en el código (reusar el formatter actual de `lib`). Para amounts grandes en cards: `text-3xl font-bold tabular-nums`.

### 2.5 Stat card (dashboard) — `Card` con barra superior de color
```tsx
<Card className="overflow-hidden">
  <div className="h-1 bg-primary" />            {/* o bg-success / bg-warning / bg-chart-2 */}
  <CardHeader className="flex-row items-start justify-between gap-2 pb-1">
    <div className="space-y-0.5">
      <p className="text-xs leading-tight text-muted-foreground">Viajes<br/>activos</p>
    </div>
    <div className="rounded-lg bg-primary/10 p-2 text-primary"><Plane className="size-4" /></div>
  </CardHeader>
  <CardContent className="space-y-1">
    <p className="text-3xl font-bold tabular-nums">3</p>
    <p className="text-xs text-muted-foreground">2 con saldo pendiente</p>
  </CardContent>
</Card>
```
Colores de barra por card (orden del diseño): primary(azul) · success(verde) · chart-2/success(verde) · warning(naranja).

### 2.6 Segmented control "Tipo de división" (Igual/Exacto/Porcentaje)
Usar `Tabs` variant default (pill) o un grupo de `Button` toggle. Activo = pill blanco con sombra sobre fondo `bg-muted`; inactivo = `text-muted-foreground`. Patrón con Tabs:
```tsx
<Tabs value={split} onValueChange={...}>
  <TabsList>                          {/* variant default → fondo bg-muted, pill */}
    <TabsTrigger value="EQUAL">Igual</TabsTrigger>
    <TabsTrigger value="EXACT">Exacto</TabsTrigger>
    <TabsTrigger value="PERCENT">Porcentaje</TabsTrigger>
  </TabsList>
</Tabs>
```
**OJO:** no cambiar los valores/estado que el form ya usa — solo envolver visualmente el control existente.

### 2.7 Caja preview de conversión de moneda (form de gasto)
Banda azul tenue, redondeada, con icono swap:
```tsx
<div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3">
  <ArrowLeftRight className="size-4 mt-0.5 text-primary" />
  <div className="space-y-0.5">
    <p className="text-sm"><span className="font-medium">USD 100,00</span> <span className="text-primary">→ ARS 18.500,00</span></p>
    <p className="text-xs text-muted-foreground">Tasa de cambio: 1 USD = 185,00 ARS · el reparto se calcula sobre el monto en moneda base.</p>
  </div>
</div>
```

### 2.8 Caja de nota informativa (dialogs de rol/quitar)
- Neutral (cambiar rol): `rounded-lg bg-muted p-4 text-sm text-muted-foreground`.
- Advertencia (confirmar quitar): `rounded-lg bg-warning/10 border border-warning/20 p-4 text-sm` + icono `AlertTriangle` `text-warning`.

---

## 3. Spec por pantalla

> Para cada pantalla: abrir el PNG de referencia indicado, replicar layout/jerarquía, reusar primitivos §2 y componentes `ui/*`. **No** alterar la lógica/estado existente del archivo.

### 3.1 Dashboard usuario — `dashboard/page.tsx`
Ref: `dashboard/Inicio _ usuario.png`, `Inicio _ sin datos.png`.
- **Header:** `h1` "Hola, {nombre}" `text-2xl font-bold` + subtítulo muted; a la derecha botón primary **"Crear viaje"** con icono `PlusCircle`.
- **Fila de 4 stat cards** (§2.5): grid `gap-4 sm:grid-cols-2 lg:grid-cols-4`. Cards: *Viajes activos / Balance total (verde) / Total gastado / Pagos pendientes (naranja)*.
- **Sección "Mis viajes":** `Card` contenedora con header "Mis viajes" + link "Ver todos ›" (botón ghost/outline sm). Adentro grid `sm:grid-cols-2 gap-4` de mini-cards de viaje: nombre + status badge (§2.2), monto grande con color (§2.4), sub-label ("Te deben"/"Debes"/"Saldado"), y abajo a la derecha contador de integrantes `Users` icon + n.
- **Sección "Actividad reciente":** `Card` con lista `divide-y`; cada fila: icono en cuadrado redondeado `bg-muted` a la izquierda, título (nombre bold + acción), subtítulo "Viaje · hace 2 h" muted, y a la derecha monto (label moneda chico + bold).
- **Sección "Acciones rápidas":** grid de 4 cards chicas, cada una con icono en círculo tintado + título + subtítulo. (Reusar handlers existentes.)
- **Estado sin datos** (`sin datos.png`): card grande centrada con icono `Plane` en círculo `bg-muted`, título "Comenzá tu primer viaje", texto, y botón primary "Crear viaje". Reusar el empty-state existente, restilizado.

### 3.2 Dashboard admin — `admin/page.tsx`
Ref: `dashboard/Inicio _ Vista general _admin_.png`.
- Header con `h1` "Hola, {nombre}" + **badge azul "Administrador"** (`Badge` con icono `ShieldCheck`) inline al lado del título. Subtítulo. Botón "Crear viaje" arriba a la derecha.
- Sub-encabezado: icono globo + "Vista general" + badge gris "Solo lectura" (`Lock` icon).
- **4 stat cards** (§2.5) con barra superior azul: *Viajes totales / Usuarios / Gastos registrados / Volumen total*.
- **Card "Últimos viajes del sistema"** con `Table` (`ui/table`): columnas Viaje (bold) · Creador (muted) · Integrantes (n, alineado) · Estado (status badge §2.2). Mantener la lógica de acceso/guard actual; restilizar la tabla y los badges.

### 3.3 Lista de viajes + vacíos — `trips/page.tsx` (y `expenses/page.tsx`, `payments/page.tsx` empties)
Ref: `viaje/Gastos _ vacios.png`, `Pagos _ vacios.png` (mismo patrón de empty).
- Header `h1` + descripción + botón primary "Nuevo viaje" (`Plus`).
- Grid `gap-4 sm:grid-cols-2 lg:grid-cols-3` de cards clickeables (`cursor-pointer transition-colors hover:bg-muted/50`): título + status badge, descripción `line-clamp-2`, footer con contadores (integrantes/gastos) + moneda.
- **Empty state:** card con icono en círculo tintado (`bg-success/10` para gastos, `bg-warning/10` para pagos), título + texto + botón. Reusar empties existentes restilizados.

### 3.4 Detalle de viaje — header + info + tabs — `trips/[id]/page.tsx`
Ref: `viaje/Integrantes.png`, `Gastos lista`, `Pagos lista`, `Balances`.
- **Header:** botón back (`ArrowLeft` ghost) opcional arriba; `h1` nombre del viaje `text-2xl font-bold` + status badge (§2.2) inline. Debajo, ubicación con icono `MapPin` muted. A la derecha: **"Editar"** (`Button variant="outline"` + `Pencil`) y **"Eliminar"** (`Button variant="outline"` o ghost con `text-destructive` + `Trash2`).
- **Fila de info cards:** un `Card`/contenedor bordeado dividido en 3 por separadores verticales: *Fechas* / *Moneda base* / *Integrantes* — cada uno label chico muted arriba + valor bold debajo. En grid `sm:grid-cols-3` con `divide-x`.
- **Tabs (line variant):** `TabsList` variant `line`; cada `TabsTrigger` = icono + label + **count badge** chico (ej. `Integrantes 5`). Activo = texto+underline azul + badge azul tenue. Triggers: Integrantes(`Users`), Gastos(`Receipt`), Pagos(`CreditCard`/`ArrowLeftRight`), Balances(`Scale`/`BarChart`). Mantener el estado de tab existente.

#### 3.4.a Tab Integrantes — `trips/participants-list.tsx`
Ref principal: `integrantes-gestion/Lista con roles y acciones.png` (versión rica). También `viaje/Integrantes.png` (versión simple).
- Sub-header dentro del card: "Integrantes" + "N personas en este viaje" (muted), a la derecha botón outline "Agregar integrante" (`UserPlus`).
- `Table` con columnas: **Integrante** (avatar §2.1 + nombre bold; abajo email muted; sufijo "· vos" si es el usuario actual) · **Rol** (role badge §2.3) · **Saldo** (monto con color §2.4) · **acciones** (menú 3 puntos `MoreVertical`, ver `participant-actions.tsx`).
- Mantener `ParticipantActions` (dropdown) tal cual la lógica; restilizar trigger a `Button variant="ghost" size="icon"`.

#### 3.4.b Tab Gastos — `expenses/expense-list.tsx`
Ref: `viaje/Gastos _ lista.png`.
- Sub-header "Gastos del viaje" + "N gastos registrados" + botón primary "Nuevo gasto" (`Plus`).
- `Table` columnas: **Descripción** (bold; debajo badge de categoría `Badge variant="secondary"` chico) · **Fecha** (muted) · **Pagó** (avatar `size-7` + nombre) · **División** (badge: Igual/Exacto → `outline`; Porcentaje → `secondary`) · **Monto** (bold derecha; debajo, si hay moneda original, línea chica muted "USD 100,00"). Fila clickeable → abre detalle read-only (§3.7) si ya existe ese handler; si no, no agregar lógica.

#### 3.4.c Tab Pagos — `payments/payment-list.tsx`
Ref: `viaje/Pagos _ lista.png`.
- Sub-header "Pagos" + "Transferencias entre integrantes para saldar deudas" + botón primary "Registrar pago".
- `Table` columnas: **De** (avatar `size-7` + nombre) · flecha `→` (`ArrowRight` muted) · **A** (avatar + nombre) · **Nota** (muted, "—" si vacío) · **Fecha** (muted) · **Monto** (bold). Layout De→A puede ir en una sola celda con flecha entre avatares.

#### 3.4.d Tab Balances — `balances/balance-summary.tsx` + `settlement-suggestions.tsx`
Ref: `viaje/Balances _ saldos _ liquidaci_n.png`.
- **Card "Saldos por integrante"** + subtítulo. Lista `divide-y`: avatar §2.1 + nombre bold + sub-label "Le deben"/"Debe" (verde/rojo); a la derecha icono trend (`TrendingUp`/`TrendingDown`) + monto con color §2.4. **Quitar los `bg-green-600`/`text-green-600`/`text-red-600` hardcodeados** → usar `text-success`/`text-destructive`.
- **Card "Liquidación sugerida"** + subtítulo. Filas: avatar(deudor) `→` avatar(acreedor) + nombres + monto + botón outline "Registrar pago" (`ArrowLeftRight`) que prellena (reusar handler existente). En `settlement-suggestions.tsx` reemplazar `bg-red-100/bg-green-100` por avatares §2.1.
- Footer: nota en caja muted "Con estos N pagos, todos los saldos quedan en cero…".

### 3.5 Form de gasto (dialog) — `expenses/expense-form-dialog.tsx`
Ref: `gasto-form/Divisi_n_ Igual.png`, `Exacto`, `Porcentaje`, `Moneda _ preview`.
- `DialogContent sm:max-w-lg max-h-[90vh] overflow-y-auto`. Header: "Nuevo gasto" + descripción "Registrá un gasto y elegí cómo dividirlo…".
- Campos (mantener react-hook-form intacto, solo restilizar): **Descripción** (Input full) · **Monto** + **Moneda** (`grid-cols-[1fr_auto]`/`grid-cols-2`, monto `text-right`) · **caja preview conversión §2.7** (cuando moneda ≠ base) · **Categoría** + **Fecha** (`grid-cols-2`).
- **"Tipo de división"** → segmented control §2.6.
- **Lista de participantes** en contenedor bordeado `rounded-lg border` con `divide-y`, filas `px-3 py-2.5`:
  - *Igual:* `Checkbox` + avatar + nombre + monto calculado (derecha, muted).
  - *Exacto:* avatar + nombre + "ARS" + `Input` chico `text-right` (derecha).
  - *Porcentaje:* avatar + nombre + `Input` `%` + monto calculado muted.
  - **Fila resumen** (fondo `bg-muted/50`): "N integrantes · cada uno paga" / "Suma asignada" / "Total asignado" → total con color verde si válido (`text-success`).
- **"¿Quién pagó?":** `Select` de pagador (avatar + nombre) + "ARS" + `Input` monto; link azul "+ Agregar pagador" (`Plus`, `Button variant="link"`).
- Footer: "Cancelar" (outline) + "Guardar gasto" (primary). Reusar estados disabled/loading existentes.

### 3.6 Form de pago (dialog) — `payments/payment-form-dialog.tsx`
Ref: `pagos/Registrar pago _ vac_o.png`, `Validaci_n_ deudor _ acreedor.png`, `Prellenado…`.
- `DialogContent sm:max-w-md`. Header "Registrar pago" + descripción "Los pagos se registran en moneda base (ARS). El deudor le transfiere al acreedor.".
- **Deudor** `Select` `→` **Acreedor** `Select` (`grid-cols-[1fr_auto_1fr]` con `ArrowRight` al medio). Cada select muestra avatar + nombre del seleccionado.
- **Validación deudor==acreedor:** ambos selects con `border-destructive` + texto error rojo con icono `X`: "El deudor y el acreedor deben ser distintos." (reusar la validación zod/estado existente; solo aplicar las clases de error).
- **Monto** (prefijo "ARS" + `Input` `text-right`) + **Fecha** (`grid-cols-2`). **Nota (opcional)** `Textarea` con placeholder.
- Footer: "Cancelar" (outline) + "Registrar pago" (primary; disabled = azul claro cuando inválido — el `Button` disabled ya da ese look).

### 3.7 Detalle de gasto read-only
Ref: `Detalle _ gasto-readonly.png`.
- **Verificar si ya existe** un dialog/handler de "ver gasto" en el código. Si existe → restilizar. **Si NO existe, NO crear lógica nueva** (queda como mejora futura; dejar el row de gasto sin acción nueva). El layout objetivo:
  - Header: descripción del gasto + badges (categoría `secondary`, división `outline`) + fecha con icono `Calendar`.
  - Caja "Monto total" (`bg-muted` rounded): monto grande derecha + línea chica "USD 100,00 · tasa 185,00".
  - "Reparto por integrante" → `Table`: Integrante (avatar+nombre) · Pagó · Debe (muted) · Saldo (color §2.4).
  - Footer: "Cerrar" (outline).

### 3.8 Agregar integrante (dialog) — `trips/add-participant-dialog.tsx`
Ref: `integrantes-gestion/Agregar _ resultados de b_squeda.png`, `Agregar _ buscador vac_o.png`.
- Header "Agregar integrante" + "Sólo podés sumar usuarios ya registrados en Cuentas Claras.".
- `Input` de búsqueda con icono `Search` absoluto a la izquierda; spinner `Loader2 animate-spin` a la derecha mientras carga.
- Resultados en lista `divide-y rounded-lg border`: avatar §2.1 + nombre/email; a la derecha **"Agregar"** (`Button size="sm" variant="outline"` + `Plus`) o, si ya está, badge disabled "Ya en el viaje" con `Check`.
- Footer: "Cerrar".

### 3.9 Cambiar rol (dialog) — dentro de `participant-actions.tsx`
Ref: `integrantes-gestion/Cambiar rol.png`.
- Header "Cambiar rol" + "Definí los permisos de {nombre} en este viaje.".
- Bloque persona: avatar grande (`size-12`) + nombre bold + email.
- "Rol" → `Select` (item con icono `User`).
- Caja nota neutral §2.8 con la explicación de roles.
- Footer: "Cancelar" (outline) + "Guardar cambios" (primary). Reusar la mutation existente.

### 3.10 Menú de acciones + Confirmar quitar — `participant-actions.tsx`
Ref: `integrantes-gestion/Men_ _ Quitar bloqueado.png`, `Confirmar quitar.png`, `Vista de Miembro _ Abandonar bloqueado.png`.
- **Dropdown** (`DropdownMenu`): item "Cambiar rol" (`ArrowLeftRight`) + item "Quitar" (`variant="destructive"`, `Trash2`; con icono `Lock` cuando está bloqueado por saldo≠0 — reusar la condición existente).
- **Dialog confirmar quitar:** header "Quitar integrante" + "Vas a quitar a {nombre} del viaje.". Bloque persona (avatar + nombre + email). Caja **warning §2.8**: "El integrante sólo puede quitarse si su saldo está en cero. Esta acción no se puede deshacer.". Footer: "Cancelar" (outline) + "Quitar" (`Button variant="destructive"` + `Trash2`).
- **Abandonar (vista miembro):** botón/acción "Salir" con `text-destructive`, mismo patrón de confirmación. Reusar lógica de permisos existente.

---

## 4. Orden de ejecución sugerido
1. **Tokens** §1 (globals.css) → cambia el look global de golpe.
2. **Primitivos** §2 (utils avatarColor/initials; patrones de badge/stat-card/segmented) → base reusable.
3. **Pantallas read-mostly:** dashboard §3.1, admin §3.2, trips list §3.3.
4. **Detalle de viaje** §3.4 (header/tabs + 4 tabs).
5. **Dialogs:** gasto §3.5, pago §3.6, agregar §3.8, rol/quitar §3.9–3.10.
6. **Limpieza:** reemplazar TODOS los colores hardcodeados (`bg-green-600`, `text-red-600`, `bg-red-100`, `bg-green-100`, `text-blue-600` en sidebar admin) por tokens (`text-success`, `text-destructive`, `text-primary`, avatares §2.1).

## 5. Verificación (manual, sin tests nuevos)
- `npm run dev` y recorrer cada ruta: `/dashboard`, `/admin`, `/trips`, `/trips/[id]` (4 tabs), abrir dialogs de gasto (Igual/Exacto/Porcentaje + moneda extranjera), pago (incl. caso deudor==acreedor para ver validación roja), agregar integrante, cambiar rol, quitar.
- Comparar lado a lado con el PNG correspondiente.
- `npm run lint` y `npm run build` sin errores nuevos.
- Confirmar que **ningún flujo cambió de comportamiento**: crear/editar/eliminar viaje, gasto, pago, cambio de rol, quitar integrante siguen funcionando igual (solo cambió el look).

## 6. Out of scope
- `account/page.tsx` (Clerk `<UserProfile/>` se mantiene).
- Detalle read-only de gasto §3.7 si no existe ya el handler (no crear lógica).
- Cualquier cambio de datos, API, validación o navegación.
