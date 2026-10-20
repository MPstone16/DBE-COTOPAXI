import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  ALARM_CHANNEL_ID,
  buildPhaseMessage,
  cancelPhaseAlarms,
  initializeNotifications,
  schedulePhaseAlarms,
} from '../src/services/notifications';
import { DEFAULT_SETTINGS, type PhaseEnd } from '../src/store/timerLogic';

const mocked = jest.mocked(Notifications);
const NOW = 1_000_000;
const MIN = 60 * 1000;

const PHASE_ENDS: PhaseEnd[] = [
  { endTime: NOW + 25 * MIN, endedMode: 'work', nextMode: 'shortBreak' },
  { endTime: NOW + 30 * MIN, endedMode: 'shortBreak', nextMode: 'work' },
];

type PermissionResult = Awaited<
  ReturnType<typeof Notifications.getPermissionsAsync>
>;
type ExactAlarmResult = Awaited<
  ReturnType<typeof Notifications.getExactAlarmPermissionsAsync>
>;
type ScheduledList = Awaited<
  ReturnType<typeof Notifications.getAllScheduledNotificationsAsync>
>;

const permission = (granted: boolean): PermissionResult =>
  ({ granted } as PermissionResult);

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('buildPhaseMessage', () => {
  it('anuncia el descanso corto al terminar un pomodoro', () => {
    expect(buildPhaseMessage(PHASE_ENDS[0], DEFAULT_SETTINGS)).toEqual({
      title: '¡Pomodoro completado!',
      body: 'Tómate un descanso corto de 5 min.',
    });
  });

  it('anuncia el descanso largo al completar el ciclo', () => {
    expect(
      buildPhaseMessage(
        { endTime: 0, endedMode: 'work', nextMode: 'longBreak' },
        DEFAULT_SETTINGS,
      ).body,
    ).toBe('Te ganaste un descanso largo de 15 min.');
  });

  it('avisa la vuelta al estudio tras un descanso', () => {
    expect(buildPhaseMessage(PHASE_ENDS[1], DEFAULT_SETTINGS)).toEqual({
      title: 'Fin del descanso',
      body: 'Hora de volver a estudiar: 25 min.',
    });
  });
});

describe('initializeNotifications', () => {
  it('crea el canal de alarma en Android y no vuelve a pedir permisos concedidos', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const result = await initializeNotifications();

    expect(mocked.setNotificationHandler).toHaveBeenCalled();
    expect(mocked.setNotificationChannelAsync).toHaveBeenCalledWith(
      ALARM_CHANNEL_ID,
      expect.objectContaining({
        enableVibrate: true,
        bypassDnd: true,
        audioAttributes: expect.objectContaining({
          usage: Notifications.AndroidAudioUsage.ALARM,
        }),
      }),
    );
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(result).toEqual({
      notificationsGranted: true,
      exactAlarmsGranted: true,
    });
  });

  it('pide permisos si aún no están concedidos e informa los denegados', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    mocked.getPermissionsAsync.mockResolvedValueOnce(permission(false));
    mocked.requestPermissionsAsync.mockResolvedValueOnce(permission(false));
    mocked.getExactAlarmPermissionsAsync.mockResolvedValueOnce({
      granted: false,
    } as ExactAlarmResult);

    expect(await initializeNotifications()).toEqual({
      notificationsGranted: false,
      exactAlarmsGranted: false,
    });
    expect(mocked.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });
});

describe('schedulePhaseAlarms', () => {
  it('programa una alarma por cada fin de fase futuro', async () => {
    await schedulePhaseAlarms(PHASE_ENDS, DEFAULT_SETTINGS, NOW);
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(2);

    const [request] = mocked.scheduleNotificationAsync.mock.calls[0];
    expect(request.identifier).toBe('pomodoro-phase-0');
    expect(request.content.title).toBe('¡Pomodoro completado!');
    expect(request.trigger).toEqual({
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: NOW + 25 * MIN,
      channelId: ALARM_CHANNEL_ID,
      delivery: 'alarmClock',
    });
  });

  it('omite fines de fase que ya pasaron', async () => {
    await schedulePhaseAlarms(PHASE_ENDS, DEFAULT_SETTINGS, NOW + 26 * MIN);
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });
});

describe('cancelPhaseAlarms', () => {
  it('cancela solo las alarmas de la app', async () => {
    mocked.getAllScheduledNotificationsAsync.mockResolvedValueOnce([
      { identifier: 'pomodoro-phase-0' },
      { identifier: 'otra-notificacion' },
      { identifier: 'pomodoro-phase-1' },
    ] as ScheduledList);

    await cancelPhaseAlarms();

    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'pomodoro-phase-0',
    );
    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'pomodoro-phase-1',
    );
  });
});
