import { useRef, useState } from 'react';
import type { PointerEvent, ReactNode } from 'react';
import { Agarre, ChevronAbajo } from './Icono';

export interface ItemReordenable { id: string; etiqueta: string; detalle?: string; inactivo?: boolean; indicador?: ReactNode }

interface Props { items: ItemReordenable[]; onReordenar: (ids: string[]) => void }

function mover<T>(arr: T[], de: number, a: number): T[] {
  const copia = arr.slice();
  const [item] = copia.splice(de, 1);
  copia.splice(a, 0, item);
  return copia;
}

/** Filas arrastrables por pointer events (funciona en touch), con flechas como alternativa accesible. */
export default function ListaReordenable({ items, onReordenar }: Props) {
  const [arrastrando, setArrastrando] = useState<string | null>(null);
  const filas = useRef(new Map<string, HTMLLIElement>());
  const ids = items.map((i) => i.id);

  const alMover = (e: PointerEvent) => {
    if (!arrastrando) return;
    const idx = ids.indexOf(arrastrando);
    let destino = idx;
    ids.forEach((id, j) => {
      const r = filas.current.get(id)?.getBoundingClientRect();
      if (!r || j === idx) return;
      const medio = r.top + r.height / 2;
      if (j < idx && e.clientY < medio) destino = Math.min(destino, j);
      if (j > idx && e.clientY > medio) destino = Math.max(destino, j);
    });
    if (destino !== idx) onReordenar(mover(ids, idx, destino));
  };
  const soltar = () => setArrastrando(null);

  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0" onPointerMove={alMover} onPointerUp={soltar} onPointerCancel={soltar}>
      {items.map((item, i) => (
        <li
          key={item.id}
          ref={(el) => { if (el) filas.current.set(item.id, el); else filas.current.delete(item.id); }}
          className={`flex h-[60px] items-center gap-2 rounded-2xl bg-surface-2 pl-1 pr-3 transition ${item.inactivo ? 'opacity-50' : ''}`}
          style={arrastrando === item.id ? { boxShadow: '0 0 0 2px var(--amber)' } : undefined}
        >
          <button
            type="button"
            aria-label={`Arrastrar ${item.etiqueta}`}
            className="flex h-11 w-9 cursor-grab touch-none items-center justify-center text-muted-2"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setArrastrando(item.id); }}
            onPointerUp={soltar}
          >
            <Agarre tamano={20} />
          </button>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-base font-semibold">{item.etiqueta}</span>
            {item.detalle && <span className="truncate text-[13px] text-muted">{item.detalle}</span>}
          </span>
          {item.indicador}
          <span className="ml-1 flex flex-col">
            <button type="button" aria-label={`Subir ${item.etiqueta}`} disabled={i === 0} className="flex h-6 w-8 items-center justify-center text-muted-2 disabled:opacity-30" onClick={() => onReordenar(mover(ids, i, i - 1))}>
              <ChevronAbajo tamano={16} grosor={2} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button type="button" aria-label={`Bajar ${item.etiqueta}`} disabled={i === items.length - 1} className="flex h-6 w-8 items-center justify-center text-muted-2 disabled:opacity-30" onClick={() => onReordenar(mover(ids, i, i + 1))}>
              <ChevronAbajo tamano={16} grosor={2} />
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
