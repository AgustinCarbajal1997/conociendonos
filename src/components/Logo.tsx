interface Props { tamano?: number; className?: string }

/** Marca de Sale a la Luz: un sol que asoma detrás de una carta. Sin fondo, sirve sobre cualquier color. */
export default function Logo({ tamano = 96, className = '' }: Props) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="40 40 432 432"
      role="img"
      aria-label="Sale a la Luz"
      className={className}
    >
      <defs>
        <linearGradient id="logo-sol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE08A" />
          <stop offset="1" stopColor="#FF7A59" />
        </linearGradient>
      </defs>
      <g stroke="#FFD66B" strokeWidth="16" strokeLinecap="round">
        <line x1="256" y1="96" x2="256" y2="48" />
        <line x1="158" y1="136" x2="124" y2="102" />
        <line x1="354" y1="136" x2="388" y2="102" />
        <line x1="118" y1="232" x2="70" y2="232" />
        <line x1="394" y1="232" x2="442" y2="232" />
      </g>
      <circle cx="256" cy="240" r="104" fill="url(#logo-sol)" />
      <rect x="132" y="240" width="248" height="196" rx="30" fill="#1C1A24" stroke="#FFD66B" strokeWidth="8" />
      <rect x="176" y="300" width="160" height="16" rx="8" fill="#F5F0E8" />
      <rect x="176" y="340" width="104" height="16" rx="8" fill="#F5F0E8" opacity="0.55" />
    </svg>
  );
}
