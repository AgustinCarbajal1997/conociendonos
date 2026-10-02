import { describe, it, expect } from 'vitest';
import { MAZOS, ESPECIALES } from '../content';
import {
  armarNoche, armarCola, crearPartida, siguiente, pasar, puedePasar, quienResponde, toggleFavorita,
  progresoBloque, terminada, necesitaCategoria, categoriasDisponibles, intercalarEspeciales,
  nombreQuien, vincularPareja, parejas, ORDEN_NOCHE_DEFAULT, rngSemilla,
} from './index';
import type { Contexto, Jugador, ItemCola, Turno } from './tipos';

const ana: Jugador = { id: 'a', nombre: 'Ana', parejaId: 'j', familia: false };
const juan: Jugador = { id: 'j', nombre: 'Juan', parejaId: 'a', familia: true };
const lu: Jugador = { id: 'l', nombre: 'Lu', familia: true };
const pepe: Jugador = { id: 'p', nombre: 'Pepe', familia: false };
const todos = [ana, juan, lu, pepe];

const ctx = (jugadores: Jugador[] = todos): Contexto => ({ jugadores, mazos: MAZOS, especiales: ESPECIALES, rng: rngSemilla(7) });
const turno0: Turno = { todos: 0, pareja: 0, familia: 0 };

describe('quienResponde', () => {
  it('audiencia todos: rota por orden de carga', () => {
    let t = turno0;
    const ids: string[] = [];
    for (let i = 0; i < 5; i++) {
      const r = quienResponde('todos', todos, t);
      t = r.turno;
      ids.push(r.quien.tipo === 'jugador' ? r.quien.jugadorId : '?');
    }
    expect(ids).toEqual(['a', 'j', 'l', 'p', 'a']);
  });

  it('audiencia familia: rota solo entre familiares', () => {
    let t = turno0;
    const ids: string[] = [];
    for (let i = 0; i < 3; i++) {
      const r = quienResponde('familia', todos, t);
      t = r.turno;
      ids.push(r.quien.tipo === 'jugador' ? r.quien.jugadorId : '?');
    }
    expect(ids).toEqual(['j', 'l', 'j']);
    expect(t.todos).toBe(0);
  });

  it('audiencia pareja: devuelve los dos ids y rota entre parejas', () => {
    const mia: Jugador = { id: 'm', nombre: 'Mía', parejaId: 't', familia: false };
    const tom: Jugador = { id: 't', nombre: 'Tom', parejaId: 'm', familia: false };
    const js = [ana, juan, mia, tom, pepe];
    const r1 = quienResponde('pareja', js, turno0);
    const r2 = quienResponde('pareja', js, r1.turno);
    const r3 = quienResponde('pareja', js, r2.turno);
    expect(r1.quien).toEqual({ tipo: 'pareja', jugadorIds: ['a', 'j'] });
    expect(r2.quien).toEqual({ tipo: 'pareja', jugadorIds: ['m', 't'] });
    expect(r3.quien).toEqual(r1.quien);
    expect(nombreQuien(r1.quien, js)).toBe('Ana y Juan');
  });

  it('sin jugadores: "Quien tenga el celular"', () => {
    const r = quienResponde('pareja', [], turno0);
    expect(r.quien).toEqual({ tipo: 'celular' });
    expect(nombreQuien(r.quien, [])).toBe('Quien tenga el celular');
  });

  it('carta de pareja sin parejas cargadas cae en la rotación general', () => {
    const r = quienResponde('pareja', [lu, pepe], turno0);
    expect(r.quien).toEqual({ tipo: 'jugador', jugadorId: 'l' });
  });
});

describe('vincularPareja', () => {
  it('es simétrico y rompe vínculos viejos', () => {
    const base: Jugador[] = [
      { id: 'a', nombre: 'A', familia: false }, { id: 'b', nombre: 'B', familia: false }, { id: 'c', nombre: 'C', familia: false },
    ];
    const ab = vincularPareja(base, 'a', 'b');
    expect(parejas(ab).map(([x, y]) => [x.id, y.id])).toEqual([['a', 'b']]);
    const ac = vincularPareja(ab, 'a', 'c');
    expect(parejas(ac).map(([x, y]) => [x.id, y.id])).toEqual([['a', 'c']]);
    expect(ac.find((j) => j.id === 'b')?.parejaId).toBeUndefined();
    const solo = vincularPareja(ac, 'c', undefined);
    expect(parejas(solo)).toEqual([]);
  });
});

