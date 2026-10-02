import type { Nivel } from '../engine';

interface Props { nivel: Nivel; color?: string; tamano?: number; etiqueta?: boolean }

/** Tres puntos: rellenos = nivel, contorno = resto. */
export default function NivelPuntos({ nivel, color = 'currentColor', tamano = 7, etiqueta = true }: Props) {
  return (
    <span className="flex items-center" style={{ gap: tamano <= 6 ? 3 : 5 }} aria-label={etiqueta ? `Nivel ${nivel} de 3` : undefined} aria-hidden={!etiqueta}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="box-border rounded-full"
          style={{
            width: tamano, height: tamano,
            background: n <= nivel ? color : 'transparent',
            border: n <= nivel ? 'none' : `${tamano <= 6 ? 1.2 : 1.5}px solid ${color}`,
          }}
        />
      ))}
    </span>
  );
}
