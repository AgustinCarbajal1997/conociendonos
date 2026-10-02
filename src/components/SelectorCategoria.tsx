import type { Categoria } from '../engine';
import NivelPuntos from './NivelPuntos';
import Encabezado from './Encabezado';

interface Props {
  mazoId: string;
  contador: string;
  /** Quién elige, ya resuelto en texto, o null si elige quien tenga el celular. */
  quien: string | null;
  categorias: Categoria[];
  onElegir: (catId: string) => void;
  onTerminar: () => void;
}

const NIVELES: Record<number, string> = { 1: 'liviana', 2: 'media', 3: 'profunda' };

export default function SelectorCategoria({ mazoId, contador, quien, categorias, onElegir, onTerminar }: Props) {
  return (
    <main
      data-mazo={mazoId}
      className="pantalla aparecer"
      style={{
        background: 'radial-gradient(110% 50% at 50% -10%, color-mix(in srgb, var(--m-card), white 10%) 0%, var(--m-card) 55%, color-mix(in srgb, var(--m-card), black 8%) 100%)',
        color: 'var(--m-text)',
      }}
    >
      <Encabezado
        izquierda={<button type="button" onClick={onTerminar} className="-ml-3.5 h-12 rounded-full px-3.5 text-[15px] font-medium" style={{ color: 'var(--m-note)' }}>Terminar</button>}
        derecha={<span style={{ color: 'var(--m-note)' }}>{contador}</span>}
      />
      <div className="mt-9 flex flex-col gap-3">
        <h1 className="display m-0 text-[42px] leading-[1.04]" style={{ textWrap: 'balance' }}>¿Qué categoría va ahora?</h1>
        <p className="m-0 text-base" style={{ color: 'var(--m-note)' }}>
          {quien ? (<>Elige <strong className="font-semibold" style={{ color: 'var(--m-text)' }}>{quien}</strong>, que respondió la última.</>) : 'Elige quien tenga el celular.'}
        </p>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col gap-3">
        {categorias.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onElegir(c.id)}
            className="flex h-[76px] items-center justify-between rounded-[22px] px-[22px] text-left"
            style={{ background: 'var(--m-text)', color: 'var(--m-card)' }}
          >
            <span className="flex flex-col gap-[3px]">
              <span className="display text-2xl leading-none">{c.nombre}</span>
              <span className="text-[13px] opacity-75">nivel {c.nivel} · {NIVELES[c.nivel]}</span>
            </span>
            <NivelPuntos nivel={c.nivel} etiqueta={false} />
          </button>
        ))}
      </div>
      <div className="flex-1" />
    </main>
  );
}
