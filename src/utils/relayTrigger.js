// =============================================================
// 🚀 relayTrigger.js — Trigger Backend Deploy After Frontend Deploy
// =============================================================
export async function triggerBackendDeploy() {
  try {
    // Replace with your actual Render hook URL
    const RENDER_HOOK_URL = "https://api.render.com/deploy/srv-xxxxxx?key=YYYYYYYY";

    const res = await fetch(RENDER_HOOK_URL, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log("✅ Backend redeploy triggered successfully on Render.");
  } catch (err) {
    console.error("❌ Failed to trigger backend redeploy:", err);
  }
}
