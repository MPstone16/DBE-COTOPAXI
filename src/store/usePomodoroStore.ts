import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  DEFAULT_SETTINGS,
  computeRemainingSeconds,
  getModeDurationSeconds,
  resolveTimer,
  sanitizeSettings,
} from './timerLogic';
import type { PomodoroSettings, PomodoroState, TimerSnapshot } from './types';

type PersistedState = TimerSnapshot & { settings: PomodoroSettings };

const STORAGE_KEY = 'pomodoro-cotopaxi-state';

const createIdleTimer = (settings: PomodoroSettings): TimerSnapshot => ({
  mode: 'work',
  isRunning: false,
  isPaused: false,
  timeRemaining: getModeDurationSeconds('work', settings),
  completedPomodoros: 0,
  targetEndTime: null,
});

const pickSnapshot = (state: PomodoroState): TimerSnapshot => ({
  mode: state.mode,
  isRunning: state.isRunning,
  isPaused: state.isPaused,
  timeRemaining: state.timeRemaining,
  completedPomodoros: state.completedPomodoros,
  targetEndTime: state.targetEndTime,
});

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      ...createIdleTimer(DEFAULT_SETTINGS),

      startTimer: () => {
        const { isRunning, timeRemaining } = get();
        if (isRunning) {
          return;
        }
        set({
          isRunning: true,
          isPaused: false,
          targetEndTime: Date.now() + timeRemaining * 1000,
        });
      },

      pauseTimer: () => {
        const { isRunning, targetEndTime } = get();
        if (!isRunning || targetEndTime === null) {
          return;
        }
        set({
          isRunning: false,
          isPaused: true,
          timeRemaining: computeRemainingSeconds(targetEndTime, Date.now()),
          targetEndTime: null,
        });
      },

      resetTimer: () => {
        const { mode, settings } = get();
        set({
          isRunning: false,
          isPaused: false,
          targetEndTime: null,
          timeRemaining: getModeDurationSeconds(mode, settings),
        });
      },

      tick: () => {
        get().syncBackgroundTime();
      },

      syncBackgroundTime: () => {
        const state = get();
        const resolved = resolveTimer(
          pickSnapshot(state),
          state.settings,
          Date.now(),
        );
        if (
          resolved.timeRemaining !== state.timeRemaining ||
          resolved.mode !== state.mode ||
          resolved.targetEndTime !== state.targetEndTime
        ) {
          set(resolved);
        }
      },

      updateSettings: newSettings => {
        const state = get();
        const settings = sanitizeSettings(state.settings, newSettings);
        const isIdle = !state.isRunning && !state.isPaused;
        set({
          settings,
          ...(isIdle && {
            timeRemaining: getModeDurationSeconds(state.mode, settings),
          }),
        });
      },

      resetSettingsToDefault: () => {
        get().updateSettings(DEFAULT_SETTINGS);
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state): PersistedState => ({
        ...pickSnapshot(state),
        settings: state.settings,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<PersistedState> | undefined;
        if (!saved) {
          return current;
        }
        return {
          ...current,
          ...saved,
          settings: sanitizeSettings(DEFAULT_SETTINGS, saved.settings ?? {}),
        };
      },
      onRehydrateStorage: () => state => {
        state?.syncBackgroundTime();
      },
    },
  ),
);
