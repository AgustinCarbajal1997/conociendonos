import { useStore } from '../store';
import Encabezado, { BotonVolver } from '../components/Encabezado';
import { LISTA_MAZOS } from '../content';

const PASOS = [
  ['Un celular en el centro', 'Parado en la mesa o pasando de mano. La luz baja, la pantalla se lee desde lejos.'],
  ['Una pregunta por pantalla', 'La carta dice a quién le toca. Esa persona la lee en voz alta, responde o pasa, y toca Siguiente. El resto escucha.'],
  ['Sin puntos ni ganadores', 'Deslizá para seguir o pasar; mantené apretada una carta para guardarla. Lo importante es la charla.'],
  ['Cartas especiales', 'Cada ocho cartas puede salir una: Profundizá, Devolvé, Elegí vos o Todos responden. Siempre se puede pasar.'],
];

export default function ComoSeJuega() {
  const irA = useStore((s) => s.irA);
  return (
    <main className="pantalla">
      <Encabezado izquierda={<BotonVolver onClick={() => irA('inicio')} />} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <h1 className="display m-0 mt-3.5 text-[40px] leading-[1.02]">Cómo se juega</h1>
        <ol className="m-0 mt-6 flex list-none flex-col gap-[18px] p-0">
          {PASOS.map(([titulo, texto], i) => (
            <li key={titulo} className="flex items-start gap-3.5">
              <span className="display mt-px w-[22px] shrink-0 text-[26px] italic leading-none text-amber-text">{i + 1}</span>
              <span className="flex flex-col gap-[3px]">
                <span className="text-[17px] font-semibold">{titulo}</span>
                <span className="text-[15px] leading-[1.42] text-muted" style={{ textWrap: 'pretty' }}>{texto}</span>
              </span>
            </li>
          ))}
        </ol>
        <span className="etiqueta mt-7 block text-muted">Cinco mazos</span>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5 pb-4">
          {LISTA_MAZOS.map((m) => (
            <div key={m.id} data-mazo={m.id} className="relative flex min-h-[108px] flex-col justify-between gap-2.5 rounded-[20px] px-4 pb-3.5 pt-4" style={{ background: 'var(--m-card)', color: 'var(--m-text)' }}>
              <div aria-hidden className="pointer-events-none absolute inset-[7px] rounded-[14px] border" style={{ borderColor: 'var(--m-line)' }} />
              <span className="display text-[22px] leading-none">{m.nombre}</span>
              <span className="text-[13px] leading-[1.35]" style={{ color: 'var(--m-note)' }}>{m.descripcion}.</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
