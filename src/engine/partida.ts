import type {
  Audiencia, Categoria, Contexto, EstadoPartida, ItemCola, Jugador, Modo, Quien, Turno,
} from './tipos';
import type { Armado } from './armar';
import { claveQuien, familiares, parejas } from './jugadores';
import { mezclar } from './rng';

export const LIMITE_PASES_DEFAULT = 2;

export function crearPartida(modo: Modo, armado: Armado, opciones: { limitePases: number; ahora?: number }): EstadoPartida {
  const tamanos = armado.bloques.map((_, i) => armado.cola.filter((it) => it.bloque === i && !it.especial).length);
  return {
    modo,
    bloques: armado.bloques,
    tamanosBloques: tamanos,
    cola: armado.cola,
    actual: null,
    quien: null,
    bloqueActual: -1,
    cambioBloque: false,
    historial: [],
    favoritas: [],
    turno: { todos: 0, pareja: 0, familia: 0 },
    pases: {},
    ultimoRespondio: null,
    todosResponden: false,
    eligeCategoria: false,
    limitePases: opciones.limitePases,
    inicio: opciones.ahora ?? Date.now(),
  };
}

/** A quién le toca una carta de cierta audiencia, y el turno avanzado. */
export function quienResponde(audiencia: Audiencia, jugadores: Jugador[], turno: Turno): { quien: Quien; turno: Turno } {
  if (jugadores.length === 0) return { quien: { tipo: 'celular' }, turno };

  if (audiencia === 'pareja') {
    const ps = parejas(jugadores);
    if (ps.length > 0) {
      const [a, b] = ps[turno.pareja % ps.length];
      return { quien: { tipo: 'pareja', jugadorIds: [a.id, b.id] }, turno: { ...turno, pareja: turno.pareja + 1 } };
    }
  }
  if (audiencia === 'familia') {
    const fs = familiares(jugadores);
    if (fs.length > 0) {
      const j = fs[turno.familia % fs.length];
      return { quien: { tipo: 'jugador', jugadorId: j.id }, turno: { ...turno, familia: turno.familia + 1 } };
    }
  }
  const j = jugadores[turno.todos % jugadores.length];
  return { quien: { tipo: 'jugador', jugadorId: j.id }, turno: { ...turno, todos: turno.todos + 1 } };
}

function categoriaDe(item: ItemCola, ctx: Contexto): string | undefined {
  return ctx.mazos[item.mazoId]?.cartas.find((c) => c.id === item.cartaId)?.cat;
}

export interface OpcionCategoria {
  /** "mazoId/catId": lo que se pasa a `siguiente`. */
  clave: string;
  mazoId: string;
  categoria: Categoria;
}

/** Categorías que se pueden elegir ahora (modo "por categoría" o después de "Elegí vos"), agrupadas por mazo. */
export function categoriasDisponibles(estado: EstadoPartida, ctx: Contexto): OpcionCategoria[] {
  const opciones: OpcionCategoria[] = [];
  if (estado.modo === 'categoria') {
    const enCola = new Set(estado.cola.filter((it) => !it.especial).map((it) => `${it.mazoId}/${categoriaDe(it, ctx)}`));
    for (const mazo of Object.values(ctx.mazos)) {
      for (const categoria of mazo.categorias) {
        const clave = `${mazo.id}/${categoria.id}`;
        if (enCola.has(clave)) opciones.push({ clave, mazoId: mazo.id, categoria });
      }
    }
    return opciones;
  }
  // Después de "Elegí vos": cualquier categoría del mazo que viene, aunque haya que traer una carta nueva.
  const proxima = estado.cola.find((it) => !it.especial);
  const mazo = proxima ? ctx.mazos[proxima.mazoId] : undefined;
  if (!mazo) return opciones;
  const vistas = new Set(estado.historial);
  for (const categoria of mazo.categorias) {
    if (mazo.cartas.some((k) => k.cat === categoria.id && !vistas.has(k.id))) {
      opciones.push({ clave: `${mazo.id}/${categoria.id}`, mazoId: mazo.id, categoria });
    }
  }
  return opciones;
}

/** Mueve al frente de la cola una carta de la categoría pedida ("catId" o "mazoId/catId"), trayendo una nueva del mazo si hace falta. */
function traerDeCategoria(estado: EstadoPartida, clave: string, ctx: Contexto): ItemCola[] {
  const barra = clave.indexOf('/');
  const mazoFiltro = barra >= 0 ? clave.slice(0, barra) : undefined;
  const catId = barra >= 0 ? clave.slice(barra + 1) : clave;
  const cola = estado.cola.slice();
  const idx = cola.findIndex((it) => !it.especial && (!mazoFiltro || it.mazoId === mazoFiltro) && categoriaDe(it, ctx) === catId);
  if (idx >= 0) {
    const [item] = cola.splice(idx, 1);
    return [item, ...cola];
  }
  if (estado.modo === 'categoria') return cola;
  const proxima = cola.find((it) => !it.especial);
  const mazo = mazoFiltro ? ctx.mazos[mazoFiltro] : proxima ? ctx.mazos[proxima.mazoId] : undefined;
  if (!mazo || !proxima) return cola;
  const enCola = new Set(cola.map((it) => it.cartaId));
  const vistas = new Set(estado.historial);
  const candidatas = mazo.cartas.filter((c) => c.cat === catId && !enCola.has(c.id) && !vistas.has(c.id));
  if (candidatas.length === 0) return cola;
  const carta = mezclar(candidatas, ctx.rng)[0];
  const nivel = mazo.categorias.find((c) => c.id === catId)?.nivel ?? proxima.nivel;
  return [{ cartaId: carta.id, mazoId: mazo.id, bloque: proxima.bloque, nivel }, ...cola];
}

