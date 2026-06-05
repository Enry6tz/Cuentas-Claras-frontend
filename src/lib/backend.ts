import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { normalizeBackendError } from '@/lib/api-error';

/**
 * URL del backend NestJS. Server-only (no NEXT_PUBLIC) cuando se define
 * BACKEND_URL; cae a NEXT_PUBLIC_API_URL por compatibilidad con el setup previo.
 */
const BACKEND_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';

/**
 * Reenvía la request entrante al backend NestJS (patrón BFF), adjuntando el JWT
 * de Clerk del usuario logueado (resuelto server-side con `auth()`).
 *
 * - Desenvuelve el envelope `{ data }` del backend → el contrato del BFF hacia
 *   el frontend es el DTO crudo.
 * - Normaliza los errores del backend al shape canónico { error: { code, ... } }.
 * - El path al backend se deriva de la URL entrante: `/api/v1/<x>` → `/<x>`.
 *
 * Cada route handler en `src/app/api/v1/...` delega acá, exponiendo sólo los
 * métodos HTTP que esa ruta debe permitir.
 */
export async function forward(request: NextRequest): Promise<Response> {
  const { getToken } = await auth();
  const token = await getToken();

  const url = new URL(request.url);
  const backendPath = url.pathname.replace(/^\/api\/v1/, '');
  const target = `${BACKEND_URL}${backendPath}${url.search}`;

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: string | undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const text = await request.text();
    if (text) {
      body = text;
      headers['Content-Type'] = 'application/json';
    }
  }

  let res: Response;
  try {
    res = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      {
        error: {
          code: 'BACKEND_UNREACHABLE',
          message: 'No se pudo conectar con el servidor',
        },
      },
      { status: 502 },
    );
  }

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await res.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    return NextResponse.json(normalizeBackendError(payload, res.status), {
      status: res.status,
    });
  }

  // NestJS envuelve todo en { data: ... } (TransformInterceptor global). El
  // contrato del BFF hacia el frontend es el DTO crudo, sin ese envelope.
  const data =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: unknown }).data
      : payload;

  return NextResponse.json(data, { status: res.status });
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
