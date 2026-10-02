import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type Variante = 'primario' | 'secundario' | 'fantasma';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  children: ReactNode;
}

const clases: Record<Variante, string> = {
  primario: 'h-14 px-5 rounded-full bg-amber text-on-amber text-[17px] font-semibold tracking-[0.01em]',
  secundario: 'h-14 px-[18px] rounded-full text-text text-base font-medium',
  fantasma: 'h-12 px-3 rounded-full text-muted text-[15px] font-medium',
};

const estilos: Record<Variante, CSSProperties> = {
  primario: { boxShadow: 'var(--btn1-shadow)' },
  secundario: { background: 'var(--btn2-bg)', boxShadow: 'var(--btn2-shadow)' },
  fantasma: {},
};

export default function Boton({ variante = 'secundario', className = '', style, children, disabled, ...resto }: Props) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2.5 whitespace-nowrap transition disabled:opacity-[0.38] ${clases[variante]} ${className}`}
      style={disabled ? { ...estilos[variante], boxShadow: 'none', ...style } : { ...estilos[variante], ...style }}
      {...resto}
    >
      {children}
    </button>
  );
}
