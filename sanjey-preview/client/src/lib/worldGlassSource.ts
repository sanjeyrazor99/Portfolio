/** Consume pixels synchronously after Earth renders; no preserveDrawingBuffer cost. */
type WorldFrame = (canvas: HTMLCanvasElement) => void;
const listeners = new Set<WorldFrame>();
const gradientListeners = new Set<WorldFrame>();
export function publishGradientFrame(canvas: HTMLCanvasElement) {
  gradientListeners.forEach(listener => listener(canvas));
}
export function subscribeGradientFrames(listener: WorldFrame) {
  gradientListeners.add(listener);
  return () => {
    gradientListeners.delete(listener);
  };
}
export function publishWorldFrame(canvas: HTMLCanvasElement) {
  listeners.forEach(listener => listener(canvas));
}
export function subscribeWorldFrames(listener: WorldFrame) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
