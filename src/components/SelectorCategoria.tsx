import type { Categoria } from '../engine';
import { textoSobre } from '../lib/color';

interface Props {
  titulo: string;
  color: string;
  quien: string;
  categorias: Categoria[];
  onElegir: (catId: string) => void;
  onTerminar: () => void;
}

export default function SelectorCategoria({ titulo, color, quien, categorias, onElegir, onTerminar }: Props) {
  const texto = textoSobre(color);
  return (
    <div style={{ backgroundColor: color, color: texto }} className="aparecer safe-top safe-bottom flex h-full flex-col px-6">
      <div className="flex items-center justify-between py-2">
        <span className="text-sm uppercase tracking-widest opacity-70">{titulo}</span>
        <button type="button" onClick={onTerminar} className="min-h-12 px-2 text-sm underline underline-offset-4 opacity-80">Terminar</button>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-6">
        <div className="text-center">
          <p className="text-lg opacity-80">{quien}</p>
          <p className="pregunta font-semibold">¿Qué categoría va ahora?</p>
        </div>
        <div className="flex flex-col gap-3">
          {categorias.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onElegir(c.id)}
              className="min-h-14 rounded-2xl border-2 px-4 py-3 text-lg font-medium"
              style={{ borderColor: texto }}
            >
              {c.nombre}
              <span className="ml-2 text-sm opacity-70">nivel {c.nivel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
