import { describe, it, expect } from 'vitest';
import { MAZOS, ESPECIALES } from '../content';
import {
  armarNoche, armarCola, intercalarEspeciales, limpiarHistorialAgotado, elegirPorNiveles,
  ORDEN_NOCHE_DEFAULT, nivelDe, rngSemilla,
} from './index';
import type { Jugador } from './tipos';

const rng = () => rngSemilla(42);

const ana: Jugador = { id: 'a', nombre: 'Ana', parejaId: 'j', familia: false };
const juan: Jugador = { id: 'j', nombre: 'Juan', parejaId: 'a', familia: false };
const lu: Jugador = { id: 'l', nombre: 'Lu', familia: true };
const pepe: Jugador = { id: 'p', nombre: 'Pepe', familia: false };

const config = { ordenBloques: ORDEN_NOCHE_DEFAULT, cartasPorBloque: 10 };

describe('armarNoche', () => {
  it('arma los 5 bloques en orden cuando hay parejas y familia', () => {
    const { cola, bloques } = armarNoche(MAZOS, [ana, juan, lu, pepe], config, new Set(), rng());
    expect(bloques.map((b) => b.id)).toEqual(['desconocidos', 'amigos', 'parejas', 'familia', 'profundidad']);
    expect(cola).toHaveLength(50);
    for (let b = 0; b < 5; b++) expect(cola.filter((it) => it.bloque === b)).toHaveLength(10);
  });

  it('omite el bloque de parejas si no hay parejas cargadas', () => {
    const { bloques, cola } = armarNoche(MAZOS, [lu, pepe], config, new Set(), rng());
    expect(bloques.map((b) => b.id)).toEqual(['desconocidos', 'amigos', 'familia', 'profundidad']);
    expect(cola.some((it) => it.mazoId === 'pareja')).toBe(false);
  });

  it('omite el bloque de familia si nadie es familia', () => {
    const { bloques, cola } = armarNoche(MAZOS, [ana, juan, pepe], config, new Set(), rng());
    expect(bloques.map((b) => b.id)).toEqual(['desconocidos', 'amigos', 'parejas', 'profundidad']);
    expect(cola.some((it) => it.mazoId === 'familia')).toBe(false);
  });

  it('con una pareja sin vínculo simétrico no cuenta como pareja', () => {
    const { bloques } = armarNoche(MAZOS, [{ ...ana, parejaId: 'j' }, { ...juan, parejaId: undefined }], config, new Set(), rng());
    expect(bloques.map((b) => b.id)).not.toContain('parejas');
  });

  it('respeta el orden configurado de bloques', () => {
    const { bloques } = armarNoche(MAZOS, [ana, juan, lu], { ...config, ordenBloques: ['amigos', 'desconocidos', 'profundidad'] }, new Set(), rng());
    expect(bloques.map((b) => b.id)).toEqual(['amigos', 'desconocidos', 'profundidad']);
  });

  it('dentro de un bloque el nivel es ascendente', () => {
    const { cola } = armarNoche(MAZOS, [ana, juan, lu], config, new Set(), rng());
    for (let b = 0; b < 5; b++) {
      const niveles = cola.filter((it) => it.bloque === b).map((it) => it.nivel);
      expect(niveles).toEqual([...niveles].sort());
    }
  });

  it('el bloque de desconocidos solo tiene nivel 1 y el de amigos niveles 1 y 2', () => {
    const { cola } = armarNoche(MAZOS, [ana, juan, lu], config, new Set(), rng());
    expect(cola.filter((it) => it.bloque === 0).every((it) => it.nivel === 1)).toBe(true);
    const amigos = cola.filter((it) => it.bloque === 1);
    expect(amigos.every((it) => it.nivel <= 2)).toBe(true);
    expect(amigos.some((it) => it.nivel === 2)).toBe(true);
  });

  it('el bloque final es nivel 3 de varios mazos y no repite cartas', () => {
    const { cola } = armarNoche(MAZOS, [ana, juan, lu], config, new Set(), rng());
    const final = cola.filter((it) => it.bloque === 4);
    expect(final.every((it) => it.nivel === 3)).toBe(true);
    expect(new Set(final.map((it) => it.mazoId)).size).toBeGreaterThan(1);
    expect(new Set(cola.map((it) => it.cartaId)).size).toBe(cola.length);
  });

  it('cartasPorBloque configurable', () => {
    const { cola } = armarNoche(MAZOS, [pepe], { ...config, cartasPorBloque: 4 }, new Set(), rng());
    expect(cola).toHaveLength(12); // desconocidos + amigos + profundidad
  });

  it('prefiere cartas no vistas', () => {
    const vistos = new Set(MAZOS.desconocidos.cartas.filter((c) => nivelDe(MAZOS.desconocidos, c) === 1).slice(0, 15).map((c) => c.id));
    const { cola } = armarNoche(MAZOS, [pepe], config, vistos, rng());
    const desc = cola.filter((it) => it.bloque === 0);
    // Hay 20 de nivel 1, 15 vistas: las 5 nuevas tienen que estar, y 5 repetidas.
    expect(desc.filter((it) => !vistos.has(it.cartaId))).toHaveLength(5);
  });

  it('es determinista con la misma semilla y distinto con otra', () => {
    const a = armarNoche(MAZOS, [ana, juan, lu], config, new Set(), rngSemilla(1)).cola.map((i) => i.cartaId);
    const b = armarNoche(MAZOS, [ana, juan, lu], config, new Set(), rngSemilla(1)).cola.map((i) => i.cartaId);
    const c = armarNoche(MAZOS, [ana, juan, lu], config, new Set(), rngSemilla(2)).cola.map((i) => i.cartaId);
    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });
});

