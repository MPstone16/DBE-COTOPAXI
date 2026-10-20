import { useEffect } from 'react';
import { AppState } from 'react-native';
import { usePomodoroStore } from '../store/usePomodoroStore';

const TICK_INTERVAL_MS = 500;

/**
 * Mantiene el temporizador actualizado mientras la app está en primer plano y
 * lo re-sincroniza con el timestamp persistido al volver de segundo plano (HU-003).
 */
export const useTimerTicker = (): void => {
  const isRunning = usePomodoroStore(state => state.isRunning);
  const tick = usePomodoroStore(state => state.tick);
  const syncBackgroundTime = usePomodoroStore(
    state => state.syncBackgroundTime,
  );

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const intervalId = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [isRunning, tick]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        syncBackgroundTime();
      }
    });
    return () => subscription.remove();
  }, [syncBackgroundTime]);
};
