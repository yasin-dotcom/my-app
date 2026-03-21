import fs from "fs";
import { getSetting } from "./settings";

export async function transcribeAudio(audioPath: string): Promise<string> {
  const apiKey = getSetting("openai_api_key");
  if (!apiKey) {
    throw new Error(
      "OpenAI API key not configured. Go to Settings to add it."
    );
  }

  const audioBuffer = fs.readFileSync(audioPath);
  const blob = new Blob([audioBuffer], { type: "audio/mpeg" });

  const formData = new FormData();
  formData.append("file", blob, "audio.mp3");
  formData.append("model", "whisper-1");
  formData.append("response_format", "text");

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
      signal: AbortSignal.timeout(60000),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Whisper API error (${response.status}): ${text}`);
  }

  const transcript = await response.text();
  return transcript.trim();
}
