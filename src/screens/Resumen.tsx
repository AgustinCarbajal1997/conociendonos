import { useState } from 'react';
import { useStore } from '../store';
import { buscarCarta } from '../content';
import Boton from '../components/Boton';
import Encabezado from '../components/Encabezado';
import { Cerrar, Copiar, Corazon } from '../components/Icono';

function Duracion({ ms }: { ms: number }) {
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 60) return <>{min}<span className="text-[30px]" style={{ letterSpacing: 0 }}> min</span></>;
  return <>{Math.floor(min / 60)}<span className="text-[30px]" style={{ letterSpacing: 0 }}> h </span>{min % 60}</>;
}

export default function Resumen() {
  const partida = useStore((s) => s.partida);
  const fin = useStore((s) => s.fin);
  const { seguirJugando, nuevaNoche } = useStore();
  const [copiado, setCopiado] = useState(false);

  if (!partida) return null;

  const favoritas = partida.favoritas.map((id) => buscarCarta(id)).filter((x): x is NonNullable<typeof x> => !!x);
  const quedan = partida.cola.filter((it) => !it.especial).length + (partida.actual && !partida.actual.especial ? 1 : 0);
  const texto = favoritas.map(({ mazo, carta }) => `• ${carta.texto} (${mazo.nombre})`).join('\n');

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`Favoritas de Sale a la Luz\n${texto}`);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 1500);
    } catch {
      window.prompt('Copiá el texto:', texto);
    }
  };

  return (
    <main className="pantalla">
      <Encabezado
        izquierda={<span className="etiqueta text-muted">Noche terminada</span>}
        derecha={<button type="button" onClick={nuevaNoche} aria-label="Cerrar" className="-mr-2.5 flex h-11 w-11 items-center justify-center rounded-full text-muted"><Cerrar tamano={20} /></button>}
      />
      <h1 className="display m-0 mt-3.5 text-[40px] leading-[1.02]">Así estuvo <em>la noche</em></h1>

      <div className="mt-[22px] grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5 rounded-[22px] bg-surface px-[18px] pb-4 pt-[18px]" style={{ boxShadow: 'var(--row-ring)' }}>
          <span className="display text-[56px] leading-none text-amber-text tabular" style={{ letterSpacing: '-0.03em' }}>{partida.historial.length}</span>
          <span className="text-sm text-muted">cartas jugadas</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-[22px] bg-surface px-[18px] pb-4 pt-[18px]" style={{ boxShadow: 'var(--row-ring)' }}>
          <span className="display text-[56px] leading-none text-amber-text tabular" style={{ letterSpacing: '-0.03em' }}><Duracion ms={(fin ?? Date.now()) - partida.inicio} /></span>
          <span className="text-sm text-muted">de charla</span>
        </div>
      </div>

      <div className="mt-6 flex h-10 items-center justify-between">
        <span className="flex items-center gap-2 text-base font-semibold"><Corazon tamano={18} grosor={2} lleno />Favoritas · {favoritas.length}</span>
        {favoritas.length > 0 && (
          <button type="button" onClick={copiar} className="flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold" style={{ background: 'color-mix(in srgb, var(--text) 6%, transparent)' }}>
            <Copiar tamano={16} grosor={2} />{copiado ? 'Copiado' : 'Copiar'}
          </button>
        )}
      </div>
      <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {favoritas.length === 0 ? (
          <p className="m-0 text-sm leading-[1.45] text-muted">Ninguna guardada. Durante la carta, mantené apretado o tocá el corazón para guardarla.</p>
        ) : favoritas.map(({ mazo, carta }) => (
          <div key={carta.id} data-mazo={mazo.id} className="flex items-start gap-3.5 rounded-[18px] bg-surface px-4 py-3.5" style={{ boxShadow: 'var(--row-ring)' }}>
            <span className="mt-0.5 h-7 w-5 shrink-0 rounded-md" style={{ background: 'var(--m-card)', boxShadow: 'inset 0 0 0 1px var(--m-line)' }} />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="display text-[17px] leading-[1.25]" style={{ letterSpacing: 0 }}>{carta.texto}</span>
              <span className="text-[13px] text-muted">{mazo.nombre} · {mazo.categorias.find((c) => c.id === carta.cat)?.nombre}</span>
            </span>
          </div>
        ))}
      </div>

      <span className="mt-3 text-center text-sm text-muted">{quedan > 0 ? `Quedan ${quedan} cartas sin salir` : 'Salieron todas las cartas'}</span>
      <div className="mt-3 flex gap-2.5">
        {quedan > 0 && <Boton variante="secundario" onClick={seguirJugando} className="flex-1 px-3">Seguir jugando</Boton>}
        <Boton variante="primario" onClick={nuevaNoche} className="flex-1 px-3">Nueva noche</Boton>
      </div>
    </main>
  );
}
