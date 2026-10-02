import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { tamano?: number; grosor?: number };

function base({ tamano = 20, grosor = 1.8, ...resto }: Props) {
  return {
    width: tamano, height: tamano, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    strokeWidth: grosor, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, ...resto,
  };
}

export const ChevronIzq = (p: Props) => <svg {...base(p)}><path d="M15 6l-6 6 6 6" /></svg>;
export const ChevronAbajo = (p: Props) => <svg {...base(p)}><path d="M6 9l6 6 6-6" /></svg>;
export const FlechaDer = (p: Props) => <svg {...base(p)}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>;
export const FlechaIzq = (p: Props) => <svg {...base(p)}><path d="M19 12H5" /><path d="M12 5l-7 7 7 7" /></svg>;
export const Mas = (p: Props) => <svg {...base(p)}><path d="M12 5v14" /><path d="M5 12h14" /></svg>;
export const Menos = (p: Props) => <svg {...base(p)}><path d="M5 12h14" /></svg>;
export const Cerrar = (p: Props) => <svg {...base(p)}><path d="M6 6l12 12" /><path d="M18 6L6 18" /></svg>;
export const Corazon = ({ lleno, ...p }: Props & { lleno?: boolean }) => (
  <svg {...base(p)} fill={lleno ? 'currentColor' : 'none'}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);
export const Agarre = (p: Props) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <circle cx="9" cy="6" r="1.6" /><circle cx="15" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" /><circle cx="15" cy="18" r="1.6" />
  </svg>
);
export const Copiar = (p: Props) => <svg {...base(p)}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>;
export const Gente = (p: Props) => (
  <svg {...base(p)}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 15.5a5 5 0 0 1 5.5 4.5" /></svg>
);
export const Destello = (p: Props) => (
  <svg {...base(p)}><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M5.6 5.6l2.8 2.8" /><path d="M15.6 15.6l2.8 2.8" /><path d="M18.4 5.6l-2.8 2.8" /><path d="M8.4 15.6l-2.8 2.8" /></svg>
);
export const Lapiz = (p: Props) => <svg {...base(p)}><path d="M4 20h4l10-10-4-4L4 16v4z" /><path d="M13 7l4 4" /></svg>;
