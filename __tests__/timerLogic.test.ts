import {
  DEFAULT_SETTINGS,
  computeRemainingSeconds,
  getNextPhase,
  getUpcomingPhaseEnds,
  resolveTimer,
  sanitizeSettings,
} from '../src/store/timerLogic';
import type { TimerSnapshot } from '../src/store/types';

const MIN = 60 * 1000;

const runningWork = (targetEndTime: number): TimerSnapshot => ({
  mode: 'work',
  isRunning: true,
  isPaused: false,
  timeRemaining: 25 * 60,
  completedPomodoros: 0,
  targetEndTime,
});

describe('computeRemainingSeconds', () => {
  it('muestra la duración completa justo al iniciar', () => {
    expect(computeRemainingSeconds(1000 + 25 * MIN, 1000 + 5)).toBe(1500);
  });

  it('nunca devuelve valores negativos', () => {
    expect(computeRemainingSeconds(1000, 5000)).toBe(0);
  });
});

describe('getNextPhase (HU-002)', () => {
  it('pasa de estudio a descanso corto e incrementa el contador', () => {
    expect(getNextPhase('work', 0, DEFAULT_SETTINGS)).toEqual({
      mode: 'shortBreak',
      completedPomodoros: 1,
    });
  });

  it('pasa a descanso largo al completar el 4.º pomodoro', () => {
    expect(getNextPhase('work', 3, DEFAULT_SETTINGS)).toEqual({
      mode: 'longBreak',
      completedPomodoros: 4,
    });
  });

  it('reinicia el ciclo tras el descanso largo', () => {
    expect(getNextPhase('longBreak', 4, DEFAULT_SETTINGS)).toEqual({
      mode: 'work',
      completedPomodoros: 0,
    });
  });

  it('mantiene el contador tras un descanso corto', () => {
    expect(getNextPhase('shortBreak', 2, DEFAULT_SETTINGS)).toEqual({
      mode: 'work',
      completedPomodoros: 2,
    });
  });
});

describe('resolveTimer (HU-003)', () => {
  it('recalcula el tiempo restante tras bloquear el celular', () => {
    const start = 1_000_000;
    const result = resolveTimer(
      runningWork(start + 25 * MIN),
      DEFAULT_SETTINGS,
      start + 10 * MIN,
    );
    expect(result.mode).toBe('work');
    expect(result.timeRemaining).toBe(15 * 60);
  });

  it('transiciona de fase si terminó con la app cerrada', () => {
    const start = 1_000_000;
    const result = resolveTimer(
      runningWork(start + 25 * MIN),
      DEFAULT_SETTINGS,
      start + 27 * MIN,
    );
    expect(result.mode).toBe('shortBreak');
    expect(result.completedPomodoros).toBe(1);
    expect(result.timeRemaining).toBe(3 * 60);
    expect(result.targetEndTime).toBe(start + 30 * MIN);
  });

  it('encadena varias fases transcurridas en segundo plano', () => {
    const start = 1_000_000;
    // 25 estudio + 5 descanso + 25 estudio = 55 min; a los 57 min quedan 3 del 2.º descanso.
    const result = resolveTimer(
      runningWork(start + 25 * MIN),
      DEFAULT_SETTINGS,
      start + 57 * MIN,
    );
    expect(result.mode).toBe('shortBreak');
    expect(result.completedPomodoros).toBe(2);
    expect(result.timeRemaining).toBe(3 * 60);
  });

  it('no modifica un temporizador pausado', () => {
    const paused: TimerSnapshot = {
      ...runningWork(0),
      isRunning: false,
      isPaused: true,
      targetEndTime: null,
      timeRemaining: 600,
    };
    expect(resolveTimer(paused, DEFAULT_SETTINGS, 99 * MIN)).toBe(paused);
  });
});

describe('sanitizeSettings (HU-005)', () => {
  it('limita valores fuera de rango y redondea', () => {
    expect(
      sanitizeSettings(DEFAULT_SETTINGS, {
        workDuration: 0,
        shortBreakDuration: 7.6,
        pomodorosPerCycle: 99,
      }),
    ).toEqual({
      workDuration: 1,
      shortBreakDuration: 8,
      longBreakDuration: 15,
      pomodorosPerCycle: 12,
    });
  });

  it('ignora valores no numéricos', () => {
    expect(
      sanitizeSettings(DEFAULT_SETTINGS, { workDuration: Number.NaN }),
    ).toEqual(DEFAULT_SETTINGS);
  });
});

describe('getUpcomingPhaseEnds (HU-004)', () => {
  it('encadena los fines de fase de un ciclo completo', () => {
    const start = 1_000_000;
    const ends = getUpcomingPhaseEnds(
      runningWork(start + 25 * MIN),
      DEFAULT_SETTINGS,
      8,
    );
    expect(ends.map(end => end.nextMode)).toEqual([
      'shortBreak',
      'work',
      'shortBreak',
      'work',
      'shortBreak',
      'work',
      'longBreak',
      'work',
    ]);
    expect(ends[0].endTime).toBe(start + 25 * MIN);
    expect(ends[1].endTime).toBe(start + 30 * MIN);
    // 4×25 estudio + 3×5 descanso corto + 15 descanso largo = 130 min
    expect(ends[7].endTime).toBe(start + 130 * MIN);
  });

  it('no programa nada si el temporizador no está en curso', () => {
    const paused: TimerSnapshot = {
      ...runningWork(0),
      isRunning: false,
      isPaused: true,
      targetEndTime: null,
    };
    expect(getUpcomingPhaseEnds(paused, DEFAULT_SETTINGS, 8)).toEqual([]);
  });
});
