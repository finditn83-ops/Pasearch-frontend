// =============================================================
// 🚀 relayTrigger.js — Trigger Backend Deploy After Frontend Deploy
// =============================================================
export async function triggerBackendDeploy() {
  try {
    // ✅ Replace with your actual Render deploy hook URL from Render Settings
    const RENDER_HOOK_URL = "https://api.render.com/deploy/srv-d430eoripnbc73bb7hkg?key=TZFTh0Up_BI";

    const res = await fetch(RENDER_HOOK_URL, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log("✅ Backend redeploy triggered successfully on Render.");
  } catch (err) {
    console.error("❌ Failed to trigger backend redeploy:", err.message);
  }
}
