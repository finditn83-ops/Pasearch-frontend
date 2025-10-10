// src/utils/assistantMemory.js

// ✅ Load memory
export const loadMemory = () => {
  try {
    return JSON.parse(localStorage.getItem("pasearch_ai_memory")) || {
      name: null,
      preferredDevice: null,
      previousQuestions: [],
    };
  } catch {
    return { name: null, preferredDevice: null, previousQuestions: [] };
  }
};

// ✅ Save memory
export const saveMemory = (data) => {
  localStorage.setItem("pasearch_ai_memory", JSON.stringify(data));
};

// ✅ Update memory incrementally
export const updateMemory = (key, value) => {
  const memory = loadMemory();
  memory[key] = value;
  saveMemory(memory);
};

// ✅ Log previous user questions
export const logQuestion = (question) => {
  const memory = loadMemory();
  memory.previousQuestions = [
    ...(memory.previousQuestions || []),
    question,
  ].slice(-10); // keep last 10
  saveMemory(memory);
};
