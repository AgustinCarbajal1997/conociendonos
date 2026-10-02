import { useEffect } from 'react';
import { useStore } from './store';
import Inicio from './screens/Inicio';
import Jugadores from './screens/Jugadores';
import Configuracion from './screens/Configuracion';
import PantallaCarta from './screens/PantallaCarta';
import Resumen from './screens/Resumen';
import ComoSeJuega from './screens/ComoSeJuega';

/** Tamaño de la pregunta en la carta: chico, medio, grande. */
const TAMANOS = [
  { size: '28px', lh: '1.16' },
  { size: '32px', lh: '1.14' },
  { size: '36px', lh: '1.14' },
];

function Dedicatoria() {
  return (
    <footer className="dedicatoria" aria-label="Dedicatoria">
      <span>Dedicada a L.B., with love from Paris</span>
      <span aria-hidden>❤️💍</span>
    </footer>
  );
}

export default function App() {
  const pantalla = useStore((s) => s.pantalla);
  const tamanoLetra = useStore((s) => s.config.tamanoLetra);
  const tema = useStore((s) => s.config.tema);

  useEffect(() => {
    const t = TAMANOS[tamanoLetra] ?? TAMANOS[1];
    document.documentElement.style.setProperty('--q-size', t.size);
    document.documentElement.style.setProperty('--q-lh', t.lh);
  }, [tamanoLetra]);

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'oscuro' ? '#130E0B' : '#F7F3EE');
  }, [tema]);

  const contenido = (() => {
    switch (pantalla) {
      case 'inicio': return <Inicio />;
      case 'jugadores': return <Jugadores />;
      case 'configuracion': return (<><Jugadores /><Configuracion /></>);
      case 'carta': return <PantallaCarta />;
      case 'resumen': return <Resumen />;
      case 'como-se-juega': return <ComoSeJuega />;
    }
  })();
  return (<>{contenido}<Dedicatoria /></>);
}
