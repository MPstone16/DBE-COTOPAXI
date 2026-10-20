import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Colors } from '../theme';

type TimerNavigation = NativeStackNavigationProp<RootStackParamList, 'Timer'>;

const HeaderSettingsButton = (): React.JSX.Element => {
  const navigation = useNavigation<TimerNavigation>();

  const handlePress = useCallback(() => {
    navigation.navigate('Settings');
  }, [navigation]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Abrir ajustes"
      hitSlop={12}
      onPress={handlePress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.text}>Ajustes</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.accentSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    color: Colors.accentSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HeaderSettingsButton;
