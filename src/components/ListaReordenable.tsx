import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';

export interface ItemReordenable { id: string; etiqueta: string; detalle?: string; inactivo?: boolean }

interface Props { items: ItemReordenable[]; onReordenar: (ids: string[]) => void }

function mover<T>(arr: T[], de: number, a: number): T[] {
  const copia = arr.slice();
  const [item] = copia.splice(de, 1);
  copia.splice(a, 0, item);
  return copia;
}

/** Lista con drag por pointer events (funciona en touch) y botones ↑↓ como alternativa accesible. */
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

  return (
    <ul className="flex flex-col gap-2" onPointerMove={alMover} onPointerUp={() => setArrastrando(null)} onPointerCancel={() => setArrastrando(null)}>
      {items.map((item, i) => (
        <li
          key={item.id}
          ref={(el) => { if (el) filas.current.set(item.id, el); else filas.current.delete(item.id); }}
          className={`flex items-center gap-2 rounded-xl border px-2 py-2 ${arrastrando === item.id ? 'border-acento bg-superficie-2' : 'border-borde bg-superficie'} ${item.inactivo ? 'opacity-50' : ''}`}
        >
          <button
            type="button"
            aria-label={`Arrastrar ${item.etiqueta}`}
            className="min-h-10 min-w-10 cursor-grab touch-none text-xl text-texto-suave"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setArrastrando(item.id); }}
            onPointerUp={() => setArrastrando(null)}
          >
            ⋮⋮
          </button>
          <span className="flex-1">
            <span className="block">{i + 1}. {item.etiqueta}</span>
            {item.detalle && <span className="block text-sm text-texto-suave">{item.detalle}</span>}
          </span>
          <button type="button" aria-label={`Subir ${item.etiqueta}`} disabled={i === 0} className="min-h-10 min-w-10 text-lg disabled:opacity-30" onClick={() => onReordenar(mover(ids, i, i - 1))}>↑</button>
          <button type="button" aria-label={`Bajar ${item.etiqueta}`} disabled={i === items.length - 1} className="min-h-10 min-w-10 text-lg disabled:opacity-30" onClick={() => onReordenar(mover(ids, i, i + 1))}>↓</button>
        </li>
      ))}
    </ul>
  );
}
