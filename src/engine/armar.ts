import type {
  Bloque, BloqueNocheId, Carta, ConfigNoche, ConfigSuelto, Especial, ItemCola, Jugador, Mazo, Nivel,
} from './tipos';
import { mezclar } from './rng';
import { parejas, familiares } from './jugadores';

export const CADA_ESPECIAL = 8;

interface DefBloqueNoche {
  id: BloqueNocheId;
  titulo: string;
  subtitulo: string;
  /** null = nivel 3 de todos los mazos */
  mazoId: string | null;
  niveles: Nivel[];
  requiere?: 'parejas' | 'familia';
}

export const BLOQUES_NOCHE: Record<BloqueNocheId, DefBloqueNoche> = {
  desconocidos: { id: 'desconocidos', titulo: 'Para empezar', subtitulo: 'Conocernos un poco, todos', mazoId: 'desconocidos', niveles: [1] },
  amigos: { id: 'amigos', titulo: 'Ahora, los amigos', subtitulo: 'Para reírse y debatir', mazoId: 'amigos', niveles: [1, 2] },
  parejas: { id: 'parejas', titulo: 'Ahora, las parejas', subtitulo: 'Cada pareja responde frente a la mesa', mazoId: 'pareja', niveles: [1, 2, 3], requiere: 'parejas' },
  familia: { id: 'familia', titulo: 'Ahora, la familia', subtitulo: 'Los demás escuchan, o responden si quieren', mazoId: 'familia', niveles: [1, 2, 3], requiere: 'familia' },
  profundo: { id: 'profundo', titulo: 'Lo que importa', subtitulo: 'Amor, sueños, logros y miedos', mazoId: 'profundo', niveles: [2, 3] },
  profundidad: { id: 'profundidad', titulo: 'Para cerrar', subtitulo: 'Un poco más profundo, para todos', mazoId: null, niveles: [3] },
};

export const ORDEN_NOCHE_DEFAULT: BloqueNocheId[] = ['desconocidos', 'amigos', 'parejas', 'familia', 'profundo', 'profundidad'];
export const CARTAS_POR_BLOQUE_DEFAULT = 10;

export const TITULOS_NIVEL: Record<Nivel, Bloque> = {
  1: { id: 'nivel-1', titulo: 'Para empezar', subtitulo: 'Lo liviano' },
  2: { id: 'nivel-2', titulo: 'Vamos un poco más profundo', subtitulo: 'Opiniones e historias' },
  3: { id: 'nivel-3', titulo: 'Lo que no se dice', subtitulo: 'Siempre se puede pasar' },
};

export function nivelDe(mazo: Mazo, carta: Carta): Nivel {
  return mazo.categorias.find((c) => c.id === carta.cat)?.nivel ?? 1;
}

/** Baraja poniendo primero las cartas no vistas (si sinRepetir), después las ya vistas. */
function barajarPreferiendoNuevas(cartas: Carta[], vistos: Set<string>, rng: () => number): Carta[] {
  const mezcladas = mezclar(cartas, rng);
  const nuevas = mezcladas.filter((c) => !vistos.has(c.id));
  const viejas = mezcladas.filter((c) => vistos.has(c.id));
  return [...nuevas, ...viejas];
}

/**
 * Elige hasta `n` cartas repartidas lo más parejo posible entre niveles (round-robin),
 * y las devuelve ordenadas por nivel ascendente, al azar dentro de cada nivel.
 */
export function elegirPorNiveles(
  mazo: Mazo, pool: Carta[], n: number, vistos: Set<string>, rng: () => number,
): Carta[] {
  const porNivel = new Map<Nivel, Carta[]>();
  for (const c of pool) {
    const nivel = nivelDe(mazo, c);
    if (!porNivel.has(nivel)) porNivel.set(nivel, []);
    porNivel.get(nivel)!.push(c);
  }
  const listas = [...porNivel.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([nivel, cartas]) => ({ nivel, cartas: barajarPreferiendoNuevas(cartas, vistos, rng) }));

  const elegidas: { nivel: Nivel; carta: Carta }[] = [];
  let quedan = true;
  while (elegidas.length < n && quedan) {
    quedan = false;
    for (const l of listas) {
      if (elegidas.length >= n) break;
      const carta = l.cartas.shift();
      if (carta) { elegidas.push({ nivel: l.nivel, carta }); quedan = true; }
    }
  }
  return elegidas.sort((a, b) => a.nivel - b.nivel).map((e) => e.carta);
}

export interface Armado { cola: ItemCola[]; bloques: Bloque[] }

