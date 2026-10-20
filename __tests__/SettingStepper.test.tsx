import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import SettingStepper from '../src/components/SettingStepper';

const renderStepper = async (
  value: number,
  onChange: (value: number) => void,
): Promise<ReactTestRenderer.ReactTestRenderer> => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SettingStepper
        label="Estudio"
        value={value}
        unit="min"
        min={1}
        max={60}
        onChange={onChange}
      />,
    );
  });
  if (!renderer) {
    throw new Error('No se pudo renderizar SettingStepper');
  }
  return renderer;
};

const getButton = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  accessibilityLabel: string,
): ReactTestRenderer.ReactTestInstance =>
  renderer.root
    .findAll(
      node =>
        typeof node.props.onPress === 'function' &&
        node.props.accessibilityLabel === accessibilityLabel,
    )
    .at(0) ??
  (() => {
    throw new Error(`Botón "${accessibilityLabel}" no encontrado`);
  })();

describe('SettingStepper', () => {
  it('aumenta y disminuye el valor en un paso', async () => {
    const onChange = jest.fn();
    const renderer = await renderStepper(25, onChange);

    await ReactTestRenderer.act(() => {
      getButton(renderer, 'Aumentar Estudio').props.onPress();
    });
    expect(onChange).toHaveBeenLastCalledWith(26);

    await ReactTestRenderer.act(() => {
      getButton(renderer, 'Disminuir Estudio').props.onPress();
    });
    expect(onChange).toHaveBeenLastCalledWith(24);

    await ReactTestRenderer.act(() => renderer.unmount());
  });

  it('deshabilita los botones en los límites', async () => {
    const renderer = await renderStepper(1, jest.fn());
    expect(getButton(renderer, 'Disminuir Estudio').props.disabled).toBe(true);
    expect(getButton(renderer, 'Aumentar Estudio').props.disabled).toBe(false);
    await ReactTestRenderer.act(() => renderer.unmount());
  });
});
