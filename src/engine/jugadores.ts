import type { Jugador, Quien } from './tipos';

/** Parejas cargadas, en orden de carga del primer miembro. Solo cuenta si el vínculo es simétrico. */
export function parejas(jugadores: Jugador[]): [Jugador, Jugador][] {
  const usados = new Set<string>();
  const resultado: [Jugador, Jugador][] = [];
  for (const j of jugadores) {
    if (usados.has(j.id) || !j.parejaId) continue;
    const otro = jugadores.find((o) => o.id === j.parejaId);
    if (!otro || otro.parejaId !== j.id || usados.has(otro.id)) continue;
    usados.add(j.id);
    usados.add(otro.id);
    resultado.push([j, otro]);
  }
  return resultado;
}

export function familiares(jugadores: Jugador[]): Jugador[] {
  return jugadores.filter((j) => j.familia);
}

/** Asigna o rompe el vínculo de pareja de forma simétrica. */
export function vincularPareja(jugadores: Jugador[], id: string, parejaId: string | undefined): Jugador[] {
  const actual = jugadores.find((j) => j.id === id);
  const viejaPareja = actual?.parejaId;
  const nuevaPareja = parejaId ? jugadores.find((j) => j.id === parejaId) : undefined;
  const exParejaDeNueva = nuevaPareja?.parejaId;
  return jugadores.map((j) => {
    if (j.id === id) return { ...j, parejaId };
    if (j.id === parejaId) return { ...j, parejaId: id };
    // Los que quedan sueltos por el cambio pierden el vínculo.
    if (j.id === viejaPareja || j.id === exParejaDeNueva) return { ...j, parejaId: undefined };
    return j;
  });
}

/** Clave estable para contar pases por quien responde. */
export function claveQuien(quien: Quien): string {
  switch (quien.tipo) {
    case 'jugador': return quien.jugadorId;
    case 'pareja': return quien.jugadorIds.slice().sort().join('+');
    case 'todos': return 'todos';
    case 'celular': return 'celular';
  }
}

/** Texto para mostrar en pantalla: "Ana", "Ana y Juan", "Todos", "Quien tenga el celular". */
export function nombreQuien(quien: Quien | null, jugadores: Jugador[]): string {
  if (!quien) return '';
  const nombre = (id: string) => jugadores.find((j) => j.id === id)?.nombre ?? '?';
  switch (quien.tipo) {
    case 'jugador': return nombre(quien.jugadorId);
    case 'pareja': return `${nombre(quien.jugadorIds[0])} y ${nombre(quien.jugadorIds[1])}`;
    case 'todos': return 'Todos';
    case 'celular': return 'Quien tenga el celular';
  }
}
