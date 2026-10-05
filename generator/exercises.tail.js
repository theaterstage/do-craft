// ---- stage unlocking: stage k opens when >=70% (rounded up) of stage k-1 exercises were passed at least once ----
export const UNLOCK_RATIO = 0.7;
export function stageProgress(items, attempts, stageId) {
  const ids = new Set(items.filter((i) => i.stageId === stageId).map((i) => i.id));
  const passed = new Set(attempts.filter((a) => a.passed && ids.has(a.trainingId)).map((a) => a.trainingId));
  return { passed: passed.size, total: ids.size, need: Math.ceil(ids.size * UNLOCK_RATIO) };
}
export function isStageUnlocked(track, attempts, overrides, stageId) {
  const idx = track.stages.findIndex((s) => s.id === stageId);
  if (idx <= 0) return idx === 0;
  if ((overrides || []).includes(stageId)) return true;
  const p = stageProgress(track.items, attempts, track.stages[idx - 1].id);
  return p.passed >= p.need;
}
const restore = buildRestore();
const iq = buildIq();
export { restore, iq, brain, proc, dragon };
