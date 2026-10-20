import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { usePomodoroStore } from '../src/store/usePomodoroStore';

test('abre directamente en el temporizador sin pantalla de login (HU-006)', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  const texts = renderer?.root
    .findAllByType(Text)
    .map(node => node.props.children)
    .filter((child): child is string => typeof child === 'string');
  expect(texts).toContain('Estudio');
  expect(texts).toContain('Iniciar');

  await ReactTestRenderer.act(() => {
    renderer?.unmount();
  });
});

test('navega a Ajustes y el temporizador sigue en curso', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  const findByLabel = (label: string) =>
    renderer?.root
      .findAll(
        node =>
          typeof node.props.onPress === 'function' &&
          node.props.accessibilityLabel === label,
      )
      .at(0);

  await ReactTestRenderer.act(() => {
    usePomodoroStore.getState().startTimer();
  });
  await ReactTestRenderer.act(() => {
    findByLabel('Abrir ajustes')?.props.onPress();
  });

  expect(findByLabel('Aumentar Estudio')).toBeDefined();
  expect(usePomodoroStore.getState().isRunning).toBe(true);

  await ReactTestRenderer.act(() => {
    usePomodoroStore.getState().resetTimer();
    renderer?.unmount();
  });
});
