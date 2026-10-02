import type { ModoSuelto } from '../engine';

const MODOS: { id: ModoSuelto; nombre: string; detalle: string }[] = [
  { id: 'progresivo', nombre: 'Progresivo', detalle: 'Empieza liviano y va bajando: nivel 1, 2 y 3.' },
  { id: 'mezclado', nombre: 'Mezclado', detalle: 'Al azar entre las categorías activas.' },
  { id: 'categoria', nombre: 'Por categoría', detalle: 'Quien tiene el celular elige la próxima categoría.' },
];

interface Props { valor: ModoSuelto; onCambio: (m: ModoSuelto) => void }

export default function SelectorModo({ valor, onCambio }: Props) {
  return (
    <div role="radiogroup" aria-label="Modo de orden" className="flex flex-col gap-1.5">
      {MODOS.map((m) => {
        const activo = valor === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={activo}
            onClick={() => onCambio(m.id)}
            className="flex min-h-14 items-center gap-3 rounded-2xl bg-surface-2 px-3.5 py-2.5 text-left"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: activo ? 'var(--amber)' : 'var(--muted-2)' }}>
              {activo && <span className="h-2.5 w-2.5 rounded-full bg-amber" />}
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[15px] font-semibold">{m.nombre}</span>
              <span className="text-[13px] text-muted">{m.detalle}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
