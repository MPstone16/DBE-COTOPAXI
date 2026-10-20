import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const Typography = StyleSheet.create({
  timer: {
    fontSize: 64,
    fontWeight: '700',
    color: Colors.backgroundLight,
  },
  phaseTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.accentSecondary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.backgroundLight,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.backgroundLight,
  },
});
