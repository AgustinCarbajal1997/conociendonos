interface Props {
  activo: boolean;
  onCambio: (v: boolean) => void;
  etiqueta: string;
  descripcion?: string;
  id?: string;
}

export default function Switch({ activo, onCambio, etiqueta, descripcion, id }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      aria-label={etiqueta}
      id={id}
      onClick={() => onCambio(!activo)}
      className="flex w-full items-center justify-between gap-4 py-3 text-left"
    >
      <span>
        <span className="block text-base">{etiqueta}</span>
        {descripcion && <span className="block text-sm text-texto-suave">{descripcion}</span>}
      </span>
      <span
        aria-hidden
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${activo ? 'bg-acento' : 'bg-superficie-2 border border-borde'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-fondo transition ${activo ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}
