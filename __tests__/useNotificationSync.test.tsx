import React from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import ReactTestRenderer from 'react-test-renderer';
import { useNotificationSync } from '../src/hooks/useNotificationSync';
import { DEFAULT_SETTINGS } from '../src/store/timerLogic';
import { usePomodoroStore } from '../src/store/usePomodoroStore';

const mocked = jest.mocked(Notifications);

type ScheduledList = Awaited<
  ReturnType<typeof Notifications.getAllScheduledNotificationsAsync>
>;
type ExactAlarmResult = Awaited<
  ReturnType<typeof Notifications.getExactAlarmPermissionsAsync>
>;

const Harness = (): null => {
  useNotificationSync();
  return null;
};

let mounted: ReactTestRenderer.ReactTestRenderer | undefined;

const mountHarness = async (): Promise<void> => {
  await ReactTestRenderer.act(async () => {
    mounted = ReactTestRenderer.create(<Harness />);
  });
};

/** Deja que se resuelvan las promesas encadenadas del hook. */
const flush = async (): Promise<void> => {
  await ReactTestRenderer.act(async () => {
    await new Promise<void>(resolve => setImmediate(resolve));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mocked.getAllScheduledNotificationsAsync.mockResolvedValue([]);
  usePomodoroStore.setState({
    settings: DEFAULT_SETTINGS,
    mode: 'work',
    isRunning: false,
    isPaused: false,
    timeRemaining: 25 * 60,
    completedPomodoros: 0,
    targetEndTime: null,
  });
});

afterEach(async () => {
  await ReactTestRenderer.act(() => {
    mounted?.unmount();
  });
  mounted = undefined;
  jest.restoreAllMocks();
});

describe('useNotificationSync (HU-004)', () => {
  it('solicita permisos al iniciar', async () => {
    await mountHarness();
    await flush();
    expect(mocked.getPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('programa un ciclo completo de alarmas al iniciar el temporizador', async () => {
    await mountHarness();
    await flush();

    await ReactTestRenderer.act(() => {
      usePomodoroStore.getState().startTimer();
    });
    await flush();

    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(
      DEFAULT_SETTINGS.pomodorosPerCycle * 2,
    );
  });

  it('cancela las alarmas al pausar', async () => {
    await mountHarness();
    await flush();
    await ReactTestRenderer.act(() => {
      usePomodoroStore.getState().startTimer();
    });
    await flush();

    mocked.getAllScheduledNotificationsAsync.mockResolvedValue([
      { identifier: 'pomodoro-phase-0' },
    ] as ScheduledList);
    mocked.scheduleNotificationAsync.mockClear();
    await ReactTestRenderer.act(() => {
      usePomodoroStore.getState().pauseTimer();
    });
    await flush();

    expect(mocked.cancelScheduledNotificationAsync).toHaveBeenLastCalledWith(
      'pomodoro-phase-0',
    );
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('ofrece abrir los ajustes si faltan las alarmas exactas', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const alertSpy = jest.spyOn(Alert, 'alert');
    mocked.getExactAlarmPermissionsAsync.mockResolvedValueOnce({
      granted: false,
    } as ExactAlarmResult);

    await mountHarness();
    await flush();

    expect(alertSpy).toHaveBeenCalledWith(
      'Alarmas puntuales',
      expect.any(String),
      expect.any(Array),
    );
  });
});
