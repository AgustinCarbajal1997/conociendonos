import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variante = 'primario' | 'secundario' | 'fantasma';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  grande?: boolean;
  children: ReactNode;
}

const estilos: Record<Variante, string> = {
  primario: 'bg-acento text-acento-texto font-semibold active:brightness-90',
  secundario: 'bg-superficie-2 text-texto border border-borde active:bg-superficie',
  fantasma: 'bg-transparent text-texto-suave underline-offset-4 active:text-texto',
};

export default function Boton({ variante = 'secundario', grande, className = '', children, ...resto }: Props) {
  return (
    <button
      type="button"
      className={`rounded-2xl px-5 ${grande ? 'py-4 text-lg' : 'py-3 text-base'} min-h-12 transition disabled:opacity-40 ${estilos[variante]} ${className}`}
      {...resto}
    >
      {children}
    </button>
  );
}
