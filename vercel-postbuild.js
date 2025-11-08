// =============================================================
// 🚀 vercel-postbuild.js — Run After Vercel Build
// Triggers backend redeploy automatically on Render
// =============================================================

import { triggerBackendDeploy } from "./src/utils/relayTrigger.js";

(async () => {
  console.log("🚀 Vercel build completed — triggering Render backend...");
  await triggerBackendDeploy();
})();
