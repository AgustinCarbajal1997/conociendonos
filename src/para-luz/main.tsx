import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import Logo from '../components/Logo';
import texto from './carta.txt?raw';

// Usa el tema que la persona eligió en la app, si lo hay; si no, claro.
try {
  const guardado = JSON.parse(localStorage.getItem('sale-a-la-luz') ?? 'null');
  if (guardado?.state?.config?.tema === 'oscuro') document.documentElement.dataset.theme = 'oscuro';
} catch {
  /* sin almacenamiento: queda claro */
}

const bloques = texto.trim().split(/\n\s*\n/);
const saludo = bloques[0];
const despedida = bloques[bloques.length - 1].split('\n');
const cuerpo = bloques.slice(1, -1);

function Carta() {
  return (
    <main className="min-h-full px-5 pb-14 pt-[max(env(safe-area-inset-top),40px)]" style={{ background: 'var(--bg-app)', backgroundAttachment: 'fixed' }}>
      <article
        className="mx-auto max-w-[620px] rounded-[28px] bg-surface px-6 py-10 sm:px-12 sm:py-14"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h1 className="display m-0 text-[44px] italic leading-none text-amber-text">{saludo}</h1>
        <div className="mt-8 flex flex-col gap-5 font-display text-[19px] leading-[1.62] sm:text-[20px]" style={{ textWrap: 'pretty' }}>
          {cuerpo.map((p, i) => <p key={i} className="m-0">{p}</p>)}
        </div>
        <div className="mt-10 flex flex-col gap-1 font-display text-[19px] leading-snug sm:text-[20px]">
          {despedida.map((linea, i) => (
            <span key={i} className={i === despedida.length - 1 ? 'display mt-1 text-[30px] italic' : ''}>{linea}</span>
          ))}
        </div>
      </article>
      <footer className="mt-10 flex justify-center">
        <Logo tamano={64} />
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Carta />
  </StrictMode>,
);
