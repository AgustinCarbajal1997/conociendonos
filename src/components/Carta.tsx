import type { Nivel } from '../engine';
import NivelPuntos from './NivelPuntos';
import { Corazon, Destello, FlechaDer, FlechaIzq } from './Icono';

interface Props {
  mazoId: string;
  etiqueta: string;
  nivel?: Nivel;
  quien: string;
  nota?: string;
  texto: string;
  /** Carta especial: título grande arriba del texto. */
  tituloEspecial?: string;
  favorita: boolean;
  puedePasar: boolean;
  claveAnimacion: string;
}

export default function Carta({ mazoId, etiqueta, nivel, quien, nota, texto, tituloEspecial, favorita, puedePasar, claveAnimacion }: Props) {
  const especial = !!tituloEspecial;
  return (
    <div className="relative mt-2.5 flex flex-1" data-mazo={mazoId}>
      {/* Pila: dos cartas detrás */}
      <div aria-hidden className="absolute -top-3 left-4 right-4 h-10 rounded-[28px]" style={{ background: 'var(--m-stack-2)' }} />
      <div aria-hidden className="absolute -top-1.5 left-2 right-2 h-10 rounded-[28px]" style={{ background: 'var(--m-stack-1)' }} />

      <div
        key={claveAnimacion}
        className="voltear relative flex flex-1 rounded-[28px]"
        style={especial
          ? { padding: 2, background: 'var(--gradient-especial)', boxShadow: '0 0 60px -10px var(--glow-especial), 0 18px 40px -24px rgb(0 0 0 / 0.4)' }
          : { background: 'var(--m-card)', color: 'var(--m-text)', boxShadow: 'var(--shadow-card)' }}
      >
        <div
          className="relative flex flex-1 flex-col overflow-hidden px-6 pb-[22px] pt-[26px]"
          style={especial ? { background: 'var(--m-card)', color: 'var(--m-text)', borderRadius: 26 } : { borderRadius: 28 }}
        >
          {especial && (
            <div aria-hidden className="pointer-events-none absolute -left-10 -right-10 -top-[140px] h-80" style={{ background: 'radial-gradient(50% 60% at 50% 50%, var(--glow-especial) 0%, transparent 70%)' }} />
          )}
          <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[19px] border" style={{ borderColor: 'var(--m-line)' }} />

          <div className="relative flex items-center justify-between">
            <span className="etiqueta" style={{ color: especial ? 'var(--m-chip)' : 'var(--m-note)' }}>{etiqueta}</span>
            {especial ? <Destello tamano={18} style={{ color: 'var(--m-chip)' }} /> : nivel && <NivelPuntos nivel={nivel} />}
          </div>

          <div className="relative mt-[26px] flex flex-col gap-1">
            <span className="display text-[30px] leading-none italic" style={{ letterSpacing: '-0.01em' }}>{quien}</span>
            {nota && <span className="text-sm" style={{ color: 'var(--m-note)' }}>{nota}</span>}
          </div>

          <div className="flex-1" />

          {especial ? (
            <div className="relative flex flex-col gap-3.5">
              <span className="display text-[44px] font-semibold leading-none" style={{ color: 'var(--m-chip)' }}>{tituloEspecial}</span>
              <p className="m-0 font-display text-[28px] font-normal leading-[1.18]" style={{ letterSpacing: '-0.01em', textWrap: 'pretty' }} aria-live="polite" aria-atomic="true">
                {texto}
              </p>
            </div>
          ) : (
            <p className="pregunta relative m-0" aria-live="polite" aria-atomic="true">{texto}</p>
          )}

          <div className="flex-[1.3]" />

          <div className="relative flex items-center justify-between" style={{ color: 'var(--m-note)' }}>
            {especial ? (
              <span className="pista mx-auto"><FlechaIzq tamano={14} grosor={2} /> deslizá para seguir</span>
            ) : (
              <>
                <span className="pista"><FlechaIzq tamano={14} grosor={2} /> siguiente</span>
                {favorita && <span className="pista"><Corazon tamano={14} grosor={2} lleno /> guardada</span>}
                {puedePasar ? <span className="pista">pasar <FlechaDer tamano={14} grosor={2} /></span> : <span />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
