import { useRef } from 'react';
import type { PointerEvent } from 'react';

/** Handlers de pointer para detectar "mantener apretado" (default 500 ms) sin disparar el click. */
export function useMantenerApretado(accion: () => void, ms = 500) {
  const timer = useRef<number | null>(null);
  const origen = useRef<{ x: number; y: number } | null>(null);
  const disparado = useRef(false);

  const cancelar = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
    origen.current = null;
  };

  return {
    disparado,
    handlers: {
      onPointerDown: (e: PointerEvent) => {
        disparado.current = false;
        origen.current = { x: e.clientX, y: e.clientY };
        timer.current = window.setTimeout(() => {
          disparado.current = true;
          if (navigator.vibrate) navigator.vibrate(20);
          accion();
        }, ms);
      },
      onPointerMove: (e: PointerEvent) => {
        if (!origen.current) return;
        if (Math.hypot(e.clientX - origen.current.x, e.clientY - origen.current.y) > 12) cancelar();
      },
      onPointerUp: cancelar,
      onPointerCancel: cancelar,
      onPointerLeave: cancelar,
    },
  };
}