export function armarNoche(
  mazos: Record<string, Mazo>,
  jugadores: Jugador[],
  config: ConfigNoche,
  vistos: Set<string> = new Set(),
  rng: () => number = Math.random,
): Armado {
  const hayParejas = parejas(jugadores).length > 0;
  const hayFamilia = familiares(jugadores).length > 0;
  const n = Math.max(1, Math.floor(config.cartasPorBloque));

  const cola: ItemCola[] = [];
  const bloques: Bloque[] = [];
  const usadas = new Set<string>();

  for (const id of config.ordenBloques) {
    const def = BLOQUES_NOCHE[id];
    if (!def) continue;
    if (def.requiere === 'parejas' && !hayParejas) continue;
    if (def.requiere === 'familia' && !hayFamilia) continue;

    let items: ItemCola[];
    if (def.mazoId) {
      const mazo = mazos[def.mazoId];
      if (!mazo) continue;
      const pool = mazo.cartas.filter((c) => def.niveles.includes(nivelDe(mazo, c)) && !usadas.has(c.id));
      items = elegirPorNiveles(mazo, pool, n, vistos, rng).map((c) => ({
        cartaId: c.id, mazoId: mazo.id, bloque: bloques.length, nivel: nivelDe(mazo, c),
      }));
    } else {
      // Nivel 3 de todos los mazos aplicables, mezclado.
      const candidatas: { carta: Carta; mazo: Mazo }[] = [];
      for (const mazo of Object.values(mazos)) {
        if (mazo.audiencia === 'pareja' && !hayParejas) continue;
        if (mazo.audiencia === 'familia' && !hayFamilia) continue;
        for (const carta of mazo.cartas) {
          if (nivelDe(mazo, carta) === 3 && !usadas.has(carta.id)) candidatas.push({ carta, mazo });
        }
      }
      const mezcladas = mezclar(candidatas, rng);
      const nuevas = mezcladas.filter((x) => !vistos.has(x.carta.id));
      const viejas = mezcladas.filter((x) => vistos.has(x.carta.id));
      items = [...nuevas, ...viejas].slice(0, n).map(({ carta, mazo }) => ({
        cartaId: carta.id, mazoId: mazo.id, bloque: bloques.length, nivel: 3,
      }));
    }
    if (items.length === 0) continue;
    for (const it of items) usadas.add(it.cartaId);
    cola.push(...items);
    bloques.push({ id: def.id, titulo: def.titulo, subtitulo: def.subtitulo });
  }
  return { cola, bloques };
}

export function armarCola(
  mazos: Mazo[],
  config: ConfigSuelto,
  vistos: Set<string> = new Set(),
  rng: () => number = Math.random,
): Armado {
  const pool: { carta: Carta; mazo: Mazo }[] = [];
  for (const mazo of mazos) {
    const activas = config.categorias[mazo.id] ?? [];
    const set = new Set(activas.length ? activas : mazo.categorias.map((c) => c.id));
    for (const carta of mazo.cartas) if (set.has(carta.cat)) pool.push({ carta, mazo });
  }
  const mezcladas = mezclar(pool, rng);
  const nuevas = mezcladas.filter((x) => !vistos.has(x.carta.id));
  const viejas = mezcladas.filter((x) => vistos.has(x.carta.id));
  const items = [...nuevas, ...viejas].map(({ carta, mazo }) => ({
    cartaId: carta.id, mazoId: mazo.id, bloque: 0, nivel: nivelDe(mazo, carta),
  }));

  if (config.modo === 'progresivo') {
    const niveles = [...new Set(items.map((it) => it.nivel))].sort((a, b) => a - b);
    const cola = items
      .slice()
      .sort((a, b) => a.nivel - b.nivel)
      .map((it) => ({ ...it, bloque: niveles.indexOf(it.nivel) }));
    return { cola, bloques: niveles.map((nv) => TITULOS_NIVEL[nv]) };
  }

  const titulo = config.modo === 'mezclado' ? 'Todo mezclado' : 'Elegí la categoría';
  const subtitulo = config.modo === 'mezclado' ? 'Las categorías salen al azar' : 'Antes de cada carta, quien tiene el celular elige';
  return { cola: items, bloques: [{ id: mazos.map((m) => m.id).join('+'), titulo, subtitulo }] };
}

/** Inserta una carta especial después de cada `cada` cartas regulares (nunca dos iguales seguidas). */
export function intercalarEspeciales(
  cola: ItemCola[],
  especiales: Especial[],
  cada: number = CADA_ESPECIAL,
  rng: () => number = Math.random,
): ItemCola[] {
  if (especiales.length === 0 || cada < 1) return cola.slice();
  const resultado: ItemCola[] = [];
  let contador = 0;
  let ultima: string | null = null;
  for (let i = 0; i < cola.length; i++) {
    const item = cola[i];
    resultado.push(item);
    if (item.especial) continue;
    contador++;
    const hayProxima = i < cola.length - 1;
    if (contador % cada === 0 && hayProxima) {
      const candidatas = especiales.filter((e) => e.id !== ultima);
      const elegida = candidatas[Math.floor(rng() * candidatas.length)];
      ultima = elegida.id;
      resultado.push({ cartaId: elegida.id, mazoId: 'especial', bloque: item.bloque, nivel: item.nivel, especial: true });
    }
  }
  return resultado;
}

/** Saca del historial de vistos los mazos agotados (todas sus cartas ya salieron). */
export function limpiarHistorialAgotado(mazos: Record<string, Mazo>, vistos: string[]): string[] {
  const set = new Set(vistos);
  const aQuitar = new Set<string>();
  for (const mazo of Object.values(mazos)) {
    if (mazo.cartas.length > 0 && mazo.cartas.every((c) => set.has(c.id))) {
      for (const c of mazo.cartas) aQuitar.add(c.id);
    }
  }
  return vistos.filter((id) => !aQuitar.has(id));
}
