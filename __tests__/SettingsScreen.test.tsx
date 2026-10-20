import React from 'react';
import { Alert, type AlertButton } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import SettingsScreen from '../src/screens/SettingsScreen';
import { DEFAULT_SETTINGS } from '../src/store/timerLogic';
import { usePomodoroStore } from '../src/store/usePomodoroStore';

let mounted: ReactTestRenderer.ReactTestRenderer | undefined;

const renderScreen = async (): Promise<ReactTestRenderer.ReactTestRenderer> => {
  await ReactTestRenderer.act(() => {
    mounted = ReactTestRenderer.create(<SettingsScreen />);
  });
  if (!mounted) {
    throw new Error('No se pudo renderizar SettingsScreen');
  }
  return mounted;
};

const press = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  accessibilityLabel: string,
): Promise<void> => {
  const button = renderer.root
    .findAll(
      node =>
        typeof node.props.onPress === 'function' &&
        node.props.accessibilityLabel === accessibilityLabel,
    )
    .at(0);
  if (!button) {
    throw new Error(`Botón "${accessibilityLabel}" no encontrado`);
  }
  await ReactTestRenderer.act(() => {
    button.props.onPress();
  });
};

beforeEach(() => {
  usePomodoroStore.setState({
    settings: DEFAULT_SETTINGS,
    mode: 'work',
    isRunning: false,
    isPaused: false,
    timeRemaining: 25 * 60,
    completedPomodoros: 0,
    targetEndTime: null,
  });
});

afterEach(async () => {
  await ReactTestRenderer.act(() => {
    mounted?.unmount();
  });
  mounted = undefined;
  jest.restoreAllMocks();
});

describe('SettingsScreen (HU-005)', () => {
  it('modifica la duración de estudio desde el stepper', async () => {
    const renderer = await renderScreen();
    await press(renderer, 'Aumentar Estudio');
    expect(usePomodoroStore.getState().settings.workDuration).toBe(26);
    expect(usePomodoroStore.getState().timeRemaining).toBe(26 * 60);
  });

  it('modifica los pomodoros por ciclo', async () => {
    const renderer = await renderScreen();
    await press(renderer, 'Disminuir Pomodoros antes del descanso largo');
    expect(usePomodoroStore.getState().settings.pomodorosPerCycle).toBe(3);
  });

  it('restablece los valores por defecto tras confirmar', async () => {
    usePomodoroStore.getState().updateSettings({ workDuration: 40 });
    let buttons: AlertButton[] = [];
    jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, btns) => {
      buttons = btns ?? [];
    });

    const renderer = await renderScreen();
    await press(renderer, 'Restablecer valores por defecto');
    expect(usePomodoroStore.getState().settings.workDuration).toBe(40);

    await ReactTestRenderer.act(() => {
      buttons.find(button => button.text === 'Restablecer')?.onPress?.();
    });
    expect(usePomodoroStore.getState().settings).toEqual(DEFAULT_SETTINGS);
  });
});
