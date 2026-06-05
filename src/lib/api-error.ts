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
  message?: string | string[];
  error?: string;
}

/**
 * Normaliza el error que devuelve NestJS ({ statusCode, message, error }, donde
 * message puede ser string o array de errores de validación) al shape canónico
 * del BFF: { error: { code, message, details } }.
 */
export function normalizeBackendError(body: unknown, status: number) {
  const b = (body ?? {}) as NestErrorBody;
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
