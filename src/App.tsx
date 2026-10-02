import { useEffect } from 'react';
import { useStore } from './store';
import Inicio from './screens/Inicio';
import Jugadores from './screens/Jugadores';
import Configuracion from './screens/Configuracion';
import PantallaCarta from './screens/PantallaCarta';
import Resumen from './screens/Resumen';
import ComoSeJuega from './screens/ComoSeJuega';

const ESCALAS = ['1', '1.15', '1.3'];

export default function App() {
  const pantalla = useStore((s) => s.pantalla);
  const tamanoLetra = useStore((s) => s.config.tamanoLetra);

  useEffect(() => {
    document.documentElement.style.setProperty('--escala-letra', ESCALAS[tamanoLetra] ?? '1');
  }, [tamanoLetra]);

  switch (pantalla) {
    case 'inicio': return <Inicio />;
    case 'jugadores': return <Jugadores />;
    case 'configuracion': return (<><Jugadores /><Configuracion /></>);
    case 'carta': return <PantallaCarta />;
    case 'resumen': return <Resumen />;
    case 'como-se-juega': return <ComoSeJuega />;
  }
}
