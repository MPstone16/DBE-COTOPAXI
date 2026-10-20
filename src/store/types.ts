export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  workDuration: number; // En minutos (Defecto: 25)
  shortBreakDuration: number; // En minutos (Defecto: 5)
  longBreakDuration: number; // En minutos (Defecto: 15)
  pomodorosPerCycle: number; // Defecto: 4
}

export interface TimerSnapshot {
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // En segundos
  completedPomodoros: number;
  targetEndTime: number | null; // Timestamp en ms (HU-003)
}

export interface PomodoroActions {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  resetSettingsToDefault: () => void;
  syncBackgroundTime: () => void;
}

export interface PomodoroState extends TimerSnapshot, PomodoroActions {
  settings: PomodoroSettings;
}
