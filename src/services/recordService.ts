import { playAudio } from "@/services/audioService";
import { saveRepeatRecord as saveRepeatRecordToStorage } from "@/services/progressService";
import type { RepeatRecord } from "@/types/book";

let recorderManager: UniApp.RecorderManager | null = null;
let browserRecorder: MediaRecorder | null = null;
let browserStream: MediaStream | null = null;
let browserChunks: BlobPart[] = [];

function getRecorderManager(): UniApp.RecorderManager {
  if (!recorderManager) {
    recorderManager = uni.getRecorderManager();
  }

  return recorderManager;
}

export async function startRecord(): Promise<void> {
  // #ifdef H5
  await startBrowserRecord();
  return;
  // #endif

  // #ifndef H5
  await ensureRecordPermission();
  getRecorderManager().start({
    duration: 60000,
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 48000,
    format: "mp3"
  });
  // #endif
}

export async function stopRecord(): Promise<string> {
  // #ifdef H5
  return stopBrowserRecord();
  // #endif

  // #ifndef H5
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
  // #endif
}

export function playRecord(tempFilePath: string): void {
  playAudio(tempFilePath);
}

export function saveRepeatRecord(record: Omit<RepeatRecord, "userId" | "createdAt">): RepeatRecord {
  return saveRepeatRecordToStorage(record);
}

async function ensureRecordPermission(): Promise<void> {
  // #ifdef MP-WEIXIN
  await new Promise<void>((resolve, reject) => {
    uni.getSetting({
      success(result) {
        if (result.authSetting["scope.record"]) {
          resolve();
          return;
        }

        uni.authorize({ scope: "scope.record", success: () => resolve(), fail: reject });
      },
      fail: reject
    });
  });
  // #endif
}

function persistRecordFile(tempFilePath: string): Promise<string> {
  // #ifdef MP-WEIXIN
  return new Promise((resolve, reject) => {
    uni.saveFile({
      tempFilePath,
      success: (result) => resolve(result.savedFilePath),
      fail: reject
    });
  });
  // #endif

  // #ifndef MP-WEIXIN
  return Promise.resolve(tempFilePath);
  // #endif
}

function removeRecorderListeners(
  manager: UniApp.RecorderManager,
  stopHandler: (result: { tempFilePath: string }) => void,
  errorHandler: (error: unknown) => void
) {
  const managerWithOff = manager as UniApp.RecorderManager & {
    offStop?: (handler: typeof stopHandler) => void;
    offError?: (handler: typeof errorHandler) => void;
  };
  managerWithOff.offStop?.(stopHandler);
  managerWithOff.offError?.(errorHandler);
}

async function startBrowserRecord(): Promise<void> {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    throw new Error("Recording is not supported in this browser.");
  }

  browserStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  browserChunks = [];
  browserRecorder = new MediaRecorder(browserStream);
  browserRecorder.ondataavailable = (event) => {
    if (event.data.size) browserChunks.push(event.data);
  };
  browserRecorder.start();
}

function stopBrowserRecord(): Promise<string> {
  if (!browserRecorder || browserRecorder.state === "inactive") {
    return Promise.reject(new Error("No active recording."));
  }

  return new Promise((resolve, reject) => {
    const recorder = browserRecorder as MediaRecorder;
    recorder.onerror = () => reject(new Error("Recording failed."));
    recorder.onstop = () => {
      const blob = new Blob(browserChunks, { type: recorder.mimeType || "audio/webm" });
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Unable to save recording."));
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
      browserStream?.getTracks().forEach((track) => track.stop());
      browserStream = null;
      browserRecorder = null;
      browserChunks = [];
    };
    recorder.stop();
  });
}
