import { playAudio } from "@/services/audioService";
import { saveRepeatRecord as saveRepeatRecordToStorage } from "@/services/progressService";
import type { RepeatRecord } from "@/types/book";

let recorderManager: UniApp.RecorderManager | null = null;

function getRecorderManager(): UniApp.RecorderManager {
  if (!recorderManager) recorderManager = uni.getRecorderManager();
  return recorderManager;
}

export async function startRecord(): Promise<void> {
  await ensureRecordPermission();
  getRecorderManager().start({
    duration: 60000,
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 48000,
    format: "mp3"
  });
}

export function stopRecord(): Promise<string> {
  const manager = getRecorderManager();

  return new Promise((resolve, reject) => {
    const handleStop = async (result: { tempFilePath: string }) => {
      removeRecorderListeners(manager, handleStop, handleError);
      try {
        resolve(await persistRecordFile(result.tempFilePath));
      } catch (error) {
        reject(error);
      }
    };
    const handleError = (error: unknown) => {
      removeRecorderListeners(manager, handleStop, handleError);
      reject(error);
    };

    manager.onStop(handleStop);
    manager.onError(handleError);
    manager.stop();
  });
}

export function playRecord(filePath: string): void {
  playAudio(filePath);
}

export function saveRepeatRecord(record: Omit<RepeatRecord, "userId" | "createdAt">): RepeatRecord {
  return saveRepeatRecordToStorage(record);
}

async function ensureRecordPermission(): Promise<void> {
  const setting = await new Promise<UniApp.GetSettingSuccessResult>((resolve, reject) => {
    uni.getSetting({ success: resolve, fail: reject });
  });
  if (setting.authSetting["scope.record"]) return;

  await new Promise<void>((resolve, reject) => {
    uni.authorize({
      scope: "scope.record",
      success: () => resolve(),
      fail: reject
    });
  });
}

function persistRecordFile(tempFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.saveFile({
      tempFilePath,
      success: (result) => resolve(result.savedFilePath),
      fail: reject
    });
  });
}

function removeRecorderListeners(
  manager: UniApp.RecorderManager,
  stopHandler: (result: { tempFilePath: string }) => void,
  errorHandler: (error: unknown) => void
): void {
  const managerWithOff = manager as UniApp.RecorderManager & {
    offStop?: (handler: typeof stopHandler) => void;
    offError?: (handler: typeof errorHandler) => void;
  };
  managerWithOff.offStop?.(stopHandler);
  managerWithOff.offError?.(errorHandler);
}
