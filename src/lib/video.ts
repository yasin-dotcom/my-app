import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";
import fs from "fs";
import crypto from "crypto";

const execFileAsync = promisify(execFile);

function tempPath(ext: string): string {
  return path.join(os.tmpdir(), `reelintel-${crypto.randomUUID()}${ext}`);
}

export async function downloadVideo(url: string): Promise<string> {
  const outPath = tempPath(".mp4");

  try {
    await execFileAsync("yt-dlp", [
      "--no-playlist",
      "-f", "mp4/best",
      "-o", outPath,
      "--no-warnings",
      "--quiet",
      url,
    ], { timeout: 60000 });
  } catch (err) {
    cleanup([outPath]);
    throw new Error(`Failed to download video: ${(err as Error).message}`);
  }

  if (!fs.existsSync(outPath)) {
    throw new Error("Video download produced no output file");
  }

  return outPath;
}

export async function extractAudio(videoPath: string): Promise<string> {
  const outPath = tempPath(".mp3");

  try {
    await execFileAsync("ffmpeg", [
      "-i", videoPath,
      "-vn",
      "-acodec", "libmp3lame",
      "-ab", "128k",
      "-y",
      "-loglevel", "error",
      outPath,
    ], { timeout: 30000 });
  } catch (err) {
    cleanup([outPath]);
    throw new Error(`Failed to extract audio: ${(err as Error).message}`);
  }

  return outPath;
}

export async function extractFrames(
  videoPath: string,
  count: number = 6
): Promise<string[]> {
  // Get video duration first
  let duration = 30;
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      videoPath,
    ], { timeout: 10000 });
    duration = parseFloat(stdout.trim()) || 30;
  } catch {
    // Use default duration
  }

  const framePaths: string[] = [];
  const interval = duration / (count + 1);

  for (let i = 1; i <= count; i++) {
    const timestamp = (interval * i).toFixed(2);
    const framePath = tempPath(".jpg");

    try {
      await execFileAsync("ffmpeg", [
        "-ss", timestamp,
        "-i", videoPath,
        "-vframes", "1",
        "-q:v", "2",
        "-y",
        "-loglevel", "error",
        framePath,
      ], { timeout: 10000 });

      if (fs.existsSync(framePath)) {
        framePaths.push(framePath);
      }
    } catch {
      // Skip frames that fail
    }
  }

  return framePaths;
}

export function cleanup(paths: string[]): void {
  for (const p of paths) {
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch {
      // Ignore cleanup errors
    }
  }
}
