import React, { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTimerTicker } from '../hooks/useTimerTicker';
import { usePomodoroStore } from '../store/usePomodoroStore';
import type { TimerMode } from '../store/types';
import { Colors, Typography } from '../theme';
import { formatTime } from '../utils/formatTime';

const PHASE_LABELS: Record<TimerMode, string> = {
  work: 'Estudio',
  shortBreak: 'Descanso Corto',
  longBreak: 'Descanso Largo',
};

const TimerScreen = (): React.JSX.Element => {
  useTimerTicker();

  const mode = usePomodoroStore(state => state.mode);
  const isRunning = usePomodoroStore(state => state.isRunning);
  const isPaused = usePomodoroStore(state => state.isPaused);
  const timeRemaining = usePomodoroStore(state => state.timeRemaining);
  const completedPomodoros = usePomodoroStore(
    state => state.completedPomodoros,
  );
  const pomodorosPerCycle = usePomodoroStore(
    state => state.settings.pomodorosPerCycle,
  );
  const startTimer = usePomodoroStore(state => state.startTimer);
  const pauseTimer = usePomodoroStore(state => state.pauseTimer);
  const resetTimer = usePomodoroStore(state => state.resetTimer);

  const primaryLabel = isRunning
    ? 'Pausar'
    : isPaused
    ? 'Continuar'
    : 'Iniciar';
  const handlePrimaryPress = isRunning ? pauseTimer : startTimer;
  const canReset = isRunning || isPaused;

  // HU-001: el reinicio requiere confirmación.
  const handleResetPress = useCallback(() => {
    Alert.alert(
      'Reiniciar temporizador',
      '¿Seguro que deseas reiniciar la sesión actual? Se perderá el progreso de esta fase.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Reiniciar', style: 'destructive', onPress: resetTimer },
      ],
    );
  }, [resetTimer]);

  const cycleDots = Array.from({ length: pomodorosPerCycle }, (_, index) => (
    <View
      key={index}
      style={[styles.dot, index < completedPomodoros && styles.dotFilled]}
    />
  ));

  return (
    <View style={styles.container}>
      <View style={styles.phaseBadge}>
        <Text style={Typography.phaseTitle} accessibilityRole="header">
          {PHASE_LABELS[mode]}
        </Text>
      </View>

      <View style={styles.timerCard}>
        <Text
          style={[Typography.timer, isRunning && styles.timerActive]}
          accessibilityLabel={`Tiempo restante ${formatTime(timeRemaining)}`}
        >
          {formatTime(timeRemaining)}
        </Text>
        <Text style={[Typography.body, styles.statusText]}>
          {isRunning
            ? 'En curso'
            : isPaused
            ? 'En pausa'
            : 'Listo para comenzar'}
        </Text>
      </View>

      <View style={styles.cycleSection}>
        <View style={styles.dotsRow}>{cycleDots}</View>
        <Text style={Typography.label}>
          {`Pomodoros completados: ${completedPomodoros} de ${pomodorosPerCycle}`}
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          onPress={handlePrimaryPress}
          style={({ pressed }) => [
            styles.button,
            isRunning ? styles.pauseButton : styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canReset }}
          disabled={!canReset}
          onPress={handleResetPress}
          style={({ pressed }) => [
            styles.button,
            styles.resetButton,
            !canReset && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.resetButtonText}>Reiniciar</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  phaseBadge: {
    borderWidth: 1,
    borderColor: Colors.accentSecondary,
    borderRadius: 24,
    paddingVertical: 6,
    paddingHorizontal: 20,
  },
  timerCard: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingVertical: 32,
    gap: 8,
  },
  timerActive: {
    color: Colors.accentPrimary,
  },
  statusText: {
    opacity: 0.85,
  },
  cycleSection: {
    alignItems: 'center',
    gap: 12,
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.accentSecondary,
  },
  dotFilled: {
    backgroundColor: Colors.accentPrimary,
    borderColor: Colors.accentPrimary,
  },
  controls: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.accentPrimary,
  },
  pauseButton: {
    backgroundColor: Colors.accentSecondary,
  },
  resetButton: {
    borderWidth: 1,
    borderColor: Colors.accentSecondary,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  resetButtonText: {
    color: Colors.accentSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimerScreen;
