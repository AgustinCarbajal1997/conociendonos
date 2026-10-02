import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAZOS, ESPECIALES } from '../content';
import {
  armarNoche, armarCola, crearPartida, intercalarEspeciales, limpiarHistorialAgotado,
  siguiente as engSiguiente, pasar as engPasar, toggleFavorita as engToggleFavorita, terminada,
  vincularPareja, CADA_ESPECIAL, ORDEN_NOCHE_DEFAULT, CARTAS_POR_BLOQUE_DEFAULT, LIMITE_PASES_DEFAULT,
} from '../engine';
import type { BloqueNocheId, Contexto, EstadoPartida, Jugador, ModoSuelto } from '../engine';

export type Pantalla = 'inicio' | 'jugadores' | 'configuracion' | 'carta' | 'resumen' | 'como-se-juega';
export type TipoPartida = 'noche' | 'suelto';
export type TamanoLetra = 0 | 1 | 2;
export type Tema = 'claro' | 'oscuro';

export interface Config {
  ordenBloques: BloqueNocheId[];
  cartasPorBloque: number;
  mazoId: string;
  /** Categorías activas por mazo (vacío = todas). */
  categorias: Record<string, string[]>;
  modoSuelto: ModoSuelto;
  especiales: boolean;
  pasar: boolean;
  sinRepetir: boolean;
  tamanoLetra: TamanoLetra;
  tema: Tema;
}

export const CONFIG_DEFAULT: Config = {
  ordenBloques: ORDEN_NOCHE_DEFAULT,
  cartasPorBloque: CARTAS_POR_BLOQUE_DEFAULT,
  mazoId: 'amigos',
  categorias: {},
  modoSuelto: 'progresivo',
  especiales: true,
  pasar: true,
  sinRepetir: true,
  tamanoLetra: 1,
  tema: 'claro',
};

interface Estado {
  pantalla: Pantalla;
  tipoPartida: TipoPartida;
  jugadores: Jugador[];
  config: Config;
  /** Ids vistos entre noches (regla "sin repetir"). */
  historialVisto: string[];
  /** Favoritas acumuladas de noches anteriores. */
  favoritasGuardadas: string[];
  partida: EstadoPartida | null;
  fin: number | null;
  /** Índice del último bloque cuya carta de transición ya se mostró. */
  transicionVista: number;
}

interface Acciones {
  marcarTransicionVista: (bloque: number) => void;
  irA: (p: Pantalla) => void;
  elegirTipo: (t: TipoPartida) => void;
  setTipoPartida: (t: TipoPartida) => void;
  agregarJugador: (nombre: string) => void;
  renombrarJugador: (id: string, nombre: string) => void;
  quitarJugador: (id: string) => void;
  vincular: (id: string, parejaId: string | undefined) => void;
  setFamilia: (id: string, familia: boolean) => void;
  setConfig: (parcial: Partial<Config>) => void;
  setCategoriasMazo: (mazoId: string, categorias: string[]) => void;
  empezar: () => void;
  siguiente: (catId?: string) => void;
  pasar: () => void;
  toggleFavorita: () => void;
  terminar: () => void;
  seguirJugando: () => void;
  nuevaNoche: () => void;
  reiniciarHistorial: () => void;
}

export type Store = Estado & Acciones;

function nuevoId() {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
}

function contexto(jugadores: Jugador[]): Contexto {
  return { jugadores, mazos: MAZOS, especiales: ESPECIALES };
}

