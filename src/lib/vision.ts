import fs from "fs";
import { getSetting } from "./settings";

interface FrameAnalysis {
  frameNumber: number;
  description: string;
}

export interface VisualAnalysisResult {
  frameDescriptions: FrameAnalysis[];
  overallAnalysis: string;
  hookAnalysis: string;
  contentStyle: string;
}

export async function analyzeFrames(
  framePaths: string[],
  caption: string,
  transcript: string
): Promise<VisualAnalysisResult> {
  const apiKey = getSetting("anthropic_api_key");
  if (!apiKey) {
    throw new Error(
      "Anthropic API key not configured. Go to Settings to add it."
    );
  }

  // Build message content with images
  const content: Array<
    | { type: "text"; text: string }
    | {
        type: "image";
        source: { type: "base64"; media_type: string; data: string };
      }
  > = [];

  content.push({
    type: "text",
    text: `Analyze this Instagram Reel. I'm showing you ${framePaths.length} frames extracted from the video.

Caption: ${caption || "(no caption)"}
Transcript: ${transcript || "(no transcript available)"}

Please analyze:
1. For EACH frame, describe what's happening visually (text overlays, person on screen, scene, editing style, graphics)
2. Overall visual strategy: What visual techniques make this engaging?
3. Hook analysis: How do the first 1-3 seconds grab attention visually?
4. Content style: Talking head? B-roll? Screen recording? Text-on-screen? Mix?

Respond in this exact JSON format:
{
  "frameDescriptions": [{"frameNumber": 1, "description": "..."}],
  "overallAnalysis": "...",
  "hookAnalysis": "...",
  "contentStyle": "..."
}`,
  });

  for (let i = 0; i < framePaths.length; i++) {
    const imageData = fs.readFileSync(framePaths[i]);
    const base64 = imageData.toString("base64");
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: base64,
      },
    });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    }),
    signal: AbortSignal.timeout(90000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Claude API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const textContent = data.content?.[0]?.text || "{}";

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse Claude response as JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    frameDescriptions: parsed.frameDescriptions || [],
    overallAnalysis: parsed.overallAnalysis || "",
    hookAnalysis: parsed.hookAnalysis || "",
    contentStyle: parsed.contentStyle || "",
  };
}