function partidaNoche(jugadores = todos, especiales = false) {
  const c = ctx(jugadores);
  let armado = armarNoche(MAZOS, jugadores, { ordenBloques: ORDEN_NOCHE_DEFAULT, cartasPorBloque: 10 }, new Set(), c.rng);
  if (especiales) armado = { ...armado, cola: intercalarEspeciales(armado.cola, ESPECIALES, 8, c.rng) };
  return { c, estado: crearPartida('noche', armado, { limitePases: 2, ahora: 0 }) };
}

describe('siguiente', () => {
  it('muestra la primera carta con cambio de bloque y la agrega al historial', () => {
    const { c, estado } = partidaNoche();
    const s1 = siguiente(estado, c);
    expect(s1.actual?.bloque).toBe(0);
    expect(s1.cambioBloque).toBe(true);
    expect(s1.historial).toEqual([s1.actual?.cartaId]);
    expect(s1.quien).toEqual({ tipo: 'jugador', jugadorId: 'a' });
    const s2 = siguiente(s1, c);
    expect(s2.cambioBloque).toBe(false);
    expect(s2.quien).toEqual({ tipo: 'jugador', jugadorId: 'j' });
  });

  it('las cartas de pareja van a la pareja y las de familia a familiares', () => {
    let { c, estado } = partidaNoche();
    for (let i = 0; i < 21; i++) estado = siguiente(estado, c); // primera del bloque parejas
    expect(estado.actual?.mazoId).toBe('pareja');
    expect(estado.cambioBloque).toBe(true);
    expect(estado.quien).toEqual({ tipo: 'pareja', jugadorIds: ['a', 'j'] });
    for (let i = 0; i < 10; i++) estado = siguiente(estado, c); // primera del bloque familia
    expect(estado.actual?.mazoId).toBe('familia');
    expect(estado.quien?.tipo).toBe('jugador');
    expect(['j', 'l']).toContain((estado.quien as { jugadorId: string }).jugadorId);
  });

  it('termina cuando se agota la cola', () => {
    let { c, estado } = partidaNoche();
    for (let i = 0; i < 50; i++) estado = siguiente(estado, c);
    expect(terminada(estado)).toBe(false);
    expect(progresoBloque(estado)).toEqual({ bloque: 5, jugada: 10, total: 10 });
    estado = siguiente(estado, c);
    expect(terminada(estado)).toBe(true);
    expect(estado.historial).toHaveLength(50);
  });

  it('contador de bloque', () => {
    let { c, estado } = partidaNoche();
    for (let i = 0; i < 14; i++) estado = siguiente(estado, c);
    expect(progresoBloque(estado)).toEqual({ bloque: 2, jugada: 4, total: 10 });
  });
});

