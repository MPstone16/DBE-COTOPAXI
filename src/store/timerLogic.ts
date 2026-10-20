import type { PomodoroSettings, TimerMode, TimerSnapshot } from './types';

export const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosPerCycle: 4,
};

export const SETTINGS_LIMITS: Record<
  keyof PomodoroSettings,
  { min: number; max: number }
> = {
  workDuration: { min: 1, max: 120 },
  shortBreakDuration: { min: 1, max: 60 },
  longBreakDuration: { min: 1, max: 90 },
  pomodorosPerCycle: { min: 1, max: 12 },
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, Math.round(value)));

export const sanitizeSettings = (
  current: PomodoroSettings,
  changes: Partial<PomodoroSettings>,
): PomodoroSettings => {
  const merged: PomodoroSettings = { ...current, ...changes };
  const keys = Object.keys(SETTINGS_LIMITS) as Array<keyof PomodoroSettings>;
  return keys.reduce<PomodoroSettings>(
    (result, key) => {
      const raw = merged[key];
      const { min, max } = SETTINGS_LIMITS[key];
      return {
        ...result,
        [key]: Number.isFinite(raw) ? clamp(raw, min, max) : current[key],
      };
    },
    { ...merged },
  );
};

export const getModeDurationSeconds = (
  mode: TimerMode,
  settings: PomodoroSettings,
): number => {
  switch (mode) {
    case 'work':
      return settings.workDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
  }
};

/**
 * Segundos restantes hasta `targetEndTime`. Se redondea hacia arriba para que
 * el contador muestre 25:00 justo al iniciar en lugar de saltar a 24:59.
 */
export const computeRemainingSeconds = (
  targetEndTime: number,
  now: number,
): number => Math.max(0, Math.ceil((targetEndTime - now) / 1000));

interface PhaseTransition {
  mode: TimerMode;
  completedPomodoros: number;
}

/** HU-002: Estudio -> Descanso Corto ... -> Descanso Largo tras N pomodoros. */
export const getNextPhase = (
  mode: TimerMode,
  completedPomodoros: number,
  settings: PomodoroSettings,
): PhaseTransition => {
  if (mode !== 'work') {
    return {
      mode: 'work',
      completedPomodoros: mode === 'longBreak' ? 0 : completedPomodoros,
    };
  }
  const completed = completedPomodoros + 1;
  return {
    mode: completed >= settings.pomodorosPerCycle ? 'longBreak' : 'shortBreak',
    completedPomodoros: completed,
  };
};

/**
 * HU-003: recalcula el estado a partir del timestamp persistido. Si una o
 * varias fases terminaron mientras la app estaba en segundo plano o cerrada,
 * avanza por cada una encadenando sus tiempos de fin.
 */
export const resolveTimer = (
  snapshot: TimerSnapshot,
  settings: PomodoroSettings,
  now: number,
): TimerSnapshot => {
  if (!snapshot.isRunning || snapshot.targetEndTime === null) {
    return snapshot;
  }

  let { mode, completedPomodoros, targetEndTime } = snapshot;
  while (targetEndTime <= now) {
    const next = getNextPhase(mode, completedPomodoros, settings);
    mode = next.mode;
    completedPomodoros = next.completedPomodoros;
    targetEndTime += getModeDurationSeconds(mode, settings) * 1000;
  }

  return {
    ...snapshot,
    mode,
    completedPomodoros,
    targetEndTime,
    timeRemaining: computeRemainingSeconds(targetEndTime, now),
  };
};

export interface PhaseEnd {
  endTime: number; // Timestamp en ms
  endedMode: TimerMode;
  nextMode: TimerMode;
}

/**
 * HU-004: calcula los próximos fines de fase a partir del timestamp actual para
 * programar las alarmas por adelantado (suenan aunque la app esté cerrada).
 */
export const getUpcomingPhaseEnds = (
  snapshot: TimerSnapshot,
  settings: PomodoroSettings,
  count: number,
): PhaseEnd[] => {
  if (!snapshot.isRunning || snapshot.targetEndTime === null) {
    return [];
  }

  const ends: PhaseEnd[] = [];
  let { mode, completedPomodoros, targetEndTime } = snapshot;
  for (let index = 0; index < count; index++) {
    const next = getNextPhase(mode, completedPomodoros, settings);
    ends.push({ endTime: targetEndTime, endedMode: mode, nextMode: next.mode });
    mode = next.mode;
    completedPomodoros = next.completedPomodoros;
    targetEndTime += getModeDurationSeconds(mode, settings) * 1000;
  }
  return ends;
};
