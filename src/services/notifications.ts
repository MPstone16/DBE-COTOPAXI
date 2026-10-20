import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { PhaseEnd } from '../store/timerLogic';
import type { PomodoroSettings, TimerMode } from '../store/types';

export const ALARM_CHANNEL_ID = 'pomodoro-alarm';
const NOTIFICATION_ID_PREFIX = 'pomodoro-phase-';
const VIBRATION_PATTERN = [0, 400, 600, 400, 600, 400];

export interface NotificationPermissions {
  notificationsGranted: boolean;
  exactAlarmsGranted: boolean;
}

export interface PhaseMessage {
  title: string;
  body: string;
}

const NEXT_MODE_DURATION: Record<TimerMode, keyof PomodoroSettings> = {
  work: 'workDuration',
  shortBreak: 'shortBreakDuration',
  longBreak: 'longBreakDuration',
};

export const buildPhaseMessage = (
  phaseEnd: PhaseEnd,
  settings: PomodoroSettings,
): PhaseMessage => {
  const minutes = settings[NEXT_MODE_DURATION[phaseEnd.nextMode]];
  switch (phaseEnd.nextMode) {
    case 'shortBreak':
      return {
        title: '¡Pomodoro completado!',
        body: `Tómate un descanso corto de ${minutes} min.`,
      };
    case 'longBreak':
      return {
        title: '¡Ciclo completado!',
        body: `Te ganaste un descanso largo de ${minutes} min.`,
      };
    case 'work':
      return {
        title: 'Fin del descanso',
        body: `Hora de volver a estudiar: ${minutes} min.`,
      };
  }
};

// Muestra la alarma con sonido también cuando la app está en primer plano.
const configureForegroundPresentation = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

/**
 * HU-004: canal de alarma de Android. Usa el flujo de audio de ALARMA (que no
 * se silencia en modo vibración) y `bypassDnd` para "No molestar".
 */
const createAlarmChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    return;
  }
  await Notifications.setNotificationChannelAsync(ALARM_CHANNEL_ID, {
    name: 'Alarma de fin de fase',
    description: 'Avisa cuando termina una sesión de estudio o un descanso.',
    importance: Notifications.AndroidImportance.MAX,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: 'default',
    enableVibrate: true,
    vibrationPattern: VIBRATION_PATTERN,
    bypassDnd: true,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      flags: {
        enforceAudibility: true,
        requestHardwareAudioVideoSynchronization: false,
      },
    },
  });
};

const hasExactAlarmPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }
  try {
    const { granted } = await Notifications.getExactAlarmPermissionsAsync();
    return granted;
  } catch {
    return false;
  }
};

/** HU-004: solicita los permisos iniciales y prepara el canal de alarma. */
export const initializeNotifications =
  async (): Promise<NotificationPermissions> => {
    configureForegroundPresentation();
    // En Android 13+ el canal debe existir antes de pedir el permiso.
    await createAlarmChannel();

    const current = await Notifications.getPermissionsAsync();
    const permissions = current.granted
      ? current
      : await Notifications.requestPermissionsAsync();

    return {
      notificationsGranted: permissions.granted,
      exactAlarmsGranted: await hasExactAlarmPermission(),
    };
  };

export const openExactAlarmSettings = async (): Promise<void> => {
  await Notifications.requestExactAlarmPermissionsAsync();
};

export const cancelPhaseAlarms = async (): Promise<void> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(request => request.identifier.startsWith(NOTIFICATION_ID_PREFIX))
      .map(request =>
        Notifications.cancelScheduledNotificationAsync(request.identifier),
      ),
  );
};

/**
 * Reemplaza las alarmas programadas por las de los próximos fines de fase.
 * Se programan por adelantado para que suenen aunque la app esté cerrada.
 * `alarmClock` las entrega a la hora exacta si hay permiso de alarmas exactas;
 * si no, Android las entrega en modo `bestEffort`.
 */
export const schedulePhaseAlarms = async (
  phaseEnds: PhaseEnd[],
  settings: PomodoroSettings,
  now: number = Date.now(),
): Promise<void> => {
  await cancelPhaseAlarms();

  const futureEnds = phaseEnds.filter(phaseEnd => phaseEnd.endTime > now);
  await Promise.all(
    futureEnds.map((phaseEnd, index) => {
      const { title, body } = buildPhaseMessage(phaseEnd, settings);
      return Notifications.scheduleNotificationAsync({
        identifier: `${NOTIFICATION_ID_PREFIX}${index}`,
        content: {
          title,
          body,
          sound: 'default',
          vibrate: VIBRATION_PATTERN,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: phaseEnd.endTime,
          channelId: ALARM_CHANNEL_ID,
          delivery: 'alarmClock',
        },
      });
    }),
  );
};
