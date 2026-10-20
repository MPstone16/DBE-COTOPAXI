const pad = (value: number): string => value.toString().padStart(2, '0');

/** Convierte segundos a formato MM:SS (ej. 1500 -> "25:00"). */
export const formatTime = (totalSeconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
};
