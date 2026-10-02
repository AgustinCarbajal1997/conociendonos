import { useState } from 'react';
import { useStore } from '../store';
import { parejas } from '../engine';
import Boton from '../components/Boton';
import Encabezado from '../components/Encabezado';
import Switch from '../components/Switch';

export default function Jugadores() {
  const jugadores = useStore((s) => s.jugadores);
  const tipo = useStore((s) => s.tipoPartida);
  const { agregarJugador, renombrarJugador, quitarJugador, vincular, setFamilia, irA } = useStore();
  const [nombre, setNombre] = useState('');

  const agregar = () => {
    agregarJugador(nombre);
    setNombre('');
  };

  const nParejas = parejas(jugadores).length;
  const nFamilia = jugadores.filter((j) => j.familia).length;

  return (
    <main className="flex h-full flex-col">
      <Encabezado titulo="¿Quiénes están en la mesa?" onVolver={() => irA('inicio')} />
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <p className="mb-4 text-sm text-texto-suave">
          Opcional, pero sirve: las cartas de Pareja van a cada pareja y las de Familia a quienes marques como familia.
          {tipo === 'noche' && ' Si no hay parejas o familia, esos bloques se saltan.'}
        </p>

        <form
          className="mb-4 flex gap-2"
          onSubmit={(e) => { e.preventDefault(); agregar(); }}
        >
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            aria-label="Nombre del jugador"
            autoComplete="off"
            enterKeyHint="done"
            className="min-h-12 flex-1 rounded-xl border border-borde bg-superficie px-4 text-lg outline-none focus:border-acento"
          />
          <Boton variante="primario" type="submit" aria-label="Agregar jugador" disabled={!nombre.trim()} className="min-w-14 text-2xl leading-none">
            +
          </Boton>
        </form>

        <ul className="flex flex-col gap-3">
          {jugadores.map((j) => (
            <li key={j.id} className="rounded-2xl border border-borde bg-superficie p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={j.nombre}
                  onChange={(e) => renombrarJugador(j.id, e.target.value)}
                  aria-label={`Nombre de ${j.nombre}`}
                  className="min-h-10 flex-1 rounded-lg bg-transparent px-2 text-lg font-medium outline-none focus:bg-superficie-2"
                />
                <button
                  type="button"
                  onClick={() => quitarJugador(j.id)}
                  aria-label={`Quitar a ${j.nombre}`}
                  className="min-h-10 min-w-10 rounded-full text-xl text-texto-suave"
                >
                  ×
                </button>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <label className="flex flex-1 items-center gap-2 text-sm text-texto-suave">
                  Pareja de
                  <select
                    value={j.parejaId ?? ''}
                    onChange={(e) => vincular(j.id, e.target.value || undefined)}
                    className="min-h-10 flex-1 rounded-lg border border-borde bg-superficie-2 px-2 text-base text-texto"
                  >
                    <option value="">nadie</option>
                    {jugadores.filter((o) => o.id !== j.id).map((o) => (
                      <option key={o.id} value={o.id}>{o.nombre}</option>
                    ))}
                  </select>
                </label>
                <div className="w-36">
                  <Switch activo={j.familia} onCambio={(v) => setFamilia(j.id, v)} etiqueta="Familia" />
                </div>
              </div>
            </li>
          ))}
        </ul>
        {jugadores.length > 0 && (
          <p className="mt-4 text-center text-sm text-texto-suave">
            {jugadores.length} en la mesa · {nParejas} {nParejas === 1 ? 'pareja' : 'parejas'} · {nFamilia} de la familia
          </p>
        )}
      </div>
      <div className="safe-bottom flex flex-col gap-2 border-t border-borde px-4 pt-3">
        <Boton variante="primario" grande onClick={() => irA('configuracion')}>
          {jugadores.length ? 'Continuar' : 'Jugar sin cargar jugadores'}
        </Boton>
      </div>
    </main>
  );
}
