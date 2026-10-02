import { useState } from 'react';
import { useStore } from '../store';
import { buscarCarta } from '../content';
import Boton from '../components/Boton';
import Encabezado from '../components/Encabezado';

function duracion(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 1) return 'menos de un minuto';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${min % 60} min`;
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
    <main className="flex h-full flex-col">
      <Encabezado titulo="Así estuvo la noche" />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-superficie p-4">
            <p className="text-3xl font-bold tabular-nums">{partida.historial.length}</p>
            <p className="text-sm text-texto-suave">cartas jugadas</p>
          </div>
          <div className="rounded-2xl bg-superficie p-4">
            <p className="text-3xl font-bold">{duracion((fin ?? Date.now()) - partida.inicio)}</p>
            <p className="text-sm text-texto-suave">de charla</p>
          </div>
        </div>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Favoritas ♥</h2>
            {favoritas.length > 0 && (
              <Boton onClick={copiar} className="py-2">{copiado ? 'Copiado' : 'Copiar'}</Boton>
            )}
          </div>
          {favoritas.length === 0 ? (
            <p className="mt-2 text-sm text-texto-suave">Ninguna marcada. Durante la carta, mantené apretado para guardarla.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {favoritas.map(({ mazo, carta }) => (
                <li key={carta.id} className="rounded-xl border-l-4 bg-superficie px-4 py-3" style={{ borderColor: mazo.color }}>
                  <p>{carta.texto}</p>
                  <p className="mt-1 text-xs text-texto-suave">{mazo.nombre}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
        {quedan > 0 && <p className="mt-6 text-center text-sm text-texto-suave">Quedan {quedan} cartas sin salir.</p>}
      </div>
      <div className="safe-bottom flex flex-col gap-2 border-t border-borde px-5 pt-3">
        {quedan > 0 && (
          <Boton variante="primario" grande onClick={seguirJugando}>Seguir jugando</Boton>
        )}
        <Boton variante={quedan > 0 ? 'secundario' : 'primario'} grande onClick={nuevaNoche}>Nueva noche</Boton>
      </div>
    </main>
  );
}
