import React, { useState, useEffect } from "react";
import { askAI } from "../api";
import { getCurrentUser } from "../utils/auth";

export default function PasearchAssistant() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (u) setUser(u);
  }, []);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    const userMsg = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt("");

    try {
      const systemContext = `You are PasearchAI, an assistant inside the Pasearch platform. The current user is ${
        user?.username || "Guest"
      } and their role is ${user?.role || "unknown"}.
      Respond helpfully based on their role.
      - For reporters: guide them on how to report, track, and recover lost devices.
      - For police: help them verify IMEIs, cross-check tracking logs, or assist in investigations.
      - For admins: help them manage reports, oversee users, and monitor the system health.`;

      const reply = await askAI(`${systemContext}\n\nUser: ${prompt}`);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Sorry — I couldn’t reach the AI service right now. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
        >
          💬
        </button>
      )}

      {open && (
        <div className="w-80 h-96 bg-white shadow-2xl rounded-2xl border flex flex-col">
          <div className="flex justify-between items-center bg-blue-600 text-white p-3 rounded-t-2xl">
            <span className="font-semibold">Pasearch Assistant</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-gray-200"
            >
              ✖
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 && (
              <p className="text-gray-500 text-sm text-center mt-10">
                👋 Hello {user?.username || "there"} — how can I help you today?
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm ${
                  msg.role === "user"
                    ? "bg-blue-100 self-end ml-auto max-w-[80%]"
                    : "bg-gray-100 self-start mr-auto max-w-[80%]"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <p className="text-gray-400 text-sm italic">Thinking...</p>
            )}
          </div>

          <div className="border-t p-2 flex">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1 border rounded-l-lg p-2 text-sm focus:outline-none"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 text-white px-3 rounded-r-lg hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
