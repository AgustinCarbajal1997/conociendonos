function canal(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16);
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

export function contraste(a: string, b: string): number {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export const TEXTO_CLARO = '#FFFFFF';
export const TEXTO_OSCURO = '#141414';

/** Color de texto con mejor contraste sobre un fondo dado. */
export function textoSobre(fondo: string): string {
  return contraste(fondo, TEXTO_CLARO) >= contraste(fondo, TEXTO_OSCURO) ? TEXTO_CLARO : TEXTO_OSCURO;
}

/** Oscurece o aclara un color hex mezclándolo con negro/blanco. */
export function mezclarCon(hex: string, objetivo: string, cantidad: number): string {
  const a = parseInt(hex.replace('#', ''), 16);
  const b = parseInt(objetivo.replace('#', ''), 16);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * cantidad);
  const r = mix((a >> 16) & 255, (b >> 16) & 255);
  const g = mix((a >> 8) & 255, (b >> 8) & 255);
  const bl = mix(a & 255, b & 255);
  return '#' + ((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0');
}
