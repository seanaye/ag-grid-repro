// @ts-ignore: this is inject as a variable by v8 snapshot
snapshotResult.setGlobals(
  globalThis,
  { env: {} },
  window,
  document,
  console,
  undefined
);

import("./main")
