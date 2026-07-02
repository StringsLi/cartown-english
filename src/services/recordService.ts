import { playAudio } from "@/services/audioService";
import { saveRepeatRecord as saveRepeatRecordToStorage } from "@/services/progressService";
import type { RepeatRecord } from "@/types/book";

let recorderManager: UniApp.RecorderManager | null = null;

function getRecorderManager(): UniApp.RecorderManager {
  if (!recorderManager) {
    recorderManager = uni.getRecorderManager();
  }

  return recorderManager;
}

export function startRecord(): void {
  getRecorderManager().start({
    duration: 10000,
    format: "mp3"
  });
}

export function stopRecord(): Promise<string> {
  const manager = getRecorderManager();

  return new Promise((resolve, reject) => {
    manager.onStop((result) => {
      resolve(result.tempFilePath);
    });
    manager.onError((error) => {
      reject(error);
    });
    manager.stop();
  });
}

export function playRecord(tempFilePath: string): void {
  playAudio(tempFilePath);
}

export function saveRepeatRecord(record: Omit<RepeatRecord, "userId" | "createdAt">): RepeatRecord {
  return saveRepeatRecordToStorage(record);
}
