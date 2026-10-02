import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useStore } from '../store';
import { MAZOS, ESPECIALES } from '../content';
import {
  nombreQuien, progresoBloque, puedePasar, pasesUsados, necesitaCategoria, categoriasDisponibles, parejas, familiares, BLOQUES_NOCHE,
} from '../engine';
import type { BloqueNocheId } from '../engine';
import Carta from '../components/Carta';
import Transicion from '../components/Transicion';
import SelectorCategoria from '../components/SelectorCategoria';
import Boton from '../components/Boton';
import Encabezado from '../components/Encabezado';
import { Corazon, FlechaDer } from '../components/Icono';
import { useWakeLock } from '../hooks/useWakeLock';
import { useMantenerApretado } from '../hooks/useMantenerApretado';

const NOTA_ESPECIAL: Record<string, string> = {
  profundiza: 'la mesa le hace una pregunta más',
  devolve: 'responde y elige a quién devolvérsela',
  'elegi-vos': 'elige la categoría de la próxima',
  'todos-responden': 'la próxima la responde toda la mesa',
};

export default function PantallaCarta() {
  const partida = useStore((s) => s.partida);
  const jugadores = useStore((s) => s.jugadores);
  const configPasar = useStore((s) => s.config.pasar);
  const transicionVista = useStore((s) => s.transicionVista);
  const { siguiente, pasar, toggleFavorita, terminar, marcarTransicionVista } = useStore();
  const [aviso, setAviso] = useState<string | null>(null);
  const [eligiendo, setEligiendo] = useState(false);

  useWakeLock(true);

  const ctx = { jugadores, mazos: MAZOS, especiales: ESPECIALES };
  const sePuedePasar = !!partida && configPasar && puedePasar(partida);

  const mostrarAviso = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(null), 1400);
  };
  const alSiguiente = () => {
    if (partida?.modo === 'categoria' && necesitaCategoria(partida)) setEligiendo(true);
    else siguiente();
  };
  const alPasar = () => {
    if (!partida) return;
    if (sePuedePasar) { pasar(); return; }
    if (partida.actual && !partida.actual.especial && partida.quien && configPasar) mostrarAviso('Sin pases: ya usó 2');
  };
  const alFavorita = () => {
    if (!partida?.actual || partida.actual.especial) return;
    const yaEra = partida.favoritas.includes(partida.actual.cartaId);
    toggleFavorita();
    mostrarAviso(yaEra ? 'Quitada de favoritas' : 'Favorita');
  };

  const swipe = useSwipeable({ onSwipedLeft: alSiguiente, onSwipedRight: alPasar, delta: 60, preventScrollOnSwipe: true, trackMouse: true });
  const apretar = useMantenerApretado(alFavorita, 450);

  if (!partida) return null;

  const progreso = progresoBloque(partida);
  const contador = partida.bloques.length > 1 ? `Bloque ${progreso.bloque} · ${progreso.jugada}/${progreso.total}` : `${progreso.jugada}/${progreso.total}`;

  const mostrarSelector = partida.modo === 'categoria' ? (!partida.actual || eligiendo) : partida.eligeCategoria;
  if (mostrarSelector && necesitaCategoria(partida)) {
    const opciones = categoriasDisponibles(partida, ctx);
    if (opciones.length > 0) {
      const mazosEnJuego = [...new Set(opciones.map((o) => o.mazoId))];
      const unico = mazosEnJuego.length === 1 ? mazosEnJuego[0] : null;
      return (
        <SelectorCategoria
          mazoId={unico ?? 'especial'}
          mazos={MAZOS}
          contador={`${unico ? MAZOS[unico].nombre : `${mazosEnJuego.length} mazos`} · ${contador}`}
          quien={partida.eligeCategoria && partida.ultimoRespondio ? nombreQuien(partida.ultimoRespondio, jugadores) : null}
          opciones={opciones}
          onElegir={(clave) => { setEligiendo(false); siguiente(clave); }}
          onTerminar={terminar}
        />
      );
    }
  }

  const actual = partida.actual;
  if (!actual) return null;

  const esEspecial = !!actual.especial;
  const mazo = esEspecial ? null : MAZOS[actual.mazoId];
  const carta = mazo?.cartas.find((c) => c.id === actual.cartaId);
  const especial = esEspecial ? ESPECIALES.find((e) => e.id === actual.cartaId) : null;
  const categoria = mazo?.categorias.find((c) => c.id === carta?.cat);
  const bloque = partida.bloques[partida.bloqueActual];
  const quien = nombreQuien(partida.quien, jugadores);
  const favorita = partida.favoritas.includes(actual.cartaId);

  if (partida.cambioBloque && transicionVista !== partida.bloqueActual && bloque && partida.bloques.length > 1) {
    const def = BLOQUES_NOCHE[bloque.id as BloqueNocheId];
    const mazoBloque = def?.mazoId ?? (esEspecial ? partida.cola.find((it) => !it.especial)?.mazoId : actual.mazoId) ?? 'amigos';
    const partes = [`${partida.tamanosBloques[partida.bloqueActual]} cartas`];
    if (def?.requiere === 'parejas') partes.push(...parejas(jugadores).map(([a, b]) => `${a.nombre} y ${b.nombre}`));
    if (def?.requiere === 'familia') partes.push(...familiares(jugadores).map((f) => f.nombre));
    return (
      <Transicion
        bloque={bloque}
        mazoId={mazoBloque}
        numero={partida.bloqueActual + 1}
        total={partida.bloques.length}
        detalle={partes.join(' · ')}
        onSeguir={() => marcarTransicionVista(partida.bloqueActual)}
      />
    );
  }

  const nota = esEspecial
    ? NOTA_ESPECIAL[actual.cartaId]
    : partida.quien?.tipo === 'pareja'
      ? 'se lee de uno al otro; la mesa escucha'
      : partida.quien?.tipo === 'todos'
        ? 'una persona a la vez; la mesa escucha'
        : 'responde en voz alta; la mesa escucha';
  const mostrarPases = configPasar && !esEspecial && partida.quien && (partida.quien.tipo === 'jugador' || partida.quien.tipo === 'pareja');

  return (
    <main className="pantalla relative">
      <Encabezado
        izquierda={<button type="button" onClick={terminar} className="-ml-3.5 h-12 rounded-full px-3.5 text-[15px] font-medium text-muted">Terminar</button>}
        derecha={<span aria-live="polite">{contador}</span>}
      />

      <div className="flex flex-1 flex-col" {...swipe} {...apretar.handlers} style={{ touchAction: 'pan-y' }}>
        <Carta
          claveAnimacion={`${actual.cartaId}-${partida.historial.length}-${partida.cola.length}`}
          mazoId={esEspecial ? 'especial' : actual.mazoId}
          etiqueta={esEspecial ? 'Carta especial' : `${mazo?.nombre} · ${categoria?.nombre}`}
          nivel={categoria?.nivel}
          quien={quien}
          nota={nota}
          texto={esEspecial ? (especial?.texto ?? '') : (carta?.texto ?? '')}
          tituloEspecial={especial?.nombre}
          favorita={favorita}
          puedePasar={!!configPasar && !esEspecial}
        />
      </div>

      {aviso && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(118px+var(--pie))] flex justify-center">
          <span role="status" className="toast flex h-11 items-center gap-2 rounded-full pl-3.5 pr-[18px] text-[15px] font-semibold" style={{ background: 'var(--toast-bg)', color: 'var(--toast-text)', boxShadow: '0 10px 30px -10px rgb(0 0 0 / 0.5)' }}>
            <Corazon tamano={16} grosor={2} lleno />
            {aviso}
          </span>
        </div>
      )}

      <div className="mt-[18px] flex h-14 items-stretch gap-3">
        {!esEspecial && (
          <>
            <Boton variante="secundario" onClick={alPasar} disabled={!configPasar} className="text-[15px]">
              Pasar{mostrarPases ? ` · ${pasesUsados(partida)}/${partida.limitePases}` : ''}
            </Boton>
            <button
              type="button"
              onClick={alFavorita}
              aria-pressed={favorita}
              aria-label={favorita ? 'Quitar de favoritas' : 'Marcar como favorita'}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
              style={favorita
                ? { background: 'var(--coral-bg)', color: 'var(--coral-text)', boxShadow: 'inset 0 0 0 1px color-mix(in srgb, var(--coral-text) 35%, transparent), 0 0 24px -6px var(--coral)' }
                : { background: 'var(--btn2-bg)', color: 'var(--text)', boxShadow: 'var(--btn2-shadow)' }}
            >
              <Corazon tamano={22} lleno={favorita} />
            </button>
          </>
        )}
        <Boton variante="primario" onClick={alSiguiente} className="flex-1">
          Siguiente <FlechaDer tamano={18} grosor={2.2} />
        </Boton>
      </div>
    </main>
  );
}
