// Shared headless-Chromium helpers: reuses the QA harness's launcher and object selection
// (docs/creator-sidebar/qa/lib/live.mjs) so the signed-out fake-camera flow is identical.
const QA = "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/docs/creator-sidebar/qa";
const live = await import(QA + "/lib/live.mjs");
export const { openLive, select } = live;
export async function open(theme = "light", kind = "none") {
  const s = await openLive({ theme });
  if (kind !== "none") { await select(s.page, kind); await s.page.waitForTimeout(900); }
  else { await s.page.waitForTimeout(600); }
  return s;
}
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
