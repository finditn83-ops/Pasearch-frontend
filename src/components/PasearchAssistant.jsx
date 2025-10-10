// src/components/PasearchAssistant.jsx
import { useState, useEffect, useRef } from "react";
import {
  loadMemory,
  updateMemory,
  logQuestion,
} from "../utils/assistantMemory";

// Optional OpenAI client (only used if key present)
let OpenAIClient = null;
if (import.meta.env.VITE_OPENAI_API_KEY) {
  import("openai").then((mod) => {
    OpenAIClient = new mod.default({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });
  });
}

export default function PasearchAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [memory, setMemory] = useState(loadMemory());
  const recognitionRef = useRef(null);
  const speechActiveRef = useRef(false);

  // 🌍 Mission text
  const missionText = `
Pasearch is an intelligent, community-driven platform that helps individuals, communities, and authorities 
track, locate, and recover lost or stolen devices — including phones, laptops, and smart TVs.

We prioritize your privacy and comply with cybersecurity and data protection laws. 
All data is encrypted and never sold or misused — used only for lawful recovery.
`;

  // 🔊 Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voiceList = window.speechSynthesis.getVoices();
      setVoices(voiceList);
      if (!selectedVoice && voiceList.length > 0) {
        const preferred =
          voiceList.find((v) =>
            ["Google US English", "Google UK English Female", "Microsoft Zira", "Samantha", "Alex"].includes(v.name)
          ) || voiceList[0];
        setSelectedVoice(preferred);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // 🗣️ Speak helper
  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    utter.pitch = 1;
    if (selectedVoice) utter.voice = selectedVoice;

    setSpeaking(true);
    speechActiveRef.current = true;
    utter.onend = () => {
      setSpeaking(false);
      speechActiveRef.current = false;
    };
    window.speechSynthesis.speak(utter);
  };

  // 🎤 Manual start listening only when clicked
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setListening(true);
      speak("I'm listening now.");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleVoiceInput(transcript);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // 🧠 Handle voice input
  const handleVoiceInput = (voiceText) => {
    setInput(voiceText);
    handleSend(null, voiceText);
  };

  // 🚀 Handle send (typed or voice)
  const handleSend = async (e, manualInput = null) => {
    if (e) e.preventDefault();
    const trimmed = (manualInput || input).trim();
    if (!trimmed) return;

    const userMsg = { from: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    logQuestion(trimmed);

    const lower = trimmed.toLowerCase();
    const keywords = ["about", "aim", "mission", "goal", "purpose", "what is pasearch", "who are you"];

    // Detect name
    if (lower.startsWith("my name is")) {
      const name = trimmed.split(" ").slice(3).join(" ");
      updateMemory("name", name);
      setMemory(loadMemory());
      const reply = `Nice to meet you, ${name}. I'll remember your name for next time.`;
      setMessages((p) => [...p, { from: "bot", text: reply }]);
      speak(reply);
      return;
    }

    // Detect preferred device
    if (lower.includes("my device is") || lower.includes("i mostly use")) {
      const device = trimmed.split(" ").slice(-1)[0];
      updateMemory("preferredDevice", device);
      setMemory(loadMemory());
      const reply = `Got it. I’ll remember your preferred device as ${device}.`;
      setMessages((p) => [...p, { from: "bot", text: reply }]);
      speak(reply);
      return;
    }

    if (keywords.some((kw) => lower.includes(kw))) {
      const botReply = { from: "bot", text: missionText };
      setMessages((p) => [...p, botReply]);
      speak(missionText);
      return;
    }

    // If OpenAI key exists, use it
    if (OpenAIClient) {
      setLoading(true);
      try {
        const completion = await OpenAIClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
You are PasearchAI, a privacy-focused assistant helping users recover lost devices. 
Use the memory below to personalize your responses:
${JSON.stringify(memory, null, 2)}
Always comply with privacy laws.
`,
            },
            { role: "user", content: trimmed },
          ],
        });
        const reply = completion.choices[0].message.content;
        const botReply = { from: "bot", text: reply };
        setMessages((p) => [...p, botReply]);
        speak(reply);
      } catch {
        const fallback = "I’m having trouble connecting right now.";
        setMessages((p) => [...p, { from: "bot", text: fallback }]);
        speak(fallback);
      } finally {
        setLoading(false);
      }
    } else {
      const reply = "I can help with device tracking, reporting, or privacy questions anytime.";
      setMessages((p) => [...p, { from: "bot", text: reply }]);
      speak(reply);
    }
  };

  // 🖐 Greet once
  useEffect(() => {
    const introPlayed = sessionStorage.getItem("pasearch_intro_played");
    if (!introPlayed && voices.length > 0) {
      const welcome = memory.name
        ? `Welcome back, ${memory.name}! I’m PasearchAI, ready to help again.`
        : "Hello! I’m PasearchAI Assistant. Ready to assist you in device recovery while keeping your data safe.";
      speak(welcome);
      sessionStorage.setItem("pasearch_intro_played", "true");
    }
  }, [voices]);

  return (
    <>
      {/* Floating Chat Icon */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition transform hover:scale-110 z-50"
          title="Open PasearchAI Assistant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.59 0-3.07-.37-4.36-1.03L3 20l1.5-3.64C3.52 15.13 3 13.61 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 flex flex-col">
          {/* Header */}
          <div className="p-3 bg-blue-600 text-white flex justify-between items-center rounded-t-xl">
            <span className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  listening
                    ? "bg-red-500 animate-ping"
                    : speaking
                    ? "bg-blue-400 animate-pulse"
                    : "bg-gray-300"
                }`}
              ></div>
              <span className="font-semibold">PasearchAI</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-white text-sm bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
            >
              ✕
            </button>
          </div>

          {/* Voice Selector + Mic */}
          {voices.length > 0 && (
            <div className="p-2 border-b bg-gray-50 text-xs flex items-center justify-between">
              <label htmlFor="voiceSelect" className="text-gray-600 mr-1">
                Voice:
              </label>
              <select
                id="voiceSelect"
                value={selectedVoice?.name || ""}
                onChange={(e) => {
                  const v = voices.find((voice) => voice.name === e.target.value);
                  setSelectedVoice(v);
                }}
                className="flex-1 text-xs border rounded px-1 py-1 bg-white"
              >
                {voices.map((v, i) => (
                  <option key={i} value={v.name}>
                    {v.name.replace("Google", "").replace("Microsoft", "").trim()}
                  </option>
                ))}
              </select>
              <button
                onClick={startListening}
                className={`ml-2 px-2 py-1 text-xs rounded ${
                  listening ? "bg-red-500 text-white" : "bg-blue-600 text-white"
                }`}
              >
                🎤
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 h-64 overflow-y-auto p-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg text-sm ${
                  msg.from === "user"
                    ? "bg-blue-100 text-right text-gray-800"
                    : "bg-gray-100 text-left text-gray-800"
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

          {/* Input */}
          <form onSubmit={handleSend} className="flex border-t">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask or speak..."
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
      )}
    </>
  );
}
