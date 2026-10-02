import type { Bloque } from '../engine';
import { textoSobre } from '../lib/color';

interface Props { bloque: Bloque; color: string; numero: number; total: number; onSeguir: () => void }

export default function Transicion({ bloque, color, numero, total, onSeguir }: Props) {
  const texto = textoSobre(color);
  return (
    <button
      type="button"
      onClick={onSeguir}
      style={{ backgroundColor: color, color: texto }}
      className="aparecer safe-top safe-bottom flex h-full w-full flex-col items-center justify-center gap-4 px-8 text-center"
    >
      <span className="text-sm uppercase tracking-widest opacity-70">Bloque {numero} de {total}</span>
      <span className="pregunta font-semibold">{bloque.titulo}</span>
      {bloque.subtitulo && <span className="text-lg opacity-80">{bloque.subtitulo}</span>}
      <span className="mt-8 rounded-full border px-6 py-3 text-base" style={{ borderColor: texto }}>Dale</span>
    </button>
  );
}
