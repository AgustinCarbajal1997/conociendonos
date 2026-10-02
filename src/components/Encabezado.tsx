import type { ReactNode } from 'react';
import { ChevronIzq } from './Icono';

interface Props { izquierda?: ReactNode; derecha?: ReactNode }

/** Fila superior de 48 px: acción a la izquierda, dato a la derecha. */
export default function Encabezado({ izquierda, derecha }: Props) {
  return (
    <div className="flex h-12 items-center justify-between">
      <div>{izquierda}</div>
      <div className="text-sm text-muted tabular">{derecha}</div>
    </div>
  );
}

export function BotonVolver({ onClick, texto = 'Volver' }: { onClick: () => void; texto?: string }) {
  return (
    <button type="button" onClick={onClick} className="-ml-1.5 flex h-12 items-center gap-1 rounded-full pl-1.5 pr-3 text-[15px] font-medium text-muted">
      <ChevronIzq tamano={18} />
      {texto}
    </button>
  );
}

export function Titulo({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h1 className={`display mt-[18px] text-[34px] leading-[1.04] ${className}`}>{children}</h1>;
}
