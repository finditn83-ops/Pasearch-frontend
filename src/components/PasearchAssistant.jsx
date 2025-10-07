// src/components/PasearchAssistant.jsx
import { useState, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Volume2,
  VolumeX,
  Home,
  Mic,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PasearchAssistant() {
  const [open, setOpen] = useState(false);
  const [voiceOn, setVoiceOn] = useState(
    () => JSON.parse(localStorage.getItem("pasearch_voice")) ?? true
  );
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I’m Pasearch — your virtual assistant. You can ask me questions or search by voice or text.",
    },
  ]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  // === ABOUT text (mission) ===
  const aboutText = `🌍 PASEARCH Device Tracker is a community-driven security platform that helps individuals recover lost or stolen devices — such as phones, laptops, and smart TVs — using IMEI tracking, location monitoring, and verified police collaboration.`;

  // === VOICE SPEECH ===
  const speak = (text) => {
    if (!voiceOn || !window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const female = voices.find((v) => v.name.toLowerCase().includes("female"));
    if (female) utter.voice = female;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {};
  }, []);

  useEffect(() => {
    localStorage.setItem("pasearch_voice", JSON.stringify(voiceOn));
  }, [voiceOn]);

  // === SIMPLE INTELLIGENCE ===
  const getAIResponse = (inputText) => {
    const lower = inputText.toLowerCase();

    if (lower.includes("mission") || lower.includes("about") || lower.includes("goal"))
      return aboutText;

    if (lower.includes("lost") || lower.includes("stolen"))
      return "🔎 You can report your lost or stolen device using the 'Report' page. Include IMEI, color, and last known location.";

    if (lower.includes("create account") || lower.includes("register"))
      return "🧾 To create an account, click 'Create Account' on the home page and choose your role.";

    if (lower.includes("login"))
      return "🔐 To log in, enter your username and password on the home page.";

    if (lower.includes("forgot"))
      return "📩 Click 'Forgot Password?' on the home page to reset your password securely.";

    if (lower.includes("contact") || lower.includes("help"))
      return "🤝 You can reach our team through the in-app support form or chat with me here for assistance.";

    if (lower.includes("dashboard"))
      return "📊 Each role has its own dashboard — Reporter tracks devices, Police verifies reports, and Admin manages everything.";

    if (lower.includes("home")) {
      navigate("/");
      return "🏠 Taking you back to the home page.";
    }

    return "💡 I'm Pasearch — your AI assistant for the Device Tracker. Ask me anything about securing or recovering your devices.";
  };

  // === TEXT SEND (with typing dots) ===
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", text: "typing..." }]);

    const aiText = await new Promise((resolve) =>
      setTimeout(() => resolve(getAIResponse(input)), 800)
    );

    setMessages((prev) => {
      const newMsgs = [...prev];
      newMsgs[newMsgs.length - 1] = { role: "assistant", text: aiText };
      return newMsgs;
    });

    speak(aiText);
    setInput("");
  };

  // === VOICE INPUT ===
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const aiText = getAIResponse(transcript);
      setMessages((prev) => [
        ...prev,
        { role: "user", text: transcript },
        { role: "assistant", text: aiText },
      ]);
      speak(aiText);
    };

    recognition.start();
  };

  // === AUTO GREETING ===
  useEffect(() => {
    if (open) {
      const greeting = "Hello! I’m Pasearch, your virtual assistant. How can I help you today?";
      speak(greeting);
    }
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`text-white p-3 rounded-full shadow-lg transition ${
            speaking ? "animate-pulse-glow" : "bg-blue-600 hover:bg-blue-700 animate-bounce-slow"
          }`}
          title="Ask Pasearch Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="bg-white w-80 md:w-96 h-[460px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-fade-in">
          <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-2">
            <h2 className="font-semibold text-lg">Pasearch Assistant</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setVoiceOn(!voiceOn)}
                title={voiceOn ? "Mute Voice" : "Enable Voice"}
                className="hover:text-gray-200"
              >
                {voiceOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <button onClick={() => navigate("/")} title="Back to Home" className="hover:text-gray-200">
                <Home size={20} />
              </button>
              <button onClick={() => setOpen(false)} className="hover:text-gray-200">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`my-2 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text === "typing..." ? (
                    <div className="flex gap-1 items-center">
                      <span className="dot bg-gray-500"></span>
                      <span className="dot bg-gray-500"></span>
                      <span className="dot bg-gray-500"></span>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 flex items-center px-3 py-2 bg-white">
            <button
              onClick={handleVoiceInput}
              className={`relative p-2 rounded-full transition-all duration-300 ${
                listening
                  ? "bg-green-500 text-white shadow-glow-mic"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              title="Voice Search"
            >
              {listening && (
                <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-glow-ring"></span>
              )}
              <Mic size={18} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask or search..."
              className="flex-1 mx-2 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
              title="Send message"
            >
              <Search size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
