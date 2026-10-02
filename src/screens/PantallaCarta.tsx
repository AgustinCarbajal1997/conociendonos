import { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useStore } from '../store';
import { MAZOS, ESPECIALES } from '../content';
import {
  nombreQuien, progresoBloque, puedePasar, pasesUsados, necesitaCategoria, categoriasDisponibles, BLOQUES_NOCHE,
} from '../engine';
import type { BloqueNocheId } from '../engine';
import Carta from '../components/Carta';
import Transicion from '../components/Transicion';
import SelectorCategoria from '../components/SelectorCategoria';
import { useWakeLock } from '../hooks/useWakeLock';
import { useMantenerApretado } from '../hooks/useMantenerApretado';

const COLOR_ESPECIAL = '#2B2B2B';

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

  /** En modo por categoría, "Siguiente" abre el selector; si no quedan cartas, termina. */
  const alSiguiente = () => {
    if (partida?.modo === 'categoria' && necesitaCategoria(partida)) setEligiendo(true);
    else siguiente();
  };

  const alPasar = () => {
    if (!partida) return;
    if (sePuedePasar) { pasar(); return; }
    if (partida.actual && !partida.actual.especial && partida.quien && configPasar) mostrarAviso('Sin pases: ya usó 2');
  };
  const mostrarAviso = (texto: string) => {
    setAviso(texto);
    window.setTimeout(() => setAviso(null), 1200);
  };
  const alFavorita = () => {
    if (!partida?.actual || partida.actual.especial) return;
    const yaEra = partida.favoritas.includes(partida.actual.cartaId);
    toggleFavorita();
    mostrarAviso(yaEra ? 'Quitada de favoritas' : 'Favorita ♥');
  };

  const swipe = useSwipeable({
    onSwipedLeft: alSiguiente,
    onSwipedRight: alPasar,
    delta: 60,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });
  const apretar = useMantenerApretado(alFavorita);

  if (!partida) return null;

  // Modo por categoría (al empezar o al tocar Siguiente) o después de "Elegí vos": primero se elige.
  const mostrarSelector = partida.modo === 'categoria' ? (!partida.actual || eligiendo) : partida.eligeCategoria;
  if (mostrarSelector && necesitaCategoria(partida)) {
    const disp = categoriasDisponibles(partida, ctx);
    if (disp) {
      const mazo = MAZOS[disp.mazoId];
      return (
        <SelectorCategoria
          titulo={partida.modo === 'categoria' ? 'Por categoría' : 'Elegí vos'}
          color={mazo.color}
          quien={partida.eligeCategoria ? nombreQuien(partida.quien, jugadores) : 'Quien tenga el celular'}
          categorias={disp.categorias}
          onElegir={(catId) => { setEligiendo(false); siguiente(catId); }}
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
  const color = mazo?.color ?? COLOR_ESPECIAL;
  const bloque = partida.bloques[partida.bloqueActual];
  const progreso = progresoBloque(partida);
  const quien = nombreQuien(partida.quien, jugadores);
  const favorita = partida.favoritas.includes(actual.cartaId);

  if (partida.cambioBloque && transicionVista !== partida.bloqueActual && bloque && partida.bloques.length > 1) {
    const def = BLOQUES_NOCHE[bloque.id as BloqueNocheId];
    const colorBloque = def?.mazoId ? MAZOS[def.mazoId].color : color;
    return (
      <Transicion
        bloque={bloque}
        color={colorBloque}
        numero={partida.bloqueActual + 1}
        total={partida.bloques.length}
        onSeguir={() => marcarTransicionVista(partida.bloqueActual)}
      />
    );
  }

  const nota = esEspecial
    ? 'Carta especial'
    : partida.quien?.tipo === 'pareja'
      ? 'Se lee de uno al otro; la mesa escucha'
      : partida.quien?.tipo === 'todos'
        ? 'Una persona a la vez'
        : undefined;

  return (
    <main className="safe-top safe-bottom flex h-full flex-col bg-fondo px-4">
      <div className="flex items-center justify-between py-2">
        <button type="button" onClick={terminar} className="min-h-12 px-1 text-sm text-texto-suave underline underline-offset-4">
          Terminar
        </button>
        <span className="text-sm text-texto-suave tabular-nums" aria-live="polite">
          {partida.bloques.length > 1 ? `Bloque ${progreso.bloque} · ` : ''}{progreso.jugada}/{progreso.total}
        </span>
      </div>

      <div className="flex flex-1 flex-col" {...swipe} {...apretar.handlers} style={{ touchAction: 'pan-y' }}>
        <Carta
          claveAnimacion={`${actual.cartaId}-${partida.historial.length}-${partida.cola.length}`}
          color={color}
          etiqueta={esEspecial ? (especial?.nombre ?? 'Especial') : `${mazo?.nombre} · ${categoria?.nombre}`}
          quien={quien}
          nota={nota}
          texto={esEspecial ? (especial?.texto ?? '') : (carta?.texto ?? '')}
          favorita={favorita}
        />
      </div>

      <div className="relative flex items-center gap-2 pt-3">
        <button
          type="button"
          onClick={alPasar}
          disabled={!configPasar || esEspecial}
          className="min-h-14 flex-1 rounded-2xl border border-borde bg-superficie text-base disabled:opacity-30"
        >
          Pasar{configPasar && !esEspecial && partida.quien && (partida.quien.tipo === 'jugador' || partida.quien.tipo === 'pareja') ? ` · ${pasesUsados(partida)}/${partida.limitePases}` : ''}
        </button>
        <button
          type="button"
          onClick={alFavorita}
          disabled={esEspecial}
          aria-pressed={favorita}
          aria-label={favorita ? 'Quitar de favoritas' : 'Marcar favorita'}
          className={`min-h-14 min-w-14 rounded-2xl border border-borde text-2xl disabled:opacity-30 ${favorita ? 'bg-acento text-acento-texto' : 'bg-superficie'}`}
        >
          {favorita ? '♥' : '♡'}
        </button>
        <button
          type="button"
          onClick={alSiguiente}
          className="min-h-14 flex-[1.4] rounded-2xl bg-acento text-lg font-semibold text-acento-texto"
        >
          Siguiente
        </button>
        {aviso && (
          <span role="status" className="aparecer absolute -top-10 left-1/2 -translate-x-1/2 rounded-full bg-superficie-2 px-4 py-1 text-sm">
            {aviso}
          </span>
        )}
      </div>
    </main>
  );
}
