import { useState } from 'react';
import { useStore } from '../store';
import { parejas } from '../engine';
import Boton from '../components/Boton';
import Encabezado, { BotonVolver, Titulo } from '../components/Encabezado';
import { SwitchPista } from '../components/Switch';
import { Cerrar, ChevronAbajo, Mas } from '../components/Icono';

export default function Jugadores() {
  const jugadores = useStore((s) => s.jugadores);
  const { agregarJugador, renombrarJugador, quitarJugador, vincular, setFamilia, irA } = useStore();
  const [nombre, setNombre] = useState('');

  const nParejas = parejas(jugadores).length;
  const nFamilia = jugadores.filter((j) => j.familia).length;

  return (
    <main className="pantalla">
      <Encabezado izquierda={<BotonVolver onClick={() => irA('inicio')} />} derecha="Paso 1 de 2" />
      <Titulo>¿Quiénes están en la mesa?</Titulo>

      <form className="mt-4 flex items-center gap-2.5" onSubmit={(e) => { e.preventDefault(); agregarJugador(nombre); setNombre(''); }}>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Agregar nombre"
          aria-label="Nombre del jugador"
          autoComplete="off"
          enterKeyHint="done"
          className="h-[52px] min-w-0 flex-1 rounded-full border-0 bg-surface px-[22px] text-[17px] text-text outline-none placeholder:text-muted-2 focus:ring-2 focus:ring-amber"
          style={{ boxShadow: 'var(--btn2-shadow)' }}
        />
        <button type="submit" aria-label="Agregar jugador" disabled={!nombre.trim()} className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-amber text-on-amber disabled:opacity-[0.38]">
          <Mas tamano={22} grosor={2.2} />
        </button>
      </form>

      <div className="relative mt-4 flex-1 overflow-hidden">
        <ul className="m-0 flex h-full list-none flex-col gap-2 overflow-y-auto p-0 pb-16">
          {jugadores.length === 0 && (
            <li className="mt-6 text-center text-sm leading-[1.45] text-muted">
              Opcional, pero sirve: las cartas de Pareja van a cada pareja y las de Familia a quienes marques como familia.
            </li>
          )}
          {jugadores.map((j) => {
            const pareja = jugadores.find((o) => o.id === j.parejaId);
            return (
              <li key={j.id} className="flex flex-col gap-2.5 rounded-[20px] bg-surface py-3 pl-[18px] pr-2.5" style={{ boxShadow: 'var(--row-ring)' }}>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={j.nombre}
                    onChange={(e) => renombrarJugador(j.id, e.target.value)}
                    aria-label={`Nombre de ${j.nombre}`}
                    className="h-8 min-w-0 flex-1 rounded-lg border-0 bg-transparent p-0 text-lg font-semibold text-text outline-none focus:bg-surface-2 focus:px-2"
                  />
                  <button type="button" onClick={() => quitarJugador(j.id)} aria-label={`Quitar a ${j.nombre}`} className="flex h-11 w-11 items-center justify-center rounded-full text-muted-2">
                    <Cerrar tamano={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between pr-2">
                  <label className="relative flex h-9 items-center gap-1.5 rounded-full pl-3.5 pr-3 text-sm" style={pareja ? { background: 'var(--coral-bg)', color: 'var(--coral-text)', fontWeight: 600 } : { background: 'var(--surface-2)', color: 'var(--muted)', fontWeight: 500 }}>
                    {pareja ? `Pareja de ${pareja.nombre}` : 'Pareja de…'}
                    <ChevronAbajo tamano={14} grosor={2} />
                    <select
                      value={j.parejaId ?? ''}
                      onChange={(e) => vincular(j.id, e.target.value || undefined)}
                      aria-label={`Pareja de ${j.nombre}`}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    >
                      <option value="">Nadie</option>
                      {jugadores.filter((o) => o.id !== j.id).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
                    </select>
                  </label>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={j.familia}
                    onClick={() => setFamilia(j.id, !j.familia)}
                    className="flex h-11 items-center gap-2.5 text-sm"
                    style={j.familia ? { color: 'var(--coral-text)', fontWeight: 600 } : { color: 'var(--muted)' }}
                  >
                    Familia
                    <SwitchPista activo={j.familia} chico />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(180deg, transparent, var(--bg-bottom))' }} />
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <span className="text-center text-sm text-muted">
          {jugadores.length > 0
            ? `${jugadores.length} en la mesa · ${nParejas} ${nParejas === 1 ? 'pareja' : 'parejas'} · ${nFamilia} de la familia`
            : 'Podés jugar sin cargar a nadie: la carta dirá "Quien tenga el celular".'}
        </span>
        <Boton variante="primario" onClick={() => irA('configuracion')} className="w-full">
          {jugadores.length ? 'Continuar' : 'Jugar sin cargar jugadores'}
        </Boton>
      </div>
    </main>
  );
}
