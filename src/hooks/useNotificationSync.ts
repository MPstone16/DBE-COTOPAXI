import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import {
  cancelPhaseAlarms,
  initializeNotifications,
  openExactAlarmSettings,
  schedulePhaseAlarms,
} from '../services/notifications';
import { getUpcomingPhaseEnds } from '../store/timerLogic';
import type { PomodoroState } from '../store/types';
import { usePomodoroStore } from '../store/usePomodoroStore';

const hasScheduleChanged = (
  state: PomodoroState,
  previous: PomodoroState,
): boolean =>
  state.isRunning !== previous.isRunning ||
  state.targetEndTime !== previous.targetEndTime ||
  state.settings !== previous.settings;

const syncAlarms = async (state: PomodoroState): Promise<void> => {
  if (!state.isRunning) {
    await cancelPhaseAlarms();
    return;
  }
  // Un ciclo completo (estudio + descanso por cada pomodoro) por adelantado.
  const phaseEnds = getUpcomingPhaseEnds(
    state,
    state.settings,
    state.settings.pomodorosPerCycle * 2,
  );
  await schedulePhaseAlarms(phaseEnds, state.settings);
};

const promptMissingPermissions = (
  notificationsGranted: boolean,
  exactAlarmsGranted: boolean,
): void => {
  if (!notificationsGranted) {
    Alert.alert(
      'Notificaciones desactivadas',
      'Activa las notificaciones en los ajustes del sistema para recibir la alarma al terminar cada fase.',
    );
    return;
  }
  if (!exactAlarmsGranted && Platform.OS === 'android') {
    Alert.alert(
      'Alarmas puntuales',
      'Permite las "alarmas y recordatorios" para que la alarma suene exactamente al terminar cada fase, incluso con el celular bloqueado.',
      [
        { text: 'Ahora no', style: 'cancel' },
        {
          text: 'Permitir',
          onPress: () => {
            openExactAlarmSettings().catch(() => undefined);
          },
        },
      ],
    );
  }
};

/**
 * HU-004: solicita los permisos iniciales y mantiene las alarmas programadas
 * en sincronía con el estado del temporizador.
 */
export const useNotificationSync = (): void => {
  useEffect(() => {
    let isActive = true;
    let unsubscribe: (() => void) | undefined;
    let queue: Promise<void> = Promise.resolve();

    // Serializa las sincronizaciones y usa siempre el estado más reciente.
    const run = (): void => {
      queue = queue
        .then(() => syncAlarms(usePomodoroStore.getState()))
        .catch(() => undefined);
    };

    initializeNotifications()
      .then(({ notificationsGranted, exactAlarmsGranted }) => {
        if (!isActive) {
          return;
        }
        promptMissingPermissions(notificationsGranted, exactAlarmsGranted);
        run();
        unsubscribe = usePomodoroStore.subscribe((state, previous) => {
          if (hasScheduleChanged(state, previous)) {
            run();
          }
        });
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, []);
};
