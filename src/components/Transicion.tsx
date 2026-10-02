import type { Bloque } from '../engine';
import Boton from './Boton';

interface Props {
  bloque: Bloque;
  mazoId: string;
  numero: number;
  total: number;
  detalle?: string;
  onSeguir: () => void;
}

function conItalica(titulo: string) {
  const i = titulo.indexOf(', ');
  if (i < 0) return titulo;
  return (<>{titulo.slice(0, i + 2)}<em>{titulo.slice(i + 2)}</em></>);
}

export default function Transicion({ bloque, mazoId, numero, total, detalle, onSeguir }: Props) {
  return (
    <main
      data-mazo={mazoId}
      className="pantalla aparecer px-6"
      style={{
        background: 'radial-gradient(110% 50% at 50% -10%, color-mix(in srgb, var(--m-card), white 10%) 0%, var(--m-card) 55%, color-mix(in srgb, var(--m-card), black 8%) 100%)',
        color: 'var(--m-text)',
      }}
    >
      <div className="flex h-12 items-center gap-1.5" aria-label={`Bloque ${numero} de ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-[3px] flex-1 rounded-sm"
            style={{
              background: i + 1 < numero
                ? 'var(--m-text)'
                : i + 1 === numero
                  ? 'linear-gradient(90deg, var(--m-text) 0%, var(--m-text) 50%, color-mix(in srgb, var(--m-text) 30%, transparent) 50%)'
                  : 'color-mix(in srgb, var(--m-text) 30%, transparent)',
            }}
          />
        ))}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-[22px] pb-10">
        <span className="etiqueta" style={{ color: 'var(--m-note)', letterSpacing: '0.16em', fontSize: 13 }}>Bloque {numero} de {total}</span>
        <h1 className="display m-0 text-[52px] leading-[1.02]" style={{ textWrap: 'balance' }}>{conItalica(bloque.titulo)}</h1>
        {bloque.subtitulo && <p className="m-0 max-w-[300px] text-[19px] leading-[1.4]" style={{ color: 'var(--m-note)', textWrap: 'pretty' }}>{bloque.subtitulo}</p>}
      </div>

      <div className="flex flex-col gap-3.5">
        {detalle && (
          <div className="flex items-center justify-center gap-1.5 text-[13px]" style={{ color: 'var(--m-note)' }}>
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--m-note)' }} />
            {detalle}
          </div>
        )}
        <Boton onClick={onSeguir} className="w-full text-[17px] font-semibold" style={{ background: 'var(--m-text)', color: 'var(--m-card)', boxShadow: 'none' }}>
          Dale
        </Boton>
      </div>
    </main>
  );
}
