// =============================================================
// 🤖 PASEARCH AI Assistant — Smart, Voice + Speech Enabled
// =============================================================
import React, { useEffect, useState, useRef } from "react";
import API from "../api";
import { toast } from "react-toastify";
import { Send, Volume2, Mic, MicOff, Trash2 } from "lucide-react";

export default function PasearchAssistant() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("pasearch_chat");
    return saved
      ? JSON.parse(saved)
      : [
          {
            sender: "ai",
            text: "👋 Hello! I’m PASEARCH AI — your cybersecurity & device-recovery assistant. Ask me about stolen phone tracking, IMEI changes, or cyber laws.",
          },
        ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // 🧠 Save chat in browser
  useEffect(() => {
    localStorage.setItem("pasearch_chat", JSON.stringify(messages.slice(-10)));
  }, [messages]);

  // 🗣️ Speak replies
  const speak = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // 🎙️ Initialize Speech Recognition (browser)
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      toast.info("🎤 Recognized: " + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      toast.error("Microphone error: " + event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  // 🔘 Toggle mic
  const toggleListening = () => {
    if (!recognitionRef.current) return toast.error("Speech recognition unavailable.");
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
      toast.info("🎙️ Listening…");
    }
  };

  // 🚀 Send to backend
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/ai/ask", { question: input });
      const reply =
        res.data?.answer ||
        "I couldn’t find recent intel, but I’ll keep learning from cyber news feeds.";

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

  // 🧹 Clear chat
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
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
          🤖 PASEARCH AI Assistant
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            title="Toggle voice output"
            className={`p-2 rounded ${
              ttsEnabled
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            <Volume2 size={18} />
          </button>
          <button
            onClick={toggleListening}
            title="Voice input"
            className={`p-2 rounded ${
              listening ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={clearChat}
            title="Clear chat"
            className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Chat messages */}
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
          className="flex-1 border rounded-lg p-2 text-sm focus:ring focus:ring-blue-200"
        />
        <button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          <Send size={16} />
          Send
        </button>
      </form>
    </div>
  );
}
