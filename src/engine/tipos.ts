export type Nivel = 1 | 2 | 3;
export type Audiencia = 'todos' | 'pareja' | 'familia';

export interface Categoria { id: string; nombre: string; nivel: Nivel }
export interface Carta { id: string; cat: string; texto: string }
export interface Mazo {
  id: string;
  nombre: string;
  descripcion: string;
  color: string;
  audiencia: Audiencia;
  categorias: Categoria[];
  cartas: Carta[];
}
export interface Especial { id: string; nombre: string; texto: string }

export interface Jugador { id: string; nombre: string; parejaId?: string; familia: boolean }

export type Modo = 'noche' | 'progresivo' | 'mezclado' | 'categoria';
export type ModoSuelto = Exclude<Modo, 'noche'>;

export type BloqueNocheId = 'desconocidos' | 'amigos' | 'parejas' | 'familia' | 'profundidad';

export interface ConfigNoche { ordenBloques: BloqueNocheId[]; cartasPorBloque: number }
export interface ConfigSuelto { mazoId: string; categorias: string[]; modo: ModoSuelto }
export interface Reglas { especiales: boolean; pasar: boolean; sinRepetir: boolean }

/** Un ítem de la cola: carta regular o carta especial. */
export interface ItemCola {
  cartaId: string;
  /** id del mazo, o 'especial' */
  mazoId: string;
  bloque: number;
  nivel: Nivel;
  especial?: true;
}

/** Bloque de la noche (o nivel, en modo progresivo): lo que se muestra en la carta de transición. */
export interface Bloque { id: string; titulo: string; subtitulo?: string }

export type Quien =
  | { tipo: 'jugador'; jugadorId: string }
  | { tipo: 'pareja'; jugadorIds: [string, string] }
  | { tipo: 'todos' }
  | { tipo: 'celular' };

export interface Turno { todos: number; pareja: number; familia: number }

export interface EstadoPartida {
  modo: Modo;
  bloques: Bloque[];
  /** Cantidad total de ítems por bloque, para el contador "4/10". */
  tamanosBloques: number[];
  cola: ItemCola[];
  actual: ItemCola | null;
  quien: Quien | null;
  bloqueActual: number;
  /** true cuando `actual` abre un bloque nuevo: la UI muestra la transición antes de la carta. */
  cambioBloque: boolean;
  /** Ids de cartas regulares mostradas esta noche, en orden. */
  historial: string[];
  favoritas: string[];
  turno: Turno;
  pases: Record<string, number>;
  ultimoRespondio: Quien | null;
  /** Salió "Todos responden": la próxima carta la responde toda la mesa. */
  todosResponden: boolean;
  /** Salió "Elegí vos": la próxima carta se elige por categoría. */
  eligeCategoria: boolean;
  limitePases: number;
  inicio: number;
}

export interface Contexto {
  jugadores: Jugador[];
  mazos: Record<string, Mazo>;
  especiales: Especial[];
  rng?: () => number;
}
