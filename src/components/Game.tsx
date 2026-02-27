"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getRandomObject } from "@/lib/objects";
import { addSession } from "@/lib/storage";

const TOTAL_SECONDS = 120;

type Phase = "idle" | "playing" | "done";

export default function Game() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [object, setObject] = useState("");
  const [uses, setUses] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishGame = useCallback(
    (currentUses: string[]) => {
      stopTimer();
      setPhase("done");
      const elapsed = TOTAL_SECONDS - secondsLeft;
      addSession({
        id: crypto.randomUUID(),
        object,
        uses: currentUses,
        durationSeconds: elapsed > 0 ? elapsed : TOTAL_SECONDS,
        timestamp: Date.now(),
      });
    },
    [stopTimer, secondsLeft, object]
  );

  // Keep a ref to uses so the timer callback can read the latest value
  const usesRef = useRef(uses);
  usesRef.current = uses;

  const startGame = () => {
    const obj = getRandomObject();
    setObject(obj);
    setUses([]);
    setInput("");
    setSecondsLeft(TOTAL_SECONDS);
    setPhase("playing");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Timer effect
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [phase, stopTimer]);

  // Watch for timer hitting 0
  useEffect(() => {
    if (phase === "playing" && secondsLeft === 0) {
      finishGame(usesRef.current);
    }
  }, [phase, secondsLeft, finishGame]);

  const addUse = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const next = [...uses, trimmed];
    setUses(next);
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addUse();
    }
  };

  const endEarly = () => {
    finishGame(uses);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const pct = ((TOTAL_SECONDS - secondsLeft) / TOTAL_SECONDS) * 100;

  // --- Idle ---
  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center gap-8 py-16">
        <h1 className="text-4xl font-bold tracking-tight">Divergent Thinking</h1>
        <p className="max-w-md text-center text-lg text-zinc-500">
          You&apos;ll get a random object. List as many creative uses for it as
          you can in 2 minutes.
        </p>
        <button
          onClick={startGame}
          className="rounded-full bg-zinc-900 px-8 py-3 text-lg font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Start
        </button>
      </div>
    );
  }

  // --- Done ---
  if (phase === "done") {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <h2 className="text-3xl font-bold">Time&apos;s up!</h2>
        <p className="text-lg text-zinc-500">
          Object: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{object}</span>
        </p>
        <p className="text-5xl font-bold">{uses.length}</p>
        <p className="text-zinc-500">uses listed</p>

        {uses.length > 0 && (
          <ul className="mt-4 w-full max-w-md space-y-1">
            {uses.map((u, i) => (
              <li key={i} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800">
                {i + 1}. {u}
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={startGame}
          className="mt-6 rounded-full bg-zinc-900 px-8 py-3 text-lg font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Play Again
        </button>
      </div>
    );
  }

  // --- Playing ---
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Timer bar */}
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-between text-sm font-medium text-zinc-500">
          <span>{formatTime(secondsLeft)}</span>
          <span>{uses.length} uses</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
          <div
            className="h-full rounded-full bg-zinc-900 transition-all duration-1000 ease-linear dark:bg-white"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Object */}
      <div className="mt-4 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-400">
          Your object
        </p>
        <p className="mt-1 text-4xl font-bold">{object}</p>
      </div>

      {/* Input */}
      <div className="flex w-full max-w-lg gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a use and press Enter…"
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:focus:border-zinc-400 dark:focus:ring-zinc-700"
          autoFocus
        />
        <button
          onClick={addUse}
          className="rounded-lg bg-zinc-900 px-5 py-3 font-semibold text-white transition hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Add
        </button>
      </div>

      {/* Use list */}
      {uses.length > 0 && (
        <ul className="w-full max-w-lg space-y-1">
          {[...uses].reverse().map((u, i) => (
            <li
              key={uses.length - 1 - i}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800"
            >
              {uses.length - i}. {u}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={endEarly}
        className="mt-4 text-sm text-zinc-400 underline transition hover:text-zinc-600"
      >
        End early
      </button>
    </div>
  );
}