describe('especiales en partida', () => {
  it('"Todos responden" hace que la próxima carta sea para todos y no gasta turno', () => {
    const { c } = partidaNoche();
    const cola: ItemCola[] = [
      { cartaId: 'am-001', mazoId: 'amigos', bloque: 0, nivel: 1 },
      { cartaId: 'todos-responden', mazoId: 'especial', bloque: 0, nivel: 1, especial: true },
      { cartaId: 'am-002', mazoId: 'amigos', bloque: 0, nivel: 1 },
      { cartaId: 'am-003', mazoId: 'amigos', bloque: 0, nivel: 1 },
    ];
    let e = crearPartida('noche', { cola, bloques: [{ id: 'x', titulo: 'x' }] }, { limitePases: 2, ahora: 0 });
    e = siguiente(e, c); // am-001 → Ana
    e = siguiente(e, c); // especial
    expect(e.actual?.especial).toBe(true);
    expect(e.quien).toEqual({ tipo: 'todos' });
    expect(e.historial).toEqual(['am-001']);
    e = siguiente(e, c); // am-002 → Todos
    expect(e.quien).toEqual({ tipo: 'todos' });
    e = siguiente(e, c); // am-003 → Juan (el turno siguió donde estaba)
    expect(e.quien).toEqual({ tipo: 'jugador', jugadorId: 'j' });
  });

  it('"Profundizá" y "Devolvé" refieren a quien respondió la última carta', () => {
    const { c } = partidaNoche();
    const cola: ItemCola[] = [
      { cartaId: 'am-001', mazoId: 'amigos', bloque: 0, nivel: 1 },
      { cartaId: 'profundiza', mazoId: 'especial', bloque: 0, nivel: 1, especial: true },
      { cartaId: 'devolve', mazoId: 'especial', bloque: 0, nivel: 1, especial: true },
    ];
    let e = crearPartida('noche', { cola, bloques: [{ id: 'x', titulo: 'x' }] }, { limitePases: 2, ahora: 0 });
    e = siguiente(e, c);
    e = siguiente(e, c);
    expect(e.quien).toEqual({ tipo: 'jugador', jugadorId: 'a' });
    e = siguiente(e, c);
    expect(e.quien).toEqual({ tipo: 'jugador', jugadorId: 'a' });
  });

  it('"Elegí vos" pide categoría y trae una carta de esa categoría', () => {
    const { c } = partidaNoche();
    const cola: ItemCola[] = [
      { cartaId: 'elegi-vos', mazoId: 'especial', bloque: 0, nivel: 1, especial: true },
      { cartaId: 'am-001', mazoId: 'amigos', bloque: 0, nivel: 1 },
      { cartaId: 'am-002', mazoId: 'amigos', bloque: 0, nivel: 1 },
    ];
    let e = crearPartida('noche', { cola, bloques: [{ id: 'x', titulo: 'x' }] }, { limitePases: 2, ahora: 0 });
    e = siguiente(e, c);
    expect(necesitaCategoria(e)).toBe(true);
    const disp = categoriasDisponibles(e, c);
    expect(disp.every((o) => o.mazoId === 'amigos')).toBe(true);
    expect(disp.map((o) => o.categoria.id)).toContain('profundidad');
    e = siguiente(e, c, 'amigos/profundidad');
    expect(necesitaCategoria(e)).toBe(false);
    const carta = MAZOS.amigos.cartas.find((k) => k.id === e.actual?.cartaId);
    expect(carta?.cat).toBe('profundidad');
    expect(e.cola.map((it) => it.cartaId)).toEqual(['am-001', 'am-002']);
  });

  it('una noche con especiales cada 8 tiene la cantidad esperada', () => {
    const { c, estado } = partidaNoche(todos, true);
    expect(estado.cola.filter((it) => it.especial)).toHaveLength(6); // 50 regulares → después de la 8,16,24,32,40,48
    let e = estado;
    let n = 0;
    while (!terminada(e)) { e = siguiente(e, c); n++; }
    expect(n).toBe(57);
  });
});

describe('pasar', () => {
  it('la carta vuelve al final del bloque y le toca a otro', () => {
    let { c, estado } = partidaNoche();
    estado = siguiente(estado, c);
    const pasada = estado.actual!.cartaId;
    expect(puedePasar(estado)).toBe(true);
    estado = pasar(estado, c);
    expect(estado.actual?.cartaId).not.toBe(pasada);
    expect(estado.quien).toEqual({ tipo: 'jugador', jugadorId: 'j' });
    expect(estado.historial).not.toContain(pasada);
    const bloque0 = estado.cola.filter((it) => it.bloque === 0);
    expect(bloque0.at(-1)?.cartaId).toBe(pasada);
    expect(estado.pases.a).toBe(1);
    expect(estado.cambioBloque).toBe(false);
  });

  it('respeta el límite de 2 pases por jugador', () => {
    let { c, estado } = partidaNoche([pepe]);
    estado = siguiente(estado, c);
    estado = pasar(estado, c);
    estado = pasar(estado, c);
    expect(estado.pases.p).toBe(2);
    expect(puedePasar(estado)).toBe(false);
    const antes = estado;
    estado = pasar(estado, c);
    expect(estado).toBe(antes);
  });

  it('no se puede pasar una especial', () => {
    const { c } = partidaNoche();
    const cola: ItemCola[] = [{ cartaId: 'profundiza', mazoId: 'especial', bloque: 0, nivel: 1, especial: true }];
    let e = crearPartida('noche', { cola, bloques: [{ id: 'x', titulo: 'x' }] }, { limitePases: 2, ahora: 0 });
    e = siguiente(e, c);
    expect(puedePasar(e)).toBe(false);
  });

  it('pasar no cambia quién respondió la última para las especiales', () => {
    const { c } = partidaNoche();
    const cola: ItemCola[] = [
      { cartaId: 'am-001', mazoId: 'amigos', bloque: 0, nivel: 1 },
      { cartaId: 'am-002', mazoId: 'amigos', bloque: 0, nivel: 1 },
      { cartaId: 'profundiza', mazoId: 'especial', bloque: 0, nivel: 1, especial: true },
    ];
    let e = crearPartida('noche', { cola, bloques: [{ id: 'x', titulo: 'x' }] }, { limitePases: 2, ahora: 0 });
    e = siguiente(e, c); // am-001 → Ana
    e = siguiente(e, c); // am-002 → Juan
    e = pasar(e, c);     // Juan pasa; am-002 vuelve al final: sale "profundiza"
    expect(e.actual?.cartaId).toBe('profundiza');
    expect(e.quien).toEqual({ tipo: 'jugador', jugadorId: 'a' });
  });
});

