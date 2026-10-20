import { usePomodoroStore } from '../src/store/usePomodoroStore';
import { DEFAULT_SETTINGS } from '../src/store/timerLogic';

const MIN = 60 * 1000;
let now = 1_000_000;

beforeEach(() => {
  now = 1_000_000;
  jest.spyOn(Date, 'now').mockImplementation(() => now);
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

afterEach(() => {
  jest.restoreAllMocks();
});

const store = () => usePomodoroStore.getState();

describe('usePomodoroStore (HU-001)', () => {
  it('inicia guardando el timestamp de fin', () => {
    store().startTimer();
    expect(store().isRunning).toBe(true);
    expect(store().targetEndTime).toBe(now + 25 * MIN);
  });

  it('pausa y reanuda sin perder tiempo', () => {
    store().startTimer();
    now += 5 * MIN;
    store().pauseTimer();
    expect(store().isPaused).toBe(true);
    expect(store().timeRemaining).toBe(20 * 60);

    now += 60 * MIN; // el tiempo en pausa no cuenta
    store().startTimer();
    expect(store().targetEndTime).toBe(now + 20 * MIN);
  });

  it('reinicia la fase actual', () => {
    store().startTimer();
    now += 3 * MIN;
    store().resetTimer();
    expect(store().isRunning).toBe(false);
    expect(store().timeRemaining).toBe(25 * 60);
    expect(store().targetEndTime).toBeNull();
  });
});

describe('usePomodoroStore (HU-003)', () => {
  it('sincroniza el tiempo al volver de segundo plano', () => {
    store().startTimer();
    now += 26 * MIN;
    store().syncBackgroundTime();
    expect(store().mode).toBe('shortBreak');
    expect(store().timeRemaining).toBe(4 * 60);
  });
});

describe('usePomodoroStore (HU-005)', () => {
  it('actualiza la duración visible si el temporizador está inactivo', () => {
    store().updateSettings({ workDuration: 50 });
    expect(store().timeRemaining).toBe(50 * 60);
  });

  it('no altera una sesión en curso al cambiar ajustes', () => {
    store().startTimer();
    store().updateSettings({ workDuration: 50 });
    expect(store().timeRemaining).toBe(25 * 60);
  });

  it('restablece los valores por defecto', () => {
    store().updateSettings({ workDuration: 40, pomodorosPerCycle: 6 });
    store().resetSettingsToDefault();
    expect(store().settings).toEqual(DEFAULT_SETTINGS);
    expect(store().timeRemaining).toBe(25 * 60);
  });
});
