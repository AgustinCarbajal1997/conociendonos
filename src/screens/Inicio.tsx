import { useStore } from '../store';
import Boton from '../components/Boton';
import Logo from '../components/Logo';
import { Gente } from '../components/Icono';

export default function Inicio() {
  const elegirTipo = useStore((s) => s.elegirTipo);
  const irA = useStore((s) => s.irA);
  const seguirJugando = useStore((s) => s.seguirJugando);
  const partida = useStore((s) => s.partida);
  const jugadores = useStore((s) => s.jugadores);
  const enCurso = partida && (partida.actual || partida.cola.length > 0);

  return (
    <main className="pantalla px-6" style={{ background: 'var(--bg-inicio)' }}>
      <div className="flex-[1.2]" />
      <div className="flex flex-col items-center gap-[26px]">
        <Logo tamano={168} className="-my-4" />
        <div className="flex flex-col items-center gap-2.5">
          <h1 className="display m-0 text-center text-[56px] leading-none" style={{ letterSpacing: '-0.025em' }}>
            Sale a la <em className="font-semibold italic text-amber-text">Luz</em>
          </h1>
          <span className="etiqueta text-muted" style={{ letterSpacing: '0.16em', fontWeight: 400 }}>Cartas de conversación</span>
        </div>
        <p className="m-0 mt-1.5 max-w-[300px] text-center text-base leading-[1.45] text-muted" style={{ textWrap: 'pretty' }}>
          Lo que nunca se dijo sale a la luz con la pregunta justa. Una noche con amigos, parejas y familia, un celular en el centro.
        </p>
      </div>
      <div className="flex-1" />
      <div className="flex flex-col gap-3">
        <div className="flex h-6 items-center justify-center gap-2 text-[13px] text-muted">
          {jugadores.length > 0 && (<><Gente tamano={16} /> {jugadores.length} {jugadores.length === 1 ? 'jugador cargado' : 'jugadores cargados'}</>)}
        </div>
        {enCurso && <Boton variante="secundario" onClick={seguirJugando} className="w-full">Seguir la noche en curso</Boton>}
        <Boton variante="primario" onClick={() => elegirTipo('noche')} className="w-full">Armar la noche</Boton>
        <Boton variante="secundario" onClick={() => elegirTipo('suelto')} className="w-full">Jugar un mazo suelto</Boton>
        <Boton variante="fantasma" onClick={() => irA('como-se-juega')} className="w-full">Cómo se juega</Boton>
      </div>
    </main>
  );
}
