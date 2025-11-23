import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  public isConfigured(): boolean {
    return !!this.ai;
  }

  public updateApiKey(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  public async generatePlaylistDescription(title: string, videoTitles: string[]): Promise<string> {
    if (!this.ai) throw new Error("Gemini API Key not configured");

    const prompt = `
      I have a YouTube playlist titled "${title}". 
      It contains the following videos:
      ${videoTitles.slice(0, 20).join('\n')}
      ${videoTitles.length > 20 ? `...and ${videoTitles.length - 20} more.` : ''}

      Please write a catchy, SEO-friendly description for this playlist in 2 sentences.
      Focus on the common themes found in the video titles.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "No description generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Cool playlist created via TubeSync Manager.";
    }
  }
}

export const geminiService = new GeminiService(process.env.API_KEY || '');
