// =============================================================
// 🚀 vercel-postbuild.js — Run After Vercel Build (CommonJS version)
// =============================================================

import('node:fs/promises'); // just ensures Node treats file as module
import path from "path";
import { fileURLToPath } from "url";

// Convert import to dynamic import for ESM compatibility on Vercel
(async () => {
  try {
    const module = await import("./src/utils/relayTrigger.js");
    const { triggerBackendDeploy } = module;

    console.log("🚀 Vercel build completed — triggering Render backend...");
    await triggerBackendDeploy();
  } catch (err) {
    console.error("❌ Postbuild trigger failed:", err.message);
  }
})();
