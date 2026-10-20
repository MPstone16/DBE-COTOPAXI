import React from 'react';
import { Alert, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import TimerScreen from '../src/screens/TimerScreen';
import { DEFAULT_SETTINGS } from '../src/store/timerLogic';
import { usePomodoroStore } from '../src/store/usePomodoroStore';

const getTexts = (renderer: ReactTestRenderer.ReactTestRenderer): string[] =>
  renderer.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter((child): child is string => typeof child === 'string');

const pressButton = async (
  renderer: ReactTestRenderer.ReactTestRenderer,
  label: string,
): Promise<void> => {
  const button = renderer.root
    .findAll(node => typeof node.props.onPress === 'function')
    .find(node =>
      node.findAllByType(Text).some(text => text.props.children === label),
    );
  if (!button) {
    throw new Error(`Botón "${label}" no encontrado`);
  }
  await ReactTestRenderer.act(() => {
    button.props.onPress();
  });
};

let mounted: ReactTestRenderer.ReactTestRenderer | undefined;

beforeEach(() => {
  jest.useFakeTimers();
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
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const renderScreen = async (): Promise<ReactTestRenderer.ReactTestRenderer> => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<TimerScreen />);
  });
  if (!renderer) {
    throw new Error('No se pudo renderizar TimerScreen');
  }
  mounted = renderer;
  return renderer;
};

describe('TimerScreen', () => {
  it('muestra la fase de estudio y 25:00 al iniciar la app', async () => {
    const renderer = await renderScreen();
    const texts = getTexts(renderer);
    expect(texts).toContain('Estudio');
    expect(texts).toContain('25:00');
    expect(texts).toContain('Iniciar');
  });

  it('cambia a Pausar y luego a Continuar', async () => {
    const renderer = await renderScreen();
    await pressButton(renderer, 'Iniciar');
    expect(getTexts(renderer)).toContain('Pausar');
    await pressButton(renderer, 'Pausar');
    expect(getTexts(renderer)).toContain('Continuar');
  });

  it('pide confirmación antes de reiniciar', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const renderer = await renderScreen();
    await pressButton(renderer, 'Iniciar');
    await pressButton(renderer, 'Reiniciar');
    expect(alertSpy).toHaveBeenCalledWith(
      'Reiniciar temporizador',
      expect.any(String),
      expect.any(Array),
    );
    expect(usePomodoroStore.getState().isRunning).toBe(true);
  });
});
