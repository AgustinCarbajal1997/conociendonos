import { useMemo } from 'react';
import { useStore } from '../store';
import type { TamanoLetra } from '../store';
import { LISTA_MAZOS, MAZOS } from '../content';
import { BLOQUES_NOCHE, armarNoche, armarCola, parejas, familiares, rngSemilla } from '../engine';
import type { BloqueNocheId } from '../engine';
import Boton from '../components/Boton';
import Switch from '../components/Switch';
import ListaReordenable from '../components/ListaReordenable';
import SelectorModo from '../components/SelectorModo';
import { textoSobre } from '../lib/color';

const NOMBRES_BLOQUE: Record<BloqueNocheId, string> = {
  desconocidos: 'Rompehielo para todos',
  amigos: 'Amigos',
  parejas: 'Parejas',
  familia: 'Familia',
  profundidad: 'Profundidad para todos',
};

export default function Configuracion() {
  const tipo = useStore((s) => s.tipoPartida);
  const config = useStore((s) => s.config);
  const jugadores = useStore((s) => s.jugadores);
  const historialVisto = useStore((s) => s.historialVisto);
  const { setConfig, setCategoriasMazo, empezar, irA, reiniciarHistorial } = useStore();

  const hayParejas = parejas(jugadores).length > 0;
  const hayFamilia = familiares(jugadores).length > 0;
  const mazo = MAZOS[config.mazoId] ?? MAZOS.amigos;
  const activas = config.categorias[mazo.id] ?? [];
  const todasActivas = activas.length === 0;

  const cantidad = useMemo(() => {
    const vistos = new Set(config.sinRepetir ? historialVisto : []);
    if (tipo === 'noche') {
      return armarNoche(MAZOS, jugadores, { ordenBloques: config.ordenBloques, cartasPorBloque: config.cartasPorBloque }, vistos, rngSemilla(1)).cola.length;
    }
    return armarCola(mazo, { mazoId: mazo.id, categorias: activas, modo: config.modoSuelto }, vistos, rngSemilla(1)).cola.length;
  }, [tipo, config, jugadores, historialVisto, mazo, activas]);

  const toggleCategoria = (catId: string) => {
    const base = todasActivas ? mazo.categorias.map((c) => c.id) : activas;
    const nuevas = base.includes(catId) ? base.filter((c) => c !== catId) : [...base, catId];
    if (nuevas.length === 0) return;
    setCategoriasMazo(mazo.id, nuevas.length === mazo.categorias.length ? [] : nuevas);
  };

  return (
    <div className="fixed inset-0 z-10 flex flex-col justify-end bg-black/60" role="dialog" aria-modal="true" aria-labelledby="titulo-config">
      <button type="button" aria-label="Cerrar" className="flex-1" onClick={() => irA('jugadores')} />
      <div className="subir flex max-h-[92%] flex-col rounded-t-3xl bg-superficie">
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 id="titulo-config" className="text-lg font-semibold">
            {tipo === 'noche' ? 'Armar la noche' : 'Mazo suelto'}
          </h2>
          <button type="button" onClick={() => irA('jugadores')} aria-label="Cerrar" className="min-h-10 min-w-10 text-2xl text-texto-suave">×</button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {tipo === 'noche' ? (
            <section className="mt-4">
              <h3 className="mb-2 text-sm uppercase tracking-wider text-texto-suave">Orden de los bloques</h3>
              <ListaReordenable
                items={config.ordenBloques.map((id) => {
                  const def = BLOQUES_NOCHE[id];
                  const inactivo = (def.requiere === 'parejas' && !hayParejas) || (def.requiere === 'familia' && !hayFamilia);
                  return {
                    id,
                    etiqueta: NOMBRES_BLOQUE[id],
                    detalle: inactivo ? `Se salta: no hay ${def.requiere === 'parejas' ? 'parejas' : 'familia'} cargadas` : def.subtitulo,
                    inactivo,
                  };
                })}
                onReordenar={(ids) => setConfig({ ordenBloques: ids as BloqueNocheId[] })}
              />
              <div className="mt-4 flex items-center justify-between">
                <span>Cartas por bloque</span>
                <div className="flex items-center gap-2">
                  <button type="button" aria-label="Menos cartas" className="min-h-10 min-w-10 rounded-full bg-superficie-2 text-xl" onClick={() => setConfig({ cartasPorBloque: Math.max(3, config.cartasPorBloque - 1) })}>−</button>
                  <span className="w-8 text-center text-lg tabular-nums" aria-live="polite">{config.cartasPorBloque}</span>
                  <button type="button" aria-label="Más cartas" className="min-h-10 min-w-10 rounded-full bg-superficie-2 text-xl" onClick={() => setConfig({ cartasPorBloque: Math.min(20, config.cartasPorBloque + 1) })}>+</button>
                </div>
              </div>
            </section>
          ) : (
            <>
              <section className="mt-4">
                <h3 className="mb-2 text-sm uppercase tracking-wider text-texto-suave">Mazo</h3>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Mazo">
                  {LISTA_MAZOS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={m.id === mazo.id}
                      onClick={() => setConfig({ mazoId: m.id })}
                      style={{ backgroundColor: m.color, color: textoSobre(m.color) }}
                      className={`rounded-xl px-3 py-3 text-left ${m.id === mazo.id ? 'ring-2 ring-texto ring-offset-2 ring-offset-superficie' : 'opacity-70'}`}
                    >
                      <span className="block font-semibold">{m.nombre}</span>
                      <span className="block text-xs opacity-80">{m.cartas.length} cartas</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-texto-suave">{mazo.descripcion}</p>
              </section>
              <section className="mt-4">
                <h3 className="mb-2 text-sm uppercase tracking-wider text-texto-suave">Categorías</h3>
                <div className="flex flex-wrap gap-2">
                  {mazo.categorias.map((c) => {
                    const activa = todasActivas || activas.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        aria-pressed={activa}
                        onClick={() => toggleCategoria(c.id)}
                        className={`min-h-10 rounded-full border px-4 py-2 text-sm ${activa ? 'border-acento bg-superficie-2 text-texto' : 'border-borde text-texto-suave'}`}
                      >
                        {c.nombre} <span className="opacity-60">· nivel {c.nivel}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
              <section className="mt-4">
                <h3 className="mb-2 text-sm uppercase tracking-wider text-texto-suave">Orden</h3>
                <SelectorModo valor={config.modoSuelto} onCambio={(m) => setConfig({ modoSuelto: m })} />
              </section>
            </>
          )}

          <section className="mt-4 divide-y divide-borde">
            <Switch
              etiqueta="Cartas especiales"
              descripcion={config.modoSuelto === 'categoria' && tipo === 'suelto' ? 'No aplica en modo por categoría' : 'Profundizá, Devolvé, Elegí vos, Todos responden: una cada 8'}
              activo={config.especiales}
              onCambio={(v) => setConfig({ especiales: v })}
            />
            <Switch etiqueta="Pasar" descripcion="Hasta 2 cartas por jugador; la carta vuelve para otro" activo={config.pasar} onCambio={(v) => setConfig({ pasar: v })} />
            <Switch
              etiqueta="Sin repetir entre noches"
              descripcion={`${historialVisto.length} cartas ya vistas en este celular`}
              activo={config.sinRepetir}
              onCambio={(v) => setConfig({ sinRepetir: v })}
            />
            {historialVisto.length > 0 && (
              <div className="py-2">
                <Boton variante="fantasma" className="px-0" onClick={reiniciarHistorial}>Reiniciar historial</Boton>
              </div>
            )}
          </section>

          <section className="mt-2 flex items-center justify-between py-3">
            <span>Tamaño de letra</span>
            <div className="flex gap-1 rounded-full bg-superficie-2 p-1" role="radiogroup" aria-label="Tamaño de letra">
              {(['A', 'A', 'A'] as const).map((l, i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={config.tamanoLetra === i}
                  aria-label={['Letra chica', 'Letra media', 'Letra grande'][i]}
                  onClick={() => setConfig({ tamanoLetra: i as TamanoLetra })}
                  className={`min-h-10 min-w-10 rounded-full ${config.tamanoLetra === i ? 'bg-acento text-acento-texto' : ''}`}
                  style={{ fontSize: `${14 + i * 4}px` }}
                >
                  {l}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="safe-bottom border-t border-borde px-5 pt-3">
          <Boton variante="primario" grande className="w-full" onClick={empezar} disabled={cantidad === 0}>
            Empezar · {cantidad} cartas
          </Boton>
        </div>
      </div>
    </div>
  );
}
