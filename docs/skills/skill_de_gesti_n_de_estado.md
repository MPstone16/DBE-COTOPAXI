# State Skill - Reglas para la Gestión de Datos Globales y Persistencia

Esta guía define la arquitectura para la gestión de estado global y el manejo de persistencia offline en la aplicación.

---

## 1. Arquitectura del Estado

Se recomienda usar **Zustand** o **React Context + Reducer** estructurado con soporte de persistencia local mediante `AsyncStorage`.

### Estructura del Estado Global (`PomodoroState`)

```typescript
export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  workDuration: number;       // En minutos (Defecto: 25)
  shortBreakDuration: number;  // En minutos (Defecto: 5)
  longBreakDuration: number;   // En minutos (Defecto: 15)
  pomodorosPerCycle: number;   // Defecto: 4
}

export interface PomodoroState {
  // Configuración
  settings: PomodoroSettings;
  
  // Estado del Temporizador
  mode: TimerMode;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number;       // En segundos
  completedPomodoros: number;
  
  // Timestamps para Background (HU-003)
  targetEndTime: number | null; 

  // Acciones
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  resetSettingsToDefault: () => void;
  syncBackgroundTime: () => void;
}
```

---

## 2. Estrategia para Celular Bloqueado / App Cerrada (HU-003)

Para evitar que el temporizador se detenga al bloquear el celular o cerrar la app:
1. **Cálculo basado en Timestamps:** No depender únicamente de `setInterval`. Al iniciar un temporizador, se guarda un `targetEndTime = Date.now() + (timeRemaining * 1000)`.
2. **Re-sincronización al enfocar (AppState):** Cuando la aplicación regresa a primer plano (`AppState == 'active'`), la función `syncBackgroundTime()` recalcula el tiempo restante:
   $$\text{timeRemaining} = \left\lfloor \frac{\text{targetEndTime} - \text{Date.now()}}{1000} \right\rfloor$$
3. Si el resultado es $\le 0$, se procesa la transición de la fase actual y se dispara la notificación/alarma correspondientes (HU-004).

---

## 3. Reglas de Manejo del Estado

1. **Cero Procesamiento en Render:** Las operaciones complejas deben realizarse dentro de los *actions* del store.
2. **Persistencia Automática:** Toda la configuración (`settings`) debe guardarse automáticamente en `AsyncStorage` para sobrevivir al cierre de la aplicación.
3. **Mutación Inmutable:** Retornar siempre copias de estado inmutables.