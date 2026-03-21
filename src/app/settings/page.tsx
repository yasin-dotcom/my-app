"use client";

import { useState, useEffect } from "react";

const API_KEYS = [
  {
    key: "apify_api_key",
    label: "Apify API Key",
    description: "For searching Instagram. Get one free at apify.com",
    required: true,
  },
  {
    key: "openai_api_key",
    label: "OpenAI API Key",
    description: "For Whisper transcription. From platform.openai.com",
    required: false,
  },
  {
    key: "anthropic_api_key",
    label: "Anthropic API Key",
    description: "For visual analysis with Claude. From console.anthropic.com",
    required: false,
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, { type: "success" | "error"; text: string }>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
    } catch {
      // ignore
    }
  }

  async function saveKey(key: string) {
    const value = inputs[key];
    if (!value?.trim()) return;

    setSaving((s) => ({ ...s, [key]: true }));
    setMessages((m) => ({ ...m, [key]: undefined as unknown as { type: "success" | "error"; text: string } }));

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: value.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }

      setMessages((m) => ({ ...m, [key]: { type: "success", text: "Saved!" } }));
      setInputs((i) => ({ ...i, [key]: "" }));
      fetchSettings();
    } catch (err) {
      setMessages((m) => ({
        ...m,
        [key]: { type: "error", text: (err as Error).message },
      }));
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Settings</h1>
      <p className="text-gray-400 mb-8">
        Add your API keys to enable Instagram scanning, transcription, and visual analysis.
      </p>

      <div className="space-y-6">
        {API_KEYS.map((apiKey) => (
          <div key={apiKey.key} className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{apiKey.label}</h3>
              {apiKey.required && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                  required
                </span>
              )}
              {settings[apiKey.key] && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-300">
                  configured
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-3">{apiKey.description}</p>

            {settings[apiKey.key] && (
              <div className="text-xs text-gray-500 mb-2 font-mono">
                Current: {settings[apiKey.key]}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="password"
                value={inputs[apiKey.key] || ""}
                onChange={(e) =>
                  setInputs((i) => ({ ...i, [apiKey.key]: e.target.value }))
                }
                placeholder={settings[apiKey.key] ? "Enter new key to update" : "Paste your API key"}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 text-sm"
              />
              <button
                onClick={() => saveKey(apiKey.key)}
                disabled={saving[apiKey.key] || !inputs[apiKey.key]?.trim()}
                className="px-4 py-2.5 rounded-lg bg-violet-500/20 text-violet-300 text-sm font-medium hover:bg-violet-500/30 transition-colors disabled:opacity-50"
              >
                {saving[apiKey.key] ? "Saving..." : "Save"}
              </button>
            </div>

            {messages[apiKey.key] && (
              <div
                className={`mt-2 text-xs ${
                  messages[apiKey.key].type === "success"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {messages[apiKey.key].text}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* System requirements */}
      <div className="mt-8 glass-card rounded-xl p-6">
        <h3 className="font-medium mb-3">System Requirements</h3>
        <p className="text-sm text-gray-400 mb-3">
          For deep analysis (transcript + visual), you also need these installed on your system:
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono">yt-dlp</span>
            <span className="text-gray-500">-</span>
            <span className="text-gray-400">Downloads Instagram videos</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-mono">ffmpeg</span>
            <span className="text-gray-500">-</span>
            <span className="text-gray-400">Extracts audio and video frames</span>
          </div>
        </div>
        <div className="mt-3 p-3 bg-white/5 rounded-lg">
          <p className="text-xs text-gray-500 font-mono">
            # Install on macOS with Homebrew:<br />
            brew install yt-dlp ffmpeg
          </p>
        </div>
      </div>
    </div>
  );
}