function avanzar(estado: EstadoPartida, ctx: Contexto, opciones: { catId?: string; respondio: boolean }): EstadoPartida {
  let cola = estado.cola;
  if (opciones.catId && (estado.modo === 'categoria' || estado.eligeCategoria)) {
    cola = traerDeCategoria(estado, opciones.catId, ctx);
  }
  const ultimoRespondio =
    opciones.respondio && estado.actual && !estado.actual.especial && estado.quien ? estado.quien : estado.ultimoRespondio;

  if (cola.length === 0) {
    return { ...estado, cola, actual: null, quien: null, cambioBloque: false, ultimoRespondio, eligeCategoria: false };
  }
  const [item, ...resto] = cola;
  const base: EstadoPartida = {
    ...estado,
    cola: resto,
    actual: item,
    bloqueActual: item.bloque,
    cambioBloque: item.bloque !== estado.bloqueActual,
    ultimoRespondio,
    eligeCategoria: false,
  };

  if (item.especial) {
    switch (item.cartaId) {
      case 'todos-responden':
        return { ...base, quien: { tipo: 'todos' }, todosResponden: true };
      case 'elegi-vos':
        return { ...base, quien: { tipo: 'celular' }, eligeCategoria: true };
      default: // profundiza, devolve: refieren a quien respondió la última
        return { ...base, quien: ultimoRespondio ?? { tipo: 'celular' } };
    }
  }

  if (estado.todosResponden) {
    return { ...base, quien: { tipo: 'todos' }, todosResponden: false, historial: [...estado.historial, item.cartaId] };
  }
  const audiencia = ctx.mazos[item.mazoId]?.audiencia ?? 'todos';
  const { quien, turno } = quienResponde(audiencia, ctx.jugadores, estado.turno);
  return { ...base, quien, turno, historial: [...estado.historial, item.cartaId] };
}

/**
 * Pasa a la próxima carta. En modo "por categoría" (o después de "Elegí vos") hay que pasar la clave de categoría ("mazoId/catId" o "catId").
 * Si la cola se vació, `actual` queda en null: la UI muestra el resumen.
 */
export function siguiente(estado: EstadoPartida, ctx: Contexto, catId?: string): EstadoPartida {
  return avanzar(estado, ctx, { catId, respondio: true });
}

export function necesitaCategoria(estado: EstadoPartida): boolean {
  return estado.cola.some((it) => !it.especial) && (estado.modo === 'categoria' || estado.eligeCategoria);
}

export function pasesUsados(estado: EstadoPartida): number {
  if (!estado.quien) return 0;
  return estado.pases[claveQuien(estado.quien)] ?? 0;
}

export function puedePasar(estado: EstadoPartida): boolean {
  if (!estado.actual || estado.actual.especial || !estado.quien) return false;
  if (estado.quien.tipo === 'todos' || estado.quien.tipo === 'celular') return true;
  return pasesUsados(estado) < estado.limitePases;
}

/** Pasa la carta actual: vuelve al final de su bloque para otro jugador y cuenta un pase. */
export function pasar(estado: EstadoPartida, ctx: Contexto): EstadoPartida {
  if (!puedePasar(estado) || !estado.actual || !estado.quien) return estado;
  const item = estado.actual;
  const clave = claveQuien(estado.quien);
  const pases = estado.quien.tipo === 'jugador' || estado.quien.tipo === 'pareja'
    ? { ...estado.pases, [clave]: (estado.pases[clave] ?? 0) + 1 }
    : estado.pases;

  const cola = estado.cola.slice();
  let pos = -1;
  for (let i = cola.length - 1; i >= 0; i--) {
    if (cola[i].bloque === item.bloque) { pos = i; break; }
  }
  cola.splice(pos + 1, 0, item);

  const historial = estado.historial.slice();
  const idx = historial.lastIndexOf(item.cartaId);
  if (idx >= 0) historial.splice(idx, 1);

  const siguienteEstado = avanzar({ ...estado, cola, historial, pases }, ctx, { respondio: false });
  // La carta pasada no cambia de bloque aunque sea la única que quedaba.
  return siguienteEstado.actual?.cartaId === item.cartaId ? { ...siguienteEstado, cambioBloque: false } : siguienteEstado;
}

export function toggleFavorita(estado: EstadoPartida): EstadoPartida {
  const item = estado.actual;
  if (!item || item.especial) return estado;
  const favoritas = estado.favoritas.includes(item.cartaId)
    ? estado.favoritas.filter((id) => id !== item.cartaId)
    : [...estado.favoritas, item.cartaId];
  return { ...estado, favoritas };
}

/** Posición dentro del bloque actual, contando solo cartas regulares: { jugada: 4, total: 10 }. */
export function progresoBloque(estado: EstadoPartida): { bloque: number; jugada: number; total: number } {
  const b = estado.bloqueActual;
  if (b < 0) return { bloque: 1, jugada: 0, total: estado.tamanosBloques[0] ?? 0 };
  const total = estado.tamanosBloques[b] ?? 0;
  const pendientes = estado.cola.filter((it) => it.bloque === b && !it.especial).length;
  return { bloque: b + 1, jugada: Math.max(0, total - pendientes), total };
}

export function terminada(estado: EstadoPartida): boolean {
  return estado.actual === null && estado.cola.length === 0 && estado.bloqueActual >= 0;
}
