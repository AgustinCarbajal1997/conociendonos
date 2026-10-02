interface PistaProps { activo: boolean; chico?: boolean }

/** Solo la pista del switch (decorativa); el control accesible lo pone quien la usa. */
export function SwitchPista({ activo, chico }: PistaProps) {
  const w = chico ? 44 : 52;
  const h = chico ? 26 : 32;
  const pulgar = chico ? 20 : 26;
  return (
    <span
      aria-hidden
      className="relative inline-block shrink-0 rounded-full transition-colors duration-[180ms]"
      style={{ width: w, height: h, background: activo ? 'var(--amber)' : 'var(--surface-2)' }}
    >
      <span
        className="absolute top-[3px] rounded-full transition-[left] duration-[180ms]"
        style={{ width: pulgar, height: pulgar, left: activo ? w - pulgar - 3 : 3, background: activo ? 'var(--on-amber)' : 'var(--muted-2)' }}
      />
    </span>
  );
}

interface Props {
  activo: boolean;
  onCambio: (v: boolean) => void;
  etiqueta: React.ReactNode;
  descripcion?: React.ReactNode;
}

/** Fila de opción con etiqueta, descripción y switch a la derecha. */
export default function Switch({ activo, onCambio, etiqueta, descripcion }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onCambio(!activo)}
      className="flex min-h-16 w-full items-center justify-between gap-4 text-left"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-base font-semibold">{etiqueta}</span>
        {descripcion && <span className="text-[13px] text-muted">{descripcion}</span>}
      </span>
      <SwitchPista activo={activo} />
    </button>
  );
}
