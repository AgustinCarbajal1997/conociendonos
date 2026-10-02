import { textoSobre } from '../lib/color';

interface Props {
  color: string;
  etiqueta: string;
  quien: string;
  nota?: string;
  texto: string;
  favorita: boolean;
  claveAnimacion: string;
}

export default function Carta({ color, etiqueta, quien, nota, texto, favorita, claveAnimacion }: Props) {
  const colorTexto = textoSobre(color);
  return (
    <div
      key={claveAnimacion}
      className="voltear flex flex-1 flex-col items-center justify-center rounded-3xl px-6 py-8 text-center shadow-2xl"
      style={{ backgroundColor: color, color: colorTexto }}
    >
      <span className="mb-6 rounded-full border px-3 py-1 text-xs uppercase tracking-widest opacity-80" style={{ borderColor: colorTexto }}>
        {etiqueta}
      </span>
      <p className="text-xl font-medium opacity-90">{quien}</p>
      {nota && <p className="mt-1 text-sm opacity-70">{nota}</p>}
      <p className="pregunta mt-6 font-semibold" aria-live="polite" aria-atomic="true">
        {texto}
      </p>
      {favorita && (
        <span className="mt-8 text-2xl" aria-label="Favorita" role="img">♥</span>
      )}
    </div>
  );
}
