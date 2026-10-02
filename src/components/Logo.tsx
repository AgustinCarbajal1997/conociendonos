interface Props { tamano?: number; className?: string }

/**
 * Marca de Sale a la Luz: tres flores que brotan de una carta, dentro de un aro de luz.
 * Generado por scripts/generar-logo.py; editá ahí los colores y formas.
 */
export default function Logo({ tamano = 124, className = '' }: Props) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 512 512" role="img" aria-label="Sale a la Luz" className={className}>
      <defs><radialGradient id="logo-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#E6B04B" stopOpacity="0.35"/><stop offset="1" stopColor="#E6B04B" stopOpacity="0"/></radialGradient></defs>
      <g dangerouslySetInnerHTML={{ __html: CUERPO }} />
    </svg>
  );
}

const CUERPO = `<circle cx="256" cy="205" r="235" fill="url(#logo-glow)"/><circle cx="256" cy="215" r="150" fill="none" stroke="#C9A24A" stroke-width="3" opacity="0.9"/><path d="M256 300 L256 135" stroke="#67B5A5" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M232 300 C232 250 205 230 198 190" stroke="#67B5A5" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M282 300 C282 255 320 245 328 205" stroke="#67B5A5" stroke-width="14" stroke-linecap="round" fill="none"/><path d="M240 262 C226 258 218 246 220 236 C232 240 240 250 240 262 Z" fill="#67B5A5"/><path d="M274 258 C288 254 296 242 294 232 C282 236 274 246 274 258 Z" fill="#67B5A5"/><circle cx="196.0" cy="160.0" r="22" fill="#F3C4B5"/><circle cx="220.7" cy="178.0" r="22" fill="#F3C4B5"/><circle cx="211.3" cy="207.0" r="22" fill="#F3C4B5"/><circle cx="180.7" cy="207.0" r="22" fill="#F3C4B5"/><circle cx="171.3" cy="178.0" r="22" fill="#F3C4B5"/><circle cx="196" cy="186" r="13" fill="#E6B04B"/><circle cx="330.0" cy="181.0" r="21" fill="#E8826B"/><circle cx="353.8" cy="198.3" r="21" fill="#E8826B"/><circle cx="344.7" cy="226.2" r="21" fill="#E8826B"/><circle cx="315.3" cy="226.2" r="21" fill="#E8826B"/><circle cx="306.2" cy="198.3" r="21" fill="#E8826B"/><circle cx="330" cy="206" r="12" fill="#E6B04B"/><circle cx="256.0" cy="82.0" r="30" fill="#D9BDE3"/><circle cx="288.3" cy="105.5" r="30" fill="#D9BDE3"/><circle cx="276.0" cy="143.5" r="30" fill="#D9BDE3"/><circle cx="236.0" cy="143.5" r="30" fill="#D9BDE3"/><circle cx="223.7" cy="105.5" r="30" fill="#D9BDE3"/><circle cx="256" cy="116" r="17" fill="#E6B04B"/><rect x="150" y="296" width="212" height="138" rx="24" fill="#2B2320"/><rect x="162" y="308" width="188" height="114" rx="16" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><rect x="184" y="344" width="124" height="14" rx="7" fill="#F7F3EE"/><rect x="184" y="372" width="82" height="14" rx="7" fill="#F7F3EE" opacity="0.6"/>`;
