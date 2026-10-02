import type { ModoSuelto } from '../engine';

const MODOS: { id: ModoSuelto; nombre: string; detalle: string }[] = [
  { id: 'progresivo', nombre: 'Progresivo', detalle: 'Nivel 1 → 2 → 3, al azar dentro de cada nivel' },
  { id: 'mezclado', nombre: 'Mezclado', detalle: 'Todas las categorías activas al azar' },
  { id: 'categoria', nombre: 'Por categoría', detalle: 'Antes de cada carta, quien tiene el celular elige' },
];

interface Props { valor: ModoSuelto; onCambio: (m: ModoSuelto) => void }

export default function SelectorModo({ valor, onCambio }: Props) {
  return (
    <div role="radiogroup" aria-label="Modo de orden" className="flex flex-col gap-2">
      {MODOS.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={valor === m.id}
          onClick={() => onCambio(m.id)}
          className={`rounded-xl border px-4 py-3 text-left ${valor === m.id ? 'border-acento bg-superficie-2' : 'border-borde bg-superficie'}`}
        >
          <span className="block">{m.nombre}</span>
          <span className="block text-sm text-texto-suave">{m.detalle}</span>
        </button>
      ))}
    </div>
  );
}
