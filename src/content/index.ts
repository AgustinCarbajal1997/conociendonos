import type { Especial, Mazo } from '../engine/tipos';
import desconocidos from './desconocidos.json';
import amigos from './amigos.json';
import pareja from './pareja.json';
import familia from './familia.json';
import profundo from './profundo.json';
import especialesJson from './especiales.json';

export const MAZOS: Record<string, Mazo> = {
  desconocidos: desconocidos as Mazo,
  amigos: amigos as Mazo,
  pareja: pareja as Mazo,
  familia: familia as Mazo,
  profundo: profundo as Mazo,
};

export const LISTA_MAZOS: Mazo[] = [MAZOS.desconocidos, MAZOS.amigos, MAZOS.pareja, MAZOS.familia, MAZOS.profundo];
export const ESPECIALES: Especial[] = especialesJson as Especial[];

export function buscarCarta(id: string): { mazo: Mazo; carta: Mazo['cartas'][number] } | null {
  for (const mazo of LISTA_MAZOS) {
    const carta = mazo.cartas.find((c) => c.id === id);
    if (carta) return { mazo, carta };
  }
  return null;
}
