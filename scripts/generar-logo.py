"""Genera el logo de Sale a la Luz (tres flores que brotan de una carta, dentro de un aro de luz).

Escribe public/icono.svg (ícono PWA con fondo crema, contenido en la zona segura maskable)
y src/components/Logo.tsx (marca sin fondo, con aro y brillo). Después regenerar los PNG:
  cd public && for s in 192 512 180; do qlmanage -t -s $s -o . icono.svg; mv icono.svg.png icono-$s.png; done; mv icono-180.png apple-touch-icon.png
"""
import math
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def flor(cx, cy, r_petalo, dist, color, r_centro, centro='#E6B04B', giro=-90):
    partes = []
    for i in range(5):
        a = math.radians(giro + i * 72)
        partes.append(f'<circle cx="{cx + dist * math.cos(a):.1f}" cy="{cy + dist * math.sin(a):.1f}" r="{r_petalo}" fill="{color}"/>')
    partes.append(f'<circle cx="{cx}" cy="{cy}" r="{r_centro}" fill="{centro}"/>')
    return ''.join(partes)


def marca(card='#2B2320', linea='#F7F3EE', borde='rgba(255,255,255,0.18)', con_aro=True, con_glow=True):
    p = []
    if con_glow:
        p.append('<circle cx="256" cy="205" r="235" fill="url(#logo-glow)"/>')
    if con_aro:
        p.append('<circle cx="256" cy="215" r="150" fill="none" stroke="#C9A24A" stroke-width="3" opacity="0.9"/>')
    tallo = 'stroke="#67B5A5" stroke-width="14" stroke-linecap="round" fill="none"'
    p.append(f'<path d="M256 300 L256 135" {tallo}/>')
    p.append(f'<path d="M232 300 C232 250 205 230 198 190" {tallo}/>')
    p.append(f'<path d="M282 300 C282 255 320 245 328 205" {tallo}/>')
    p.append('<path d="M240 262 C226 258 218 246 220 236 C232 240 240 250 240 262 Z" fill="#67B5A5"/>')
    p.append('<path d="M274 258 C288 254 296 242 294 232 C282 236 274 246 274 258 Z" fill="#67B5A5"/>')
    p.append(flor(196, 186, 22, 26, '#F3C4B5', 13))   # izquierda: durazno
    p.append(flor(330, 206, 21, 25, '#E8826B', 12))   # derecha: coral
    p.append(flor(256, 116, 30, 34, '#D9BDE3', 17))   # centro: lavanda, la grande
    p.append(f'<rect x="150" y="296" width="212" height="138" rx="24" fill="{card}"/>')
    p.append(f'<rect x="162" y="308" width="188" height="114" rx="16" fill="none" stroke="{borde}" stroke-width="2"/>')
    p.append(f'<rect x="184" y="344" width="124" height="14" rx="7" fill="{linea}"/>')
    p.append(f'<rect x="184" y="372" width="82" height="14" rx="7" fill="{linea}" opacity="0.6"/>')
    return ''.join(p)


GLOW = '<radialGradient id="logo-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#E6B04B" stop-opacity="0.35"/><stop offset="1" stop-color="#E6B04B" stop-opacity="0"/></radialGradient>'

icono = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>{GLOW}</defs>
  <rect width="512" height="512" rx="112" fill="#F7F3EE"/>
  <g transform="translate(256 268) scale(0.8) translate(-256 -256)">{marca(con_glow=False)}</g>
</svg>
'''
(RAIZ / 'public/icono.svg').write_text(icono)

glow_jsx = GLOW.replace('stop-color', 'stopColor').replace('stop-opacity', 'stopOpacity')
componente = f'''interface Props {{ tamano?: number; className?: string }}

/**
 * Marca de Sale a la Luz: tres flores que brotan de una carta, dentro de un aro de luz.
 * Generado por scripts/generar-logo.py; editá ahí los colores y formas.
 */
export default function Logo({{ tamano = 124, className = '' }}: Props) {{
  return (
    <svg width={{tamano}} height={{tamano}} viewBox="0 0 512 512" role="img" aria-label="Sale a la Luz" className={{className}}>
      <defs>{glow_jsx}</defs>
      <g dangerouslySetInnerHTML={{{{ __html: CUERPO }}}} />
    </svg>
  );
}}

const CUERPO = `{marca()}`;
'''
(RAIZ / 'src/components/Logo.tsx').write_text(componente)
print('ok: public/icono.svg y src/components/Logo.tsx')
