export type BootStage = 'cold' | 'diagnostics' | 'sync' | 'online';
export function bootSnapshot(elapsed: number, duration: number) {
  const progress = Math.min(1, Math.max(0, elapsed / Math.max(1, duration)));
  const stage: BootStage = progress < .18 ? 'cold' : progress < .53 ? 'diagnostics' : progress < .85 ? 'sync' : 'online';
  const sync = Math.min(1, Math.max(0, (progress - .53) / .32));
  // An unstable driver rolls synchronization back once before completing.
  const percent = Math.round(sync < .5 ? sync * 156 : sync < .65 ? 78 - (sync - .5) * 180 : 51 + (sync - .65) / .35 * 49);
  return { stage, progress, percent, diagnosticCount: Math.min(10, Math.max(0, Math.floor((progress - .18) / .035) + 1)), exiting: progress >= .965 };
}
