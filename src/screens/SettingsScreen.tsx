import React, { useCallback } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import SettingStepper from '../components/SettingStepper';
import { SETTINGS_LIMITS } from '../store/timerLogic';
import type { PomodoroSettings } from '../store/types';
import { usePomodoroStore } from '../store/usePomodoroStore';
import { Colors, Typography } from '../theme';

interface SettingField {
  key: keyof PomodoroSettings;
  label: string;
  unit: string;
}

const DURATION_FIELDS: SettingField[] = [
  { key: 'workDuration', label: 'Estudio', unit: 'min' },
  { key: 'shortBreakDuration', label: 'Descanso corto', unit: 'min' },
  { key: 'longBreakDuration', label: 'Descanso largo', unit: 'min' },
];

const CYCLE_FIELD: SettingField = {
  key: 'pomodorosPerCycle',
  label: 'Pomodoros antes del descanso largo',
  unit: 'ciclos',
};

const SettingsScreen = (): React.JSX.Element => {
  const settings = usePomodoroStore(state => state.settings);
  const hasActiveSession = usePomodoroStore(
    state => state.isRunning || state.isPaused,
  );
  const updateSettings = usePomodoroStore(state => state.updateSettings);
  const resetSettingsToDefault = usePomodoroStore(
    state => state.resetSettingsToDefault,
  );

  const handleResetPress = useCallback(() => {
    Alert.alert(
      'Restablecer valores',
      'Se volverá a 25 min de estudio, 5 min de descanso corto, 15 min de descanso largo y 4 pomodoros por ciclo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Restablecer', onPress: resetSettingsToDefault },
      ],
    );
  }, [resetSettingsToDefault]);

  const renderStepper = (field: SettingField): React.JSX.Element => (
    <SettingStepper
      key={field.key}
      label={field.label}
      unit={field.unit}
      value={settings[field.key]}
      min={SETTINGS_LIMITS[field.key].min}
      max={SETTINGS_LIMITS[field.key].max}
      onChange={value => updateSettings({ [field.key]: value })}
    />
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.section}>
        <Text style={Typography.phaseTitle} accessibilityRole="header">
          Duración de las fases
        </Text>
        {DURATION_FIELDS.map(renderStepper)}
      </View>

      <View style={styles.section}>
        <Text style={Typography.phaseTitle} accessibilityRole="header">
          Ciclo
        </Text>
        {renderStepper(CYCLE_FIELD)}
      </View>

      {hasActiveSession && (
        <Text style={[Typography.label, styles.notice]}>
          Los cambios de duración se aplicarán a partir de la siguiente fase o
          al reiniciar el temporizador.
        </Text>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Restablecer valores por defecto"
        onPress={handleResetPress}
        style={({ pressed }) => [
          styles.resetButton,
          pressed && styles.resetButtonPressed,
        ]}
      >
        <Text style={styles.resetButtonText}>
          Restablecer valores por defecto
        </Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    padding: 24,
    gap: 28,
  },
  section: {
    gap: 12,
  },
  notice: {
    color: Colors.accentSecondary,
    textAlign: 'center',
  },
  resetButton: {
    borderWidth: 1,
    borderColor: Colors.accentSecondary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetButtonPressed: {
    opacity: 0.8,
  },
  resetButtonText: {
    color: Colors.accentSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
