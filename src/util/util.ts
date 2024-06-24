export function waitForNextFrame() {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}
