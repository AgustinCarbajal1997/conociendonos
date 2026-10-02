import { useEffect } from 'react';

/** Mantiene la pantalla encendida mientras `activo` sea true (Wake Lock API, si existe). */
export function useWakeLock(activo: boolean) {
  useEffect(() => {
    if (!activo || !('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelado = false;

    const pedir = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelado) await lock.release();
      } catch {
        /* sin permiso o batería baja: se ignora */
      }
    };
    const alVolver = () => { if (document.visibilityState === 'visible') void pedir(); };

    void pedir();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      cancelado = true;
      document.removeEventListener('visibilitychange', alVolver);
      void lock?.release();
    };
  }, [activo]);
}
