/** Respuesta paginada del backend (`{ items, total, page, limit, hasMore }`). */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/** Resumen de viaje embebido en gastos/pagos de las listas globales. */
export interface TripSummary {
  id: string;
  name: string;
  baseCurrency: string;
}