describe('elegirPorNiveles', () => {
  it('reparte parejo entre niveles', () => {
    const mazo = MAZOS.pareja; // niveles 1 (10), 2 (20), 3 (10)
    const elegidas = elegirPorNiveles(mazo, mazo.cartas, 9, new Set(), rng());
    const niveles = elegidas.map((c) => nivelDe(mazo, c));
    expect(niveles.filter((n) => n === 1)).toHaveLength(3);
    expect(niveles.filter((n) => n === 2)).toHaveLength(3);
    expect(niveles.filter((n) => n === 3)).toHaveLength(3);
  });
});

describe('armarCola', () => {
  it('progresivo: nivel 1 → 2 → 3 con un bloque por nivel', () => {
    const { cola, bloques } = armarCola(MAZOS.amigos, { mazoId: 'amigos', categorias: [], modo: 'progresivo' }, new Set(), rng());
    expect(cola).toHaveLength(40);
    expect(bloques.map((b) => b.id)).toEqual(['nivel-1', 'nivel-2', 'nivel-3']);
    const niveles = cola.map((it) => it.nivel);
    expect(niveles).toEqual([...niveles].sort());
    expect(cola.filter((it) => it.nivel === 1).every((it) => it.bloque === 0)).toBe(true);
  });

  it('mezclado: solo categorías activas, un bloque, no está ordenado por nivel', () => {
    const { cola, bloques } = armarCola(MAZOS.amigos, { mazoId: 'amigos', categorias: ['rompehielo', 'profundidad'], modo: 'mezclado' }, new Set(), rng());
    expect(cola).toHaveLength(20);
    expect(bloques).toHaveLength(1);
    expect(cola.every((it) => it.bloque === 0)).toBe(true);
    const niveles = cola.map((it) => it.nivel);
    expect(niveles).not.toEqual([...niveles].sort());
  });

  it('por categoría: todas las cartas activas en un bloque', () => {
    const { cola } = armarCola(MAZOS.familia, { mazoId: 'familia', categorias: ['raices'], modo: 'categoria' }, new Set(), rng());
    expect(cola).toHaveLength(10);
  });
});

describe('intercalarEspeciales', () => {
  const base = Array.from({ length: 20 }, (_, i) => ({ cartaId: `c${i}`, mazoId: 'amigos', bloque: Math.floor(i / 10), nivel: 1 as const }));

  it('mete una especial cada 8 cartas regulares', () => {
    const res = intercalarEspeciales(base, ESPECIALES, 8, rng());
    expect(res).toHaveLength(22);
    expect(res[8].especial).toBe(true);
    expect(res[17].especial).toBe(true);
    expect(res.filter((it) => it.especial)).toHaveLength(2);
  });

  it('no mete una especial al final de la cola', () => {
    const res = intercalarEspeciales(base.slice(0, 16), ESPECIALES, 8, rng());
    expect(res.at(-1)?.especial).toBeUndefined();
    expect(res.filter((it) => it.especial)).toHaveLength(1);
  });

  it('la especial hereda el bloque de la carta anterior y nunca se repite seguida', () => {
    const larga = Array.from({ length: 100 }, (_, i) => ({ cartaId: `c${i}`, mazoId: 'amigos', bloque: 0, nivel: 1 as const }));
    const res = intercalarEspeciales(larga, ESPECIALES, 8, rng());
    const esp = res.filter((it) => it.especial);
    expect(esp.every((it) => it.bloque === 0)).toBe(true);
    for (let i = 1; i < esp.length; i++) expect(esp[i].cartaId).not.toBe(esp[i - 1].cartaId);
  });
});

describe('limpiarHistorialAgotado', () => {
  it('saca del historial un mazo cuando salieron todas sus cartas', () => {
    const todasAmigos = MAZOS.amigos.cartas.map((c) => c.id);
    const vistos = [...todasAmigos, 'fa-001'];
    expect(limpiarHistorialAgotado(MAZOS, vistos)).toEqual(['fa-001']);
  });
  it('no toca mazos incompletos', () => {
    const vistos = MAZOS.amigos.cartas.slice(0, 39).map((c) => c.id);
    expect(limpiarHistorialAgotado(MAZOS, vistos)).toEqual(vistos);
  });
});
