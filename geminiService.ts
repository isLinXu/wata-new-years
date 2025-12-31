
import { GoogleGenAI } from "@google/genai";

export const generateSmartGreeting = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一个深思熟虑、博学且浪漫的学术酒吧主理人。请为“瓦塔社区酒馆”创作一条2026跨年祝福语。
      调性：理性与感性并重，可以涉及科学、哲学、文学或艺术，字数不超过40字。
      关键词：${prompt}`,
      config: {
        temperature: 0.85,
      }
    });
    return response.text.trim() || "在理性的微醺中，迎接跨越维度的2026。";
  } catch (error) {
    console.error("Failed to generate greeting:", error);
    return "智慧如星辰，照亮2026的未知旅程。";
  }
};
