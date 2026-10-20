import React, { useCallback } from 'react';
import {
  type AccessibilityActionEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, Typography } from '../theme';

export interface SettingStepperProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

const ACCESSIBILITY_ACTIONS = [
  { name: 'increment' as const },
  { name: 'decrement' as const },
];

const SettingStepper = ({
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
}: SettingStepperProps): React.JSX.Element => {
  const canDecrement = value > min;
  const canIncrement = value < max;

  const decrement = useCallback(() => {
    onChange(Math.max(min, value - step));
  }, [min, onChange, step, value]);

  const increment = useCallback(() => {
    onChange(Math.min(max, value + step));
  }, [max, onChange, step, value]);

  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'increment') {
        increment();
      } else if (event.nativeEvent.actionName === 'decrement') {
        decrement();
      }
    },
    [decrement, increment],
  );

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value, text: `${value} ${unit}` }}
      accessibilityActions={ACCESSIBILITY_ACTIONS}
      onAccessibilityAction={handleAccessibilityAction}
    >
      <Text style={[Typography.label, styles.label]}>{label}</Text>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Disminuir ${label}`}
          disabled={!canDecrement}
          onPress={decrement}
          hitSlop={8}
          style={({ pressed }) => [
            styles.stepButton,
            !canDecrement && styles.stepButtonDisabled,
            pressed && styles.stepButtonPressed,
          ]}
        >
          <Text style={styles.stepButtonText}>−</Text>
        </Pressable>

        <View style={styles.valueBox}>
          <Text style={styles.valueText}>{value}</Text>
          <Text style={[Typography.label, styles.unitText]}>{unit}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Aumentar ${label}`}
          disabled={!canIncrement}
          onPress={increment}
          hitSlop={8}
          style={({ pressed }) => [
            styles.stepButton,
            !canIncrement && styles.stepButtonDisabled,
            pressed && styles.stepButtonPressed,
          ]}
        >
          <Text style={styles.stepButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonDisabled: {
    opacity: 0.35,
  },
  stepButtonPressed: {
    opacity: 0.75,
  },
  stepButtonText: {
    color: Colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  valueBox: {
    minWidth: 56,
    alignItems: 'center',
  },
  valueText: {
    color: Colors.backgroundLight,
    fontSize: 22,
    fontWeight: '700',
  },
  unitText: {
    color: Colors.accentSecondary,
  },
});

export default SettingStepper;
