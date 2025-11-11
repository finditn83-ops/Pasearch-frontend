// ===========================================
// 🤖 PASEARCH AI Assistant — Smart + Voice Enabled
// ===========================================
import React, { useEffect, useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { Send, Volume2 } from "lucide-react";

export default function PasearchAssistant() {
  const [messages, setMessages] = useState(() => {
    // 🧠 Load chat history from localStorage (if any)
    const saved = localStorage.getItem("pasearch_chat");
    return saved
      ? JSON.parse(saved)
      : [
          {
            sender: "ai",
            text: "👋 Hello! I’m PASEARCH AI — your cyber recovery assistant. You can ask me about lost devices, IMEI updates, or recovery advice.",
          },
        ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // 🧠 Save chat history on change
  useEffect(() => {
    localStorage.setItem("pasearch_chat", JSON.stringify(messages.slice(-10))); // keep last 10
  }, [messages]);

  // 🗣️ Speak using browser’s built-in SpeechSynthesis API
  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    window.speechSynthesis.speak(utter);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/ai/ask", { query: input });
      const reply =
        res.data?.answer ||
        "I couldn’t find updated data, but I’ll continue learning from global sources.";

      const aiMsg = { sender: "ai", text: reply };
      setMessages((prev) => [...prev, aiMsg]);
      speak(reply);
    } catch (err) {
      console.error(err);
      toast.error("AI Assistant failed to respond.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 Optional: clear chat
  const clearChat = () => {
    localStorage.removeItem("pasearch_chat");
    setMessages([
      {
        sender: "ai",
        text: "🧹 Chat cleared. How can I assist you now?",
      },
    ]);
  };

  return (
    <div className="mt-8 bg-white shadow-lg rounded-lg p-4 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-blue-700">
          🤖 PASEARCH AI Assistant
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            title="Toggle voice"
            className={`p-2 rounded ${
              ttsEnabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
            }`}
          >
            <Volume2 size={18} />
          </button>
          <button
            onClick={clearChat}
            className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded hover:bg-red-200"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto border rounded-lg p-3 bg-gray-50 mb-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 ${
              msg.sender === "ai" ? "text-left" : "text-right"
            }`}
          >
            <div
              className={`inline-block px-3 py-2 rounded-lg ${
                msg.sender === "ai"
                  ? "bg-blue-100 text-gray-900"
                  : "bg-green-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-gray-500 text-sm italic mt-2">
            PASEARCH AI is thinking...
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask about your device, IMEI, or cyber recovery..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg p-2 text-sm focus:ring focus:ring-blue-300"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Send size={16} />
          Send
        </button>
      </form>
    </div>
  );
}
