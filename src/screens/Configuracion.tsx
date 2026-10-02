import { useMemo } from 'react';
import { useStore } from '../store';
import type { TamanoLetra, Tema } from '../store';
import { LISTA_MAZOS, MAZOS } from '../content';
import { BLOQUES_NOCHE, armarNoche, armarCola, parejas, familiares, rngSemilla } from '../engine';
import type { BloqueNocheId } from '../engine';
import Boton from '../components/Boton';
import Switch from '../components/Switch';
import ListaReordenable from '../components/ListaReordenable';
import SelectorModo from '../components/SelectorModo';
import NivelPuntos from '../components/NivelPuntos';
import { Cerrar, Mas, Menos } from '../components/Icono';

const NOMBRES_BLOQUE: Record<BloqueNocheId, string> = {
  desconocidos: 'Rompehielo para todos',
  amigos: 'Amigos',
  parejas: 'Parejas',
  familia: 'Familia',
  profundidad: 'Profundidad para todos',
};

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <span className="etiqueta text-muted">{titulo}</span>
      {children}
    </section>
  );
}

function Segmentado<T extends string | number>({ opciones, valor, onCambio, etiqueta }: { opciones: { valor: T; etiqueta: string; estilo?: React.CSSProperties; aria?: string }[]; valor: T; onCambio: (v: T) => void; etiqueta: string }) {
  return (
    <div className="flex gap-0.5 rounded-full bg-surface-2 p-[3px]" role="radiogroup" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={String(o.valor)}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          aria-label={o.aria}
          onClick={() => onCambio(o.valor)}
          className="h-10 min-w-11 rounded-full px-3 text-sm font-medium"
          style={{ ...(valor === o.valor ? { background: 'var(--text)', color: 'var(--bg)' } : { color: 'var(--muted)' }), ...o.estilo }}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}

export default function Configuracion() {
  const tipo = useStore((s) => s.tipoPartida);
  const config = useStore((s) => s.config);
  const jugadores = useStore((s) => s.jugadores);
  const historialVisto = useStore((s) => s.historialVisto);
  const { setConfig, setCategoriasMazo, setTipoPartida, empezar, irA, reiniciarHistorial } = useStore();

  const ps = parejas(jugadores);
  const fs = familiares(jugadores);
  const mazo = MAZOS[config.mazoId] ?? MAZOS.amigos;
  const activas = config.categorias[mazo.id] ?? [];
  const todasActivas = activas.length === 0;

  const armado = useMemo(() => {
    const vistos = new Set(config.sinRepetir ? historialVisto : []);
    if (tipo === 'noche') {
      return armarNoche(MAZOS, jugadores, { ordenBloques: config.ordenBloques, cartasPorBloque: config.cartasPorBloque }, vistos, rngSemilla(1));
    }
    return armarCola(mazo, { mazoId: mazo.id, categorias: activas, modo: config.modoSuelto }, vistos, rngSemilla(1));
  }, [tipo, config, jugadores, historialVisto, mazo, activas]);
  const cantidad = armado.cola.length;

  const toggleCategoria = (catId: string) => {
    const base = todasActivas ? mazo.categorias.map((c) => c.id) : activas;
    const nuevas = base.includes(catId) ? base.filter((c) => c !== catId) : [...base, catId];
    if (nuevas.length === 0) return;
    setCategoriasMazo(mazo.id, nuevas.length === mazo.categorias.length ? [] : nuevas);
  };

  const detalleBloque = (id: BloqueNocheId): string => {
    const def = BLOQUES_NOCHE[id];
    if (def.requiere === 'parejas') return ps.length ? `Cada pareja frente a la mesa · ${ps.map(([a, b]) => `${a.nombre} y ${b.nombre}`).join(', ')}` : 'Se salta: no hay parejas cargadas';
    if (def.requiere === 'familia') return fs.length ? `Entre generaciones · ${fs.map((f) => f.nombre).join(', ')}` : 'Se salta: no hay familia cargada';
    if (id === 'desconocidos') return 'Desconocidos · nivel 1';
    if (id === 'amigos') return 'Lo que no se dice en el grupo';
    return 'Nivel 3 de todos los mazos';
  };

  return (
    <div className="fixed inset-0 z-10" role="dialog" aria-modal="true" aria-labelledby="titulo-config">
      <button type="button" aria-label="Cerrar" className="aparecer absolute inset-0 w-full" style={{ background: 'var(--scrim)' }} onClick={() => irA('jugadores')} />
      <div className="subir absolute inset-x-0 bottom-0 top-[104px] flex flex-col rounded-t-[28px] bg-surface px-5 pb-[max(env(safe-area-inset-bottom),22px)] pt-2.5" style={{ boxShadow: 'var(--shadow-sheet)' }}>
        <div className="flex h-4 justify-center"><span className="h-1 w-9 rounded-sm" style={{ background: 'var(--line)' }} /></div>
        <div className="mt-1 flex h-12 items-center justify-between">
          <div className="flex gap-0.5 rounded-full bg-bg p-[3px]" role="tablist">
            {([['noche', 'Armar la noche'], ['suelto', 'Mazo suelto']] as const).map(([t, nombre]) => (
              <button
                key={t}
                type="button"
                role="tab"
                id={t === tipo ? 'titulo-config' : undefined}
                aria-selected={tipo === t}
                onClick={() => setTipoPartida(t)}
                className="h-[38px] rounded-full px-4 text-sm"
                style={tipo === t ? { background: 'var(--text)', color: 'var(--bg)', fontWeight: 600 } : { color: 'var(--muted)', fontWeight: 500 }}
              >
                {nombre}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => irA('jugadores')} aria-label="Cerrar" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-muted">
            <Cerrar tamano={20} />
          </button>
        </div>

        <div className="relative mt-2.5 flex-1 overflow-hidden">
          <div className="flex h-full flex-col gap-[18px] overflow-y-auto pb-14">
            {tipo === 'noche' ? (
              <>
                <Seccion titulo="Bloques · arrastrá para ordenar">
                  <ListaReordenable
                    items={config.ordenBloques.map((id) => {
                      const def = BLOQUES_NOCHE[id];
                      const inactivo = (def.requiere === 'parejas' && !ps.length) || (def.requiere === 'familia' && !fs.length);
                      const indicador = def.mazoId
                        ? <span data-mazo={def.mazoId} className="h-3 w-3 rounded-full" style={{ background: 'var(--m-chip)' }} />
                        : <span className="h-3 w-3 rounded-full" style={{ background: 'linear-gradient(160deg, var(--amber-hi), var(--coral))' }} />;
                      return { id, etiqueta: NOMBRES_BLOQUE[id], detalle: detalleBloque(id), inactivo, indicador };
                    })}
                    onReordenar={(ids) => setConfig({ ordenBloques: ids as BloqueNocheId[] })}
                  />
                </Seccion>
                <div className="flex h-14 items-center justify-between">
                  <span className="flex flex-col gap-0.5">
                    <span className="text-base font-semibold">Cartas por bloque</span>
                    <span className="text-[13px] text-muted">{armado.bloques.length} bloques activos · {cantidad} cartas</span>
                  </span>
                  <div className="flex items-center gap-1 rounded-full bg-surface-2 p-1">
                    <button type="button" aria-label="Menos cartas" className="flex h-10 w-11 items-center justify-center rounded-full" onClick={() => setConfig({ cartasPorBloque: Math.max(3, config.cartasPorBloque - 1) })}><Menos tamano={18} grosor={2} /></button>
                    <span className="min-w-7 text-center text-[17px] font-semibold tabular" aria-live="polite">{config.cartasPorBloque}</span>
                    <button type="button" aria-label="Más cartas" className="flex h-10 w-11 items-center justify-center rounded-full" onClick={() => setConfig({ cartasPorBloque: Math.min(20, config.cartasPorBloque + 1) })}><Mas tamano={18} grosor={2} /></button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Seccion titulo="Mazo">
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Mazo">
                    {LISTA_MAZOS.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={m.id === mazo.id}
                        data-mazo={m.id}
                        onClick={() => setConfig({ mazoId: m.id })}
                        className="flex h-14 items-center gap-2.5 rounded-2xl bg-surface-2 px-3.5 text-left text-[15px] font-semibold"
                        style={m.id === mazo.id ? { boxShadow: '0 0 0 2px var(--m-chip)' } : undefined}
                      >
                        <span className="h-6 w-[18px] shrink-0 rounded-[5px]" style={{ background: 'var(--m-card)', boxShadow: 'inset 0 0 0 1px var(--m-line)' }} />
                        {m.nombre}
                      </button>
                    ))}
                  </div>
                  <p className="m-0 text-[13px] text-muted">{mazo.descripcion}</p>
                </Seccion>
                <Seccion titulo="Categorías · tocá para activar">
                  <div className="flex flex-wrap gap-2" data-mazo={mazo.id}>
                    {mazo.categorias.map((c) => {
                      const activa = todasActivas || activas.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          aria-pressed={activa}
                          onClick={() => toggleCategoria(c.id)}
                          className="flex h-11 items-center gap-2 rounded-full pl-3.5 pr-4 text-sm font-semibold transition-colors duration-150"
                          style={activa ? { background: 'var(--m-chip)', color: 'var(--bg)' } : { background: 'var(--m-chip-bg)', color: 'var(--m-chip)' }}
                        >
                          {c.nombre}
                          <NivelPuntos nivel={c.nivel} tamano={6} etiqueta={false} />
                        </button>
                      );
                    })}
                  </div>
                </Seccion>
                <Seccion titulo="Modo">
                  <SelectorModo valor={config.modoSuelto} onCambio={(m) => setConfig({ modoSuelto: m })} />
                </Seccion>
              </>
            )}

            <Seccion titulo="Opciones">
              <Switch
                etiqueta="Cartas especiales"
                descripcion={tipo === 'suelto' && config.modoSuelto === 'categoria' ? 'No aplica en modo por categoría' : 'Profundizá, Devolvé, Elegí vos, Todos responden'}
                activo={config.especiales}
                onCambio={(v) => setConfig({ especiales: v })}
              />
              <Switch etiqueta="Pasar" descripcion="Hasta 2 pases por persona" activo={config.pasar} onCambio={(v) => setConfig({ pasar: v })} />
              <Switch
                etiqueta="Sin repetir entre noches"
                descripcion={<>{historialVisto.length} cartas ya vistas en este celular{historialVisto.length > 0 && (<> · <span role="button" tabIndex={0} className="font-semibold text-amber-text" onClick={(e) => { e.stopPropagation(); reiniciarHistorial(); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); reiniciarHistorial(); } }}>Reiniciar historial</span></>)}</>}
                activo={config.sinRepetir}
                onCambio={(v) => setConfig({ sinRepetir: v })}
              />
              <div className="flex min-h-16 items-center justify-between">
                <span className="flex flex-col gap-0.5">
                  <span className="text-base font-semibold">Tamaño de letra</span>
                  <span className="text-[13px] text-muted">Para leer la carta desde lejos</span>
                </span>
                <Segmentado<TamanoLetra>
                  etiqueta="Tamaño de letra"
                  valor={config.tamanoLetra}
                  onCambio={(v) => setConfig({ tamanoLetra: v })}
                  opciones={[
                    { valor: 0, etiqueta: 'A', aria: 'Letra chica', estilo: { fontFamily: 'var(--font-display)', fontSize: 15 } },
                    { valor: 1, etiqueta: 'A', aria: 'Letra media', estilo: { fontFamily: 'var(--font-display)', fontSize: 19 } },
                    { valor: 2, etiqueta: 'A', aria: 'Letra grande', estilo: { fontFamily: 'var(--font-display)', fontSize: 24 } },
                  ]}
                />
              </div>
              <div className="flex min-h-16 items-center justify-between">
                <span className="flex flex-col gap-0.5">
                  <span className="text-base font-semibold">Tema</span>
                  <span className="text-[13px] text-muted">Oscuro para mesas con poca luz</span>
                </span>
                <Segmentado<Tema>
                  etiqueta="Tema"
                  valor={config.tema}
                  onCambio={(v) => setConfig({ tema: v })}
                  opciones={[{ valor: 'claro', etiqueta: 'Claro' }, { valor: 'oscuro', etiqueta: 'Oscuro' }]}
                />
              </div>
            </Seccion>
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-14" style={{ background: 'linear-gradient(180deg, transparent, var(--surface))' }} />
        </div>

        <Boton variante="primario" className="mt-2 w-full" onClick={empezar} disabled={cantidad === 0}>
          Empezar · {cantidad} cartas
        </Boton>
      </div>
    </div>
  );
}
