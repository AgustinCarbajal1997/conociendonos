import type { OpcionCategoria } from '../engine';
import type { Mazo } from '../engine';
import NivelPuntos from './NivelPuntos';
import Encabezado from './Encabezado';

interface Props {
  /** Mazo que pinta la pantalla; 'especial' cuando hay varios mazos mezclados. */
  mazoId: string;
  mazos: Record<string, Mazo>;
  contador: string;
  /** Quién elige, ya resuelto en texto, o null si elige quien tenga el celular. */
  quien: string | null;
  opciones: OpcionCategoria[];
  onElegir: (clave: string) => void;
  onTerminar: () => void;
}

const NIVELES: Record<number, string> = { 1: 'liviana', 2: 'media', 3: 'profunda' };

export default function SelectorCategoria({ mazoId, mazos, contador, quien, opciones, onElegir, onTerminar }: Props) {
  const variosMazos = new Set(opciones.map((o) => o.mazoId)).size > 1;
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
      <div className="mt-6 flex flex-col gap-3">
        <h1 className="display m-0 text-[42px] leading-[1.04]" style={{ textWrap: 'balance' }}>¿Qué categoría va ahora?</h1>
        <p className="m-0 text-base" style={{ color: 'var(--m-note)' }}>
          {quien ? (<>Elige <strong className="font-semibold" style={{ color: 'var(--m-text)' }}>{quien}</strong>, que respondió la última.</>) : 'Elige quien tenga el celular.'}
        </p>
      </div>
      <div className="min-h-4 flex-1" />
      <div className="flex min-h-0 flex-col gap-2.5 overflow-y-auto py-1">
        {opciones.map((o) => (
          <button
            key={o.clave}
            type="button"
            data-mazo={o.mazoId}
            onClick={() => onElegir(o.clave)}
            className="flex min-h-[68px] shrink-0 items-center justify-between rounded-[22px] px-[22px] py-3 text-left"
            style={{ background: 'var(--m-text)', color: 'var(--m-card)' }}
          >
            <span className="flex flex-col gap-[3px]">
              <span className="display text-2xl leading-none">{o.categoria.nombre}</span>
              <span className="text-[13px] opacity-75">
                {variosMazos ? `${mazos[o.mazoId]?.nombre} · ` : ''}nivel {o.categoria.nivel} · {NIVELES[o.categoria.nivel]}
              </span>
            </span>
            <NivelPuntos nivel={o.categoria.nivel} etiqueta={false} />
          </button>
        ))}
      </div>
      <div className="min-h-4 flex-1" />
    </main>
  );
}
