import { formatTime } from '../src/utils/formatTime';

describe('formatTime', () => {
  it.each([
    [1500, '25:00'],
    [299, '04:59'],
    [5, '00:05'],
    [0, '00:00'],
    [-10, '00:00'],
  ])('formatea %i segundos como %s', (seconds, expected) => {
    expect(formatTime(seconds)).toBe(expected);
  });
});
