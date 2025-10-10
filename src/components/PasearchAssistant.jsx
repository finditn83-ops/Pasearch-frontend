// src/components/PasearchAssistant.jsx
import { useState, useEffect, useRef } from "react";
import {
  loadMemory,
  saveMemory,
  updateMemory,
  logQuestion,
} from "../utils/assistantMemory";

// Optional OpenAI client
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

  // 🌍 Mission text fallback
  const missionText = `
Pasearch is an intelligent, community-driven platform dedicated to helping individuals, communities, and authorities
track, locate, and recover lost or stolen devices — including phones, laptops, and smart TVs.

Our mission is to reduce theft by connecting users, police, and telecom partners while respecting user privacy
and complying with cybersecurity and data protection laws.

We never sell or misuse user data. All collected information (IMEI, device details, and location)
is encrypted and used solely for lawful recovery purposes in line with global cyber regulations.
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    if (selectedVoice) utterance.voice = selectedVoice;

    setSpeaking(true);
    speechActiveRef.current = true;

    utterance.onend = () => {
      setSpeaking(false);
      speechActiveRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  // 🎤 Start listening (mic)
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
      speak("Hi, I am PasearchAI Assistant. How can I help you today?");
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleVoiceInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  // 🎧 Auto interrupt
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    let audioContext, analyser, mic, dataArray;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext = new AudioContext();
        mic = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        mic.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detectSpeech = () => {
          analyser.getByteFrequencyData(dataArray);
          const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          if (volume > 60 && speechActiveRef.current) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            speechActiveRef.current = false;
          }
          requestAnimationFrame(detectSpeech);
        };
        detectSpeech();
      })
      .catch((err) => console.error("Microphone access denied:", err));

    return () => {
      if (audioContext) audioContext.close();
    };
  }, []);

  // 🧠 Handle voice input
  const handleVoiceInput = (voiceText) => {
    window.speechSynthesis.cancel();
    setInput(voiceText);
    handleSend(null, voiceText);
  };

  // 🚀 Handle send
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

    // Detect and store user name
    if (lower.startsWith("my name is")) {
      const name = trimmed.split(" ").slice(3).join(" ");
      updateMemory("name", name);
      setMemory(loadMemory());
      const reply = `Nice to meet you, ${name}. I'll remember your name for future conversations.`;
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      speak(reply);
      return;
    }

    // Detect preferred device
    if (lower.includes("my device is") || lower.includes("i mostly use")) {
      const preferred = trimmed.split(" ").slice(-1)[0];
      updateMemory("preferredDevice", preferred);
      setMemory(loadMemory());
      const reply = `Got it. I’ll remember your preferred device as ${preferred}.`;
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      speak(reply);
      return;
    }

    if (keywords.some((kw) => lower.includes(kw))) {
      const botReply = { from: "bot", text: missionText };
      setMessages((prev) => [...prev, botReply]);
      speak(missionText);
      return;
    }

    // Use OpenAI if available
    if (OpenAIClient) {
      setLoading(true);
      try {
        const completion = await OpenAIClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `
You are PasearchAI, a privacy-focused assistant helping users track and recover devices.
Use this stored memory to personalize responses:

${JSON.stringify(memory, null, 2)}

Always comply with privacy laws and never expose sensitive data.
If user identity is known, greet them by name.
`,
            },
            { role: "user", content: trimmed },
          ],
        });
        const reply = completion.choices[0].message.content;
        const botReply = { from: "bot", text: reply };
        setMessages((prev) => [...prev, botReply]);
        speak(reply);
      } catch (error) {
        console.error("AI error:", error);
        const fallback = "I'm having trouble connecting to the AI server right now.";
        setMessages((prev) => [...prev, { from: "bot", text: fallback }]);
        speak(fallback);
      } finally {
        setLoading(false);
      }
    } else {
      const botReply = {
        from: "bot",
        text: "I can help you with device tracking, recovery reports, or privacy questions. You can speak or type to me anytime.",
      };
      setMessages((prev) => [...prev, botReply]);
      speak(botReply.text);
    }
  };

  // 🖥️ Auto greeting (personalized)
  useEffect(() => {
    const introPlayed = sessionStorage.getItem("pasearch_intro_played");
    if (!introPlayed && voices.length > 0) {
      const welcome = memory.name
        ? `Welcome back, ${memory.name}! I’m PasearchAI, ready to assist you again.`
        : "Hello, I’m PasearchAI Assistant. I help you track and recover lost or stolen devices while keeping your data secure and private.";
      speak(welcome);
      sessionStorage.setItem("pasearch_intro_played", "true");
    }
  }, [voices]);

  // 🖥️ UI
  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
      {/* Header */}
      <div className="p-3 bg-blue-600 text-white text-center font-semibold rounded-t-xl flex justify-between items-center">
        <span className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full ${
              listening
                ? "bg-red-500 animate-ping"
                : speaking
                ? "bg-blue-400 animate-pulse"
                : "bg-gray-300"
            }`}
          ></div>
          PasearchAI Assistant 🤖
        </span>
        <button
          onClick={startListening}
          className={`ml-2 px-2 py-1 text-xs rounded ${
            listening ? "bg-red-500" : "bg-white text-blue-600"
          }`}
        >
          {listening ? "Listening..." : "🎤"}
        </button>
      </div>

      {/* Voice Selector */}
      {voices.length > 0 && (
        <div className="p-2 border-b bg-gray-50 text-xs text-gray-700 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label htmlFor="voiceSelect" className="mr-2 font-medium text-gray-600">
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
          </div>

          <button
            onClick={() =>
              speak(
                "Hello, I’m PasearchAI Assistant. I help you track and recover lost or stolen devices while protecting your privacy."
              )
            }
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded w-full text-center transition"
          >
            ▶️ Play Introduction
          </button>

          {/* Forget Memory */}
          <button
            onClick={() => {
              localStorage.removeItem("pasearch_ai_memory");
              setMemory({ name: null, preferredDevice: null, previousQuestions: [] });
              alert("Your AI memory has been cleared.");
            }}
            className="text-xs text-red-600 underline mt-1"
          >
            🧹 Forget My Data
          </button>
        </div>
      )}

      {/* Chat Window */}
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
  );
}
