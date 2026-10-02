interface Props { titulo: string; onVolver?: () => void; derecha?: React.ReactNode }

export default function Encabezado({ titulo, onVolver, derecha }: Props) {
  return (
    <header className="safe-top flex items-center gap-2 px-3 pb-2 pt-3">
      {onVolver ? (
        <button type="button" onClick={onVolver} aria-label="Volver" className="min-h-12 min-w-12 rounded-full text-2xl">
          ‹
        </button>
      ) : <span className="w-12" />}
      <h1 className="flex-1 text-center text-lg font-semibold">{titulo}</h1>
      <span className="min-w-12 text-right">{derecha}</span>
    </header>
  );
}
