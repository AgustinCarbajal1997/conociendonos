import { useStore } from '../store';
import Boton from '../components/Boton';
import Logo from '../components/Logo';

export default function Inicio() {
  const elegirTipo = useStore((s) => s.elegirTipo);
  const irA = useStore((s) => s.irA);
  const seguirJugando = useStore((s) => s.seguirJugando);
  const partida = useStore((s) => s.partida);
  const jugadores = useStore((s) => s.jugadores);
  const enCurso = partida && (partida.actual || partida.cola.length > 0);

  return (
    <main className="safe-top safe-bottom flex h-full flex-col justify-between px-6 py-8">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <Logo tamano={120} className="mb-6" />
        <h1 className="text-5xl font-bold tracking-tight">Sale a la Luz</h1>
        <p className="mt-4 max-w-xs text-lg text-texto-suave">
          Cartas de conversación para una noche con amigos, parejas y familia. Un celular en el centro, una pregunta por pantalla.
        </p>
        {jugadores.length > 0 && (
          <p className="mt-6 text-sm text-texto-suave">
            {jugadores.length} {jugadores.length === 1 ? 'jugador cargado' : 'jugadores cargados'}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {enCurso && (
          <Boton variante="secundario" grande onClick={seguirJugando}>
            Seguir la noche en curso
          </Boton>
        )}
        <Boton variante="primario" grande onClick={() => elegirTipo('noche')}>
          Armar la noche
        </Boton>
        <Boton variante="secundario" onClick={() => elegirTipo('suelto')}>
          Jugar un mazo suelto
        </Boton>
        <Boton variante="fantasma" onClick={() => irA('como-se-juega')}>
          Cómo se juega
        </Boton>
      </div>
    </main>
  );
}
