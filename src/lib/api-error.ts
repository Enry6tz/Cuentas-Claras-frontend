import { NextResponse } from 'next/server';

/**
 * Error tipado para los route handlers del BFF que tienen lógica propia
 * (validación, auth) antes de reenviar al backend. Se traduce a la respuesta
 * canónica { error: { code, message, details } } vía handleApiError.
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const STATUS_CODE_NAMES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  500: 'INTERNAL_ERROR',
  502: 'BAD_GATEWAY',
};

export function statusCodeName(status: number): string {
  return STATUS_CODE_NAMES[status] ?? 'ERROR';
}

interface NestErrorBody {
  statusCode?: number;
  // Backend nuevo: error es un objeto { code, message, details }.
  // Backend viejo: error es un string corto ("Not Found") y el mensaje va en `message`.
  message?: string | string[];
  error?: string | { code?: string; message?: string; details?: unknown };
}

/**
 * Normaliza el error del backend al shape canónico del BFF:
 *   { error: { code, message, details } }
 *
 * Soporta dos formatos del backend:
 *  - Nuevo (Entregable 4): { error: { code, message, details } } -> se pasa tal cual.
 *  - Viejo / fallback: { statusCode, message, error } donde `message` puede ser
 *    string o array de errores de validación.
 */
export function normalizeBackendError(body: unknown, status: number) {
  const b = (body ?? {}) as NestErrorBody;

  // Caso ya-canónico: el backend nuevo manda error como objeto con code/message.
  if (b.error && typeof b.error === 'object') {
    return {
      error: {
        code: b.error.code ?? statusCodeName(status),
        message: b.error.message ?? 'Error inesperado',
        details: b.error.details,
      },
    };
  }

  // Fallback al formato viejo de NestJS ({ statusCode, message, error }).
  const rawMsg = b.message;
  const message = Array.isArray(rawMsg)
    ? rawMsg.join(', ')
    : (rawMsg ?? b.error ?? 'Error inesperado');
  const code = b.error
    ? b.error.replace(/\s+/g, '_').toUpperCase()
    : statusCodeName(status);
  const details = Array.isArray(rawMsg) ? { issues: rawMsg } : undefined;
  return { error: { code, message, details } };
}

/**
 * Convierte cualquier excepción de un route handler propio en una respuesta
 * JSON normalizada. Se usa en el catch de los handlers con lógica propia.
 */
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      { status: err.status },
    );
  }
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'Error inesperado' } },
    { status: 500 },
  );
}
