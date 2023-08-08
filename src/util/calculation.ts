export function isFlagSet(renderState: number, flag: number): boolean {
  return (renderState & flag) > 0;
}