describe('favoritas', () => {
  it('marca y desmarca la carta actual', () => {
    let { c, estado } = partidaNoche();
    estado = siguiente(estado, c);
    const id = estado.actual!.cartaId;
    estado = toggleFavorita(estado);
    expect(estado.favoritas).toEqual([id]);
    estado = toggleFavorita(estado);
    expect(estado.favoritas).toEqual([]);
  });
});

describe('modo por categoría', () => {
  it('cada carta se elige por categoría hasta agotarla', () => {
    const c = ctx([pepe]);
    const armado = armarCola([MAZOS.familia], { categorias: { familia: ['raices', 'sobre-mi'] }, modo: 'categoria' }, new Set(), c.rng);
    let e = crearPartida('categoria', armado, { limitePases: 2, ahora: 0 });
    expect(necesitaCategoria(e)).toBe(true);
    expect(categoriasDisponibles(e, c).map((o) => o.clave)).toEqual(['familia/raices', 'familia/sobre-mi']);
    for (let i = 0; i < 10; i++) {
      e = siguiente(e, c, 'familia/raices');
      expect(MAZOS.familia.cartas.find((k) => k.id === e.actual?.cartaId)?.cat).toBe('raices');
    }
    expect(categoriasDisponibles(e, c).map((o) => o.clave)).toEqual(['familia/sobre-mi']);
  });

  it('con varios mazos, la clave distingue categorías del mismo nombre', () => {
    const c = ctx([pepe]);
    const armado = armarCola([MAZOS.amigos, MAZOS.desconocidos], { categorias: { amigos: ['rompehielo'], desconocidos: ['rompehielo'] }, modo: 'categoria' }, new Set(), c.rng);
    let e = crearPartida('categoria', armado, { limitePases: 2, ahora: 0 });
    expect(categoriasDisponibles(e, c).map((o) => o.clave)).toEqual(['desconocidos/rompehielo', 'amigos/rompehielo']);
    e = siguiente(e, c, 'desconocidos/rompehielo');
    expect(e.actual?.mazoId).toBe('desconocidos');
    e = siguiente(e, c, 'amigos/rompehielo');
    expect(e.actual?.mazoId).toBe('amigos');
  });
});

describe('modo progresivo', () => {
  it('marca cambio de bloque al subir de nivel', () => {
    const c = ctx([pepe, lu]);
    const armado = armarCola([MAZOS.amigos], { categorias: {}, modo: 'progresivo' }, new Set(), c.rng);
    let e = crearPartida('progresivo', armado, { limitePases: 2, ahora: 0 });
    const cambios: number[] = [];
    let i = 0;
    while (!terminada(e)) {
      e = siguiente(e, c);
      if (e.actual && e.cambioBloque) cambios.push(i);
      i++;
    }
    expect(cambios).toEqual([0, 20, 30]);
  });
});

describe('contador con especiales', () => {
  it('no cuenta las especiales en el total del bloque', () => {
    const { c, estado } = partidaNoche(todos, true);
    expect(estado.tamanosBloques).toEqual([10, 10, 10, 10, 10]);
    let e = estado;
    for (let i = 0; i < 9; i++) e = siguiente(e, c); // 8 regulares + la especial
    expect(e.actual?.especial).toBe(true);
    expect(progresoBloque(e)).toEqual({ bloque: 1, jugada: 8, total: 10 });
    e = siguiente(e, c);
    expect(progresoBloque(e)).toEqual({ bloque: 1, jugada: 9, total: 10 });
  });
});
