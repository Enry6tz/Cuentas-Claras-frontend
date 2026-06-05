import type { CSSProperties } from 'react';

/**
 * Apariencia de un viaje. En la base se guardan ids numéricos (1..30) tanto
 * para el emoji como para el color; el front mapea esos ids a su valor.
 */

export const DEFAULT_ICON_ID = 1;
export const DEFAULT_COLOR_ID = 1;

// 30 emojis seleccionables (id = índice + 1).
export const TRIP_ICONS: string[] = [
  '✈️', '🏖️', '🏔️', '🗺️', '🎒',
  '🏕️', '🚗', '🚐', '⛵', '🚢',
  '🏝️', '🌋', '🗽', '🏰', '🎡',
  '🎢', '🍻', '🍣', '🍕', '🥾',
  '🚲', '🏍️', '🚂', '🛩️', '🌴',
  '⛺', '🧳', '🌅', '🎉', '🐾',
];

// 30 colores seleccionables (id = índice + 1).
export const TRIP_COLORS: { id: number; name: string; hex: string }[] = [
  { id: 1, name: 'Rojo', hex: '#f4504d' },
  { id: 2, name: 'Coral', hex: '#ff6b6b' },
  { id: 3, name: 'Naranja', hex: '#f2994a' },
  { id: 4, name: 'Ámbar', hex: '#f2c94c' },
  { id: 5, name: 'Lima', hex: '#bfe34c' },
  { id: 6, name: 'Verde', hex: '#27ae60' },
  { id: 7, name: 'Esmeralda', hex: '#1abc9c' },
  { id: 8, name: 'Turquesa', hex: '#2dd4bf' },
  { id: 9, name: 'Cielo', hex: '#56ccf2' },
  { id: 10, name: 'Azul', hex: '#2f80ed' },
  { id: 11, name: 'Índigo', hex: '#5b8def' },
  { id: 12, name: 'Violeta', hex: '#6c5ce7' },
  { id: 13, name: 'Púrpura', hex: '#9b51e0' },
  { id: 14, name: 'Orquídea', hex: '#bb6bd9' },
  { id: 15, name: 'Magenta', hex: '#e056fd' },
  { id: 16, name: 'Rosa', hex: '#eb5fa8' },
  { id: 17, name: 'Fucsia', hex: '#ff6fb5' },
  { id: 18, name: 'Salmón', hex: '#f178b6' },
  { id: 19, name: 'Ladrillo', hex: '#e67e22' },
  { id: 20, name: 'Mostaza', hex: '#d4a017' },
  { id: 21, name: 'Oliva', hex: '#9aa84a' },
  { id: 22, name: 'Pino', hex: '#16a085' },
  { id: 23, name: 'Océano', hex: '#0e7490' },
  { id: 24, name: 'Acero', hex: '#3498db' },
  { id: 25, name: 'Cobalto', hex: '#2d6bed' },
  { id: 26, name: 'Lavanda', hex: '#8e7cff' },
  { id: 27, name: 'Berenjena', hex: '#8e44ad' },
  { id: 28, name: 'Frambuesa', hex: '#e84393' },
  { id: 29, name: 'Grafito', hex: '#636e72' },
  { id: 30, name: 'Pizarra', hex: '#2d3436' },
];

export function tripIcon(id?: number | null): string {
  const idx = (id ?? DEFAULT_ICON_ID) - 1;
  return TRIP_ICONS[idx] ?? TRIP_ICONS[DEFAULT_ICON_ID - 1];
}

export function tripColorHex(id?: number | null): string {
  const idx = (id ?? DEFAULT_COLOR_ID) - 1;
  return (TRIP_COLORS[idx] ?? TRIP_COLORS[DEFAULT_COLOR_ID - 1]).hex;
}

/** Gradiente sutil para el banner del viaje (estilo Notion). */
export function tripBannerStyle(id?: number | null): CSSProperties {
  const hex = tripColorHex(id);
  return {
    background: `linear-gradient(165deg, color-mix(in oklab, ${hex} 92%, white), color-mix(in oklab, ${hex} 84%, black))`,
  };
}