/** Marca como vista la carta actual (si es regular) en el historial entre noches. */
function registrarVista(historialVisto: string[], partida: EstadoPartida | null): string[] {
  const actual = partida?.actual;
  if (!actual || actual.especial || historialVisto.includes(actual.cartaId)) return historialVisto;
  return [...historialVisto, actual.cartaId];
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      pantalla: 'inicio',
      tipoPartida: 'noche',
      jugadores: [],
      config: CONFIG_DEFAULT,
      historialVisto: [],
      favoritasGuardadas: [],
      partida: null,
      fin: null,
      transicionVista: -1,

      marcarTransicionVista: (transicionVista) => set({ transicionVista }),
      irA: (pantalla) => set({ pantalla }),
      elegirTipo: (tipoPartida) => set({ tipoPartida, pantalla: 'jugadores' }),
      setTipoPartida: (tipoPartida) => set({ tipoPartida }),

      agregarJugador: (nombre) => {
        const limpio = nombre.trim();
        if (!limpio) return;
        set((s) => ({ jugadores: [...s.jugadores, { id: nuevoId(), nombre: limpio, familia: false }] }));
      },
      renombrarJugador: (id, nombre) =>
        set((s) => ({ jugadores: s.jugadores.map((j) => (j.id === id ? { ...j, nombre } : j)) })),
      quitarJugador: (id) =>
        set((s) => ({
          jugadores: vincularPareja(s.jugadores, id, undefined).filter((j) => j.id !== id),
        })),
      vincular: (id, parejaId) => set((s) => ({ jugadores: vincularPareja(s.jugadores, id, parejaId) })),
      setFamilia: (id, familia) =>
        set((s) => ({ jugadores: s.jugadores.map((j) => (j.id === id ? { ...j, familia } : j)) })),

      setConfig: (parcial) => set((s) => ({ config: { ...s.config, ...parcial } })),
      setCategoriasMazo: (mazoId, categorias) =>
        set((s) => ({ config: { ...s.config, categorias: { ...s.config.categorias, [mazoId]: categorias } } })),

      empezar: () => {
        const { tipoPartida, jugadores, config } = get();
        const historialVisto = limpiarHistorialAgotado(MAZOS, get().historialVisto);
        const vistos = new Set(config.sinRepetir ? historialVisto : []);
        let armado;
        let modo;
        if (tipoPartida === 'noche') {
          modo = 'noche' as const;
          armado = armarNoche(MAZOS, jugadores, { ordenBloques: config.ordenBloques, cartasPorBloque: config.cartasPorBloque }, vistos);
        } else {
          modo = config.modoSuelto;
          const mazo = MAZOS[config.mazoId] ?? MAZOS.amigos;
          armado = armarCola(mazo, { mazoId: mazo.id, categorias: config.categorias[mazo.id] ?? [], modo }, vistos);
        }
        if (config.especiales && modo !== 'categoria') {
          armado = { ...armado, cola: intercalarEspeciales(armado.cola, ESPECIALES, CADA_ESPECIAL) };
        }
        const limitePases = config.pasar ? LIMITE_PASES_DEFAULT : 0;
        let partida = crearPartida(modo, armado, { limitePases });
        const ctx = contexto(jugadores);
        if (modo !== 'categoria') partida = engSiguiente(partida, ctx);
        set({ partida, historialVisto: registrarVista(historialVisto, partida), fin: null, pantalla: 'carta', transicionVista: -1 });
      },

      siguiente: (catId) => {
        const { partida, jugadores } = get();
        if (!partida) return;
        const nueva = engSiguiente(partida, contexto(jugadores), catId);
        if (terminada(nueva)) {
          set({ partida: nueva });
          get().terminar();
          return;
        }
        set((s) => ({ partida: nueva, historialVisto: registrarVista(s.historialVisto, nueva) }));
      },

      pasar: () => {
        const { partida, jugadores } = get();
        if (!partida) return;
        const nueva = engPasar(partida, contexto(jugadores));
        set((s) => ({ partida: nueva, historialVisto: registrarVista(s.historialVisto, nueva) }));
      },

      toggleFavorita: () => set((s) => ({ partida: s.partida ? engToggleFavorita(s.partida) : null })),

      terminar: () =>
        set((s) => ({
          fin: Date.now(),
          pantalla: 'resumen',
          favoritasGuardadas: [...new Set([...s.favoritasGuardadas, ...(s.partida?.favoritas ?? [])])],
        })),

      seguirJugando: () => {
        const { partida, jugadores } = get();
        if (!partida) return;
        if (partida.actual) { set({ pantalla: 'carta', fin: null }); return; }
        if (partida.cola.length === 0) return;
        const nueva = partida.modo === 'categoria' ? partida : engSiguiente(partida, contexto(jugadores));
        set((s) => ({ partida: nueva, pantalla: 'carta', fin: null, historialVisto: registrarVista(s.historialVisto, nueva) }));
      },

      nuevaNoche: () => set({ partida: null, fin: null, pantalla: 'inicio' }),
      reiniciarHistorial: () => set({ historialVisto: [] }),
    }),
    {
      name: 'sale-a-la-luz',
      version: 1,
      partialize: (s) => ({
        pantalla: s.pantalla,
        tipoPartida: s.tipoPartida,
        jugadores: s.jugadores,
        config: s.config,
        historialVisto: s.historialVisto,
        favoritasGuardadas: s.favoritasGuardadas,
        partida: s.partida,
        fin: s.fin,
        transicionVista: s.transicionVista,
      }),
      merge: (persistido, actual) => {
        const p = (persistido ?? {}) as Partial<Estado>;
        const estado: Estado & Acciones = { ...actual, ...p, config: { ...CONFIG_DEFAULT, ...(p.config ?? {}) } };
        // Si quedó en una pantalla de juego sin partida, volvemos al inicio.
        if ((estado.pantalla === 'carta' || estado.pantalla === 'resumen') && !estado.partida) estado.pantalla = 'inicio';
        if (estado.pantalla === 'configuracion') estado.pantalla = 'jugadores';
        return estado;
      },
    },
  ),
);
