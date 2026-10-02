import { useStore } from '../store';
import Encabezado from '../components/Encabezado';
import { LISTA_MAZOS } from '../content';
import { textoSobre } from '../lib/color';

export default function ComoSeJuega() {
  const irA = useStore((s) => s.irA);
  return (
    <main className="flex h-full flex-col">
      <Encabezado titulo="Cómo se juega" onVolver={() => irA('inicio')} />
      <div className="safe-bottom flex-1 overflow-y-auto px-6 pb-6 text-base leading-relaxed">
        <p>No hay puntos ni ganadores. El celular queda en el centro de la mesa y pasa de mano: aparece una pregunta y el nombre de quien la responde. Esa persona la lee en voz alta, responde o pasa, y toca <strong>Siguiente</strong>. El resto escucha.</p>

        <h2 className="mt-6 text-lg font-semibold">En la carta</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Deslizar a la izquierda o tocar <strong>Siguiente</strong>: próxima carta.</li>
          <li>Deslizar a la derecha o tocar <strong>Pasar</strong>: la carta vuelve más adelante para otra persona. Dos pases por jugador.</li>
          <li>Mantener apretada la carta medio segundo: se guarda como favorita. Al final se pueden copiar.</li>
          <li>La pantalla no se apaga mientras juegan.</li>
        </ul>

        <h2 className="mt-6 text-lg font-semibold">Modo Noche</h2>
        <p className="mt-2">Arma sola la secuencia: rompehielo para todos, amigos, parejas, familia y, para cerrar, profundidad de todos los mazos. Si no cargaste parejas o familia, esos bloques se saltan. Entre bloque y bloque aparece una carta de transición.</p>

        <h2 className="mt-6 text-lg font-semibold">Los mazos</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {LISTA_MAZOS.map((m) => (
            <li key={m.id} className="rounded-xl px-4 py-3" style={{ backgroundColor: m.color, color: textoSobre(m.color) }}>
              <span className="font-semibold">{m.nombre}</span> · {m.descripcion}
              <span className="mt-1 block text-sm opacity-80">{m.categorias.map((c) => c.nombre).join(' · ')}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-lg font-semibold">Cartas especiales</h2>
        <p className="mt-2">Una cada ocho cartas, si están activadas. <strong>Profundizá</strong>: quien respondió la última cuenta un poco más. <strong>Devolvé</strong>: responde la pregunta anterior y elige a quién hacérsela. <strong>Elegí vos</strong>: elige la categoría de la próxima. <strong>Todos responden</strong>: la próxima la responde toda la mesa.</p>

        <h2 className="mt-6 text-lg font-semibold">Regla de oro</h2>
        <p className="mt-2">Las cartas preguntan, no obligan. Siempre se puede pasar con dignidad.</p>
      </div>
    </main>
  );
}
