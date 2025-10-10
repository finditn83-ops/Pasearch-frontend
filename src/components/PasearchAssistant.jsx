// src/components/PasearchAssistant.jsx
import { useState } from "react";

// Optional: import OpenAI only when API key is set
let OpenAIClient = null;
if (import.meta.env.VITE_OPENAI_API_KEY) {
  import("openai").then((mod) => {
    OpenAIClient = new mod.default({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // ⚠️ required for browser use
    });
  });
}

export default function PasearchAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧠 Pasearch mission text (offline fallback)
  const missionText = `
Pasearch is an intelligent, community-driven platform designed to help individuals and authorities
track, locate, and recover lost or stolen devices — including phones, laptops, and smart TVs.

Our mission is to reduce theft by connecting users, police, and telecom partners while respecting
user privacy and complying with cybersecurity laws.

We never sell or misuse user data. All collected information (IMEI, device details, or location)
is encrypted and used solely for lawful recovery purposes in line with cyber protection regulations.
`;

  // 🚀 Handle message sending
  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    const lower = trimmed.toLowerCase();
    const keywords = ["about", "aim", "mission", "goal", "purpose", "what is pasearch", "who are you"];

    // Offline logic first
    if (keywords.some((kw) => lower.includes(kw))) {
      const botReply = { from: "bot", text: missionText };
      setMessages((prev) => [...prev, botReply]);
      return;
    }

    // Try real AI response if API key exists
    if (OpenAIClient) {
      setLoading(true);
      try {
        const completion = await OpenAIClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are Pasearch Assistant, a helpful AI that answers questions about device recovery, security, and data privacy." },
            { role: "user", content: trimmed },
          ],
        });

        const reply = completion.choices[0].message.content;
        setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      } catch (error) {
        console.error("AI error:", error);
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "⚠️ I'm having trouble connecting to AI services right now. Try again later." },
        ]);
      } finally {
        setLoading(false);
      }
    } else {
      // Offline fallback
      const botReply = {
        from: "bot",
        text: "I'm Pasearch Assistant. I can help you with device tracking, lost reports, or privacy questions. Type 'mission' or 'about' to learn more about our purpose.",
      };
      setMessages((prev) => [...prev, botReply]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
      <div className="p-3 bg-blue-600 text-white text-center font-semibold rounded-t-xl">
        Pasearch Assistant 🤖
      </div>

      <div className="h-64 overflow-y-auto p-3 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg text-sm ${
              msg.from === "user"
                ? "bg-blue-100 text-gray-800 text-right"
                : "bg-gray-100 text-gray-800 text-left"
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="p-2 text-gray-500 text-sm italic text-center">
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 px-2 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 text-sm rounded-r-lg hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
}
