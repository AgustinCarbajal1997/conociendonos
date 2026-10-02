interface Props { tamano?: number; className?: string }

/** Marca de Sale a la Luz: un sol que asoma detrás de una carta. Sirve sobre cualquier fondo. */
export default function Logo({ tamano = 124, className = '' }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 512 512" role="img" aria-label="Sale a la Luz" className={className}>
      <defs>
        <linearGradient id="logo-sol" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7C45A" />
          <stop offset="1" stopColor="#F08A6B" />
        </linearGradient>
        <radialGradient id="logo-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#F7C45A" stopOpacity="0.5" />
          <stop offset="1" stopColor="#F7C45A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="256" cy="236" r="230" fill="url(#logo-glow)" />
      <circle cx="256" cy="240" r="118" fill="url(#logo-sol)" />
      <rect x="136" y="240" width="240" height="210" rx="26" fill="#2A1F18" />
      <rect x="150" y="254" width="212" height="182" rx="16" fill="none" stroke="#F4ECE1" strokeOpacity="0.18" strokeWidth="2" />
      <rect x="176" y="302" width="140" height="16" rx="8" fill="#F8F2EA" />
      <rect x="176" y="336" width="96" height="16" rx="8" fill="#F8F2EA" fillOpacity="0.7" />
    </svg>
  );
}
