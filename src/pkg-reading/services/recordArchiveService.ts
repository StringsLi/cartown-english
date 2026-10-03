import type { RepeatRecord } from "@/types/book";
import { prepareRecordFile, type PreparedRecordFile } from "./recordExportService";
declare const wx: { env: { USER_DATA_PATH: string } };

const ARCHIVE_VERSION = 1;
const MAX_ARCHIVE_RECORDS = 12;
const MAX_AUDIO_BYTES = 3 * 1024 * 1024;

type ArchiveAudio =
  | { encoding: "data-url"; value: string }
  | { encoding: "base64"; value: string; mimeType: string }
  | { encoding: "unavailable" };

interface RepeatArchiveRecord {
  bookId: string;
  sentence: string;
  durationSeconds?: number;
  createdAt: string;
  audio: ArchiveAudio;
}

interface RepeatArchive {
  kind: "cartown-repeat-records";
  version: number;
  exportedAt: string;
  records: RepeatArchiveRecord[];
}

export interface RecordArchiveResult {
  total: number;
  skipped: number;
  records: RepeatRecord[];
}

export async function prepareRepeatRecordArchive(sourceRecords: RepeatRecord[]): Promise<PreparedRecordFile & { count: number; skipped: number }> {
  const records = sourceRecords.slice(0, MAX_ARCHIVE_RECORDS);
  if (!records.length) throw new Error("暂无录音可导出，先陪孩子录一句吧");
  const all = await Promise.all(records.map(toArchiveRecord));
  const available = all.filter(r => r.audio.encoding !== "unavailable");
  if (!available.length) throw new Error("录音文件已失效，请重新录制后导出");
  const archive: RepeatArchive = {
    kind: "cartown-repeat-records",
    version: ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    records: available
  };
  const file = await prepareRecordFile(JSON.stringify(archive, null, 2), `cartown-records-${dateStamp()}-${Date.now()}.json`, "utf8", "application/json");
  return { ...file, count: available.length, skipped: all.length - available.length };
}

export async function prepareRepeatRecordAudio(record: RepeatRecord): Promise<PreparedRecordFile> {
  const audio = await serialiseAudio(record.audioUrl);
  if (audio.encoding === "unavailable") throw new Error("这条录音文件已失效，请重新录制");
  const match = audio.encoding === "data-url" ? /^data:audio\/(mpeg|mp3|wav|webm|ogg|mp4);base64,([A-Za-z0-9+/=]+)$/.exec(audio.value) : null;
  if (audio.encoding === "data-url" && !match) throw new Error("录音格式暂不支持导出");
  const base64 = audio.encoding === "base64" ? audio.value : match![2];
  const mimeType = audio.encoding === "base64" ? audio.mimeType : `audio/${match![1]}`;
  const format = ({ "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/mp4": "m4a", "audio/wav": "wav", "audio/ogg": "ogg", "audio/webm": "webm" } as Record<string,string>)[mimeType] || "mp3";
  const sentence = record.sentence.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 36) || "repeat";
  return prepareRecordFile(base64, `cartown-${sentence}-${Date.now()}.${format}`, "base64", mimeType);
}

export async function importRepeatRecordArchive(): Promise<RecordArchiveResult> {
  return restoreArchive(await chooseArchiveFile());
}

export async function restoreArchive(content: string): Promise<RecordArchiveResult> {
  const archive = parseArchive(content);
  const restored: RepeatRecord[] = [];
  let skipped = 0;

  for (const record of archive.records.slice(0, MAX_ARCHIVE_RECORDS)) {
    if (!record || typeof record.bookId !== "string" || !record.bookId || typeof record.sentence !== "string" || !record.sentence || typeof record.createdAt !== "string" || !record.createdAt) { skipped += 1; continue; }
    let audioUrl: string | null = null;
    try { if (record && typeof record === "object" && record.audio) audioUrl = await restoreAudio(record.audio); } catch { /* 跳过损坏的单条录音 */ }
    if (!audioUrl) {
      skipped += 1;
      continue;
    }
    restored.push({
      userId: "local_child",
      bookId: record.bookId,
      sentence: record.sentence,
      audioUrl,
      durationSeconds: record.durationSeconds,
      createdAt: record.createdAt
    });
  }

  return {
    total: archive.records.length,
    skipped,
    records: restored
  };
}

async function toArchiveRecord(record: RepeatRecord): Promise<RepeatArchiveRecord> {
  return {
    bookId: record.bookId,
    sentence: record.sentence,
    durationSeconds: record.durationSeconds,
    createdAt: record.createdAt,
    audio: await serialiseAudio(record.audioUrl)
  };
}

async function serialiseAudio(audioUrl: string): Promise<ArchiveAudio> {
  if (audioUrl.startsWith("data:audio/")) return audioUrl.length <= MAX_AUDIO_BYTES * 1.4 ? { encoding: "data-url", value: audioUrl } : { encoding: "unavailable" };

  try {
    const base64 = await readMiniProgramFile(audioUrl, "base64");
    if (!base64.length || base64.length > MAX_AUDIO_BYTES * 1.4) return { encoding: "unavailable" };
    const extension = audioUrl.split(".").pop()?.toLowerCase() || "mp3";
    const mimeType = ({ wav: "audio/wav", ogg: "audio/ogg", webm: "audio/webm", m4a: "audio/mp4" } as Record<string,string>)[extension] || "audio/mpeg";
    return { encoding: "base64", value: base64, mimeType };
  } catch {
    return { encoding: "unavailable" };
  }
}

async function restoreAudio(audio: ArchiveAudio): Promise<string | null> {
  let base64 = "", mimeType = "audio/mpeg";
  if (audio.encoding === "data-url" && typeof audio.value === "string") {
    const match = /^data:(audio\/(?:mpeg|mp3|wav|webm|ogg|mp4));base64,([A-Za-z0-9+/=]+)$/.exec(audio.value);
    if (!match) return null;
    mimeType = match[1]; base64 = match[2];
  } else if (audio.encoding === "base64" && typeof audio.value === "string" && /^[A-Za-z0-9+/=]+$/.test(audio.value)) { base64 = audio.value; mimeType = typeof audio.mimeType === "string" && /^audio\/(mpeg|mp3|wav|webm|ogg|mp4)$/.test(audio.mimeType) ? audio.mimeType : "audio/mpeg"; }
  if (!base64 || base64.length > MAX_AUDIO_BYTES * 1.4) return null;
  // #ifdef H5
  return `data:${mimeType};base64,${base64}`;
  // #endif
  // #ifdef MP-WEIXIN
  const extension = ({ "audio/wav": "wav", "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "m4a" } as Record<string,string>)[mimeType] || "mp3";
  return writeMiniProgramAudio(base64, extension);
  // #endif
  return null;
}

function parseArchive(content: string): RepeatArchive {
  if (content.length > 64 * 1024 * 1024) throw new Error("备份文件太大，请选择本程序导出的文件");
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("备份文件格式有误，请选择导出的 JSON 文件");
  }
  if (!isRepeatArchive(parsed)) throw new Error("这不是车车英语的录音备份文件");
  return parsed;
}

function isRepeatArchive(value: unknown): value is RepeatArchive {
  if (!value || typeof value !== "object") return false;
  const archive = value as Partial<RepeatArchive>;
  return archive.kind === "cartown-repeat-records"
    && archive.version === ARCHIVE_VERSION
    && Array.isArray(archive.records);
}

async function chooseArchiveFile(): Promise<string> {
  // #ifdef H5
  return new Promise<string>((resolve,reject) => {
    const input = document.createElement("input"); input.type = "file"; input.accept = ".json,application/json";
    input.style.display = "none"; document.body.appendChild(input);
    input.onchange = async () => {
      const file = input.files?.[0]; input.remove();
      if (!file) return reject(new Error("已取消选择"));
      if (file.size > 64 * 1024 * 1024) return reject(new Error("备份文件太大"));
      try { resolve(await file.text()); } catch { reject(new Error("备份文件读取失败")); }
    };
    input.addEventListener("cancel", () => { input.remove(); reject(new Error("已取消选择")); }); input.click();
  });
  // #endif
  // #ifdef MP-WEIXIN
  const chooseMessageFile = (uni as typeof uni & {
    chooseMessageFile(options: {
      count: number;
      type: "file";
      extension: string[];
      success(result: { tempFiles: Array<{ path: string }> }): void;
      fail(error: unknown): void;
    }): void;
  }).chooseMessageFile;

  const result = await new Promise<{ tempFilePath: string }>((resolve, reject) => {
    chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["json"],
      success: (selection) => {
        const path = selection.tempFiles[0]?.path;
        if (path) resolve({ tempFilePath: path });
        else reject(new Error("No backup file was selected."));
      },
      fail: reject
    });
  });
  return readMiniProgramFile(result.tempFilePath, "utf8");
  // #endif
  throw new Error("请在微信小程序或网页中导入录音");
}

function readMiniProgramFile(filePath: string, encoding: "utf8" | "base64"): Promise<string> {
  const manager = uni.getFileSystemManager();
  return new Promise((resolve, reject) => {
    manager.readFile({
      filePath,
      encoding,
      success: (result) => resolve(String(result.data)),
      fail: reject
    });
  });
}

let importSequence = 0;
async function writeMiniProgramAudio(base64: string, extension = "mp3"): Promise<string> {
  const manager = uni.getFileSystemManager();
  const filePath = `${wx.env.USER_DATA_PATH}/cartown-repeat-import-${Date.now()}-${++importSequence}.${extension}`;
  await new Promise<void>((resolve, reject) => {
    manager.writeFile({ filePath, data: base64, encoding: "base64", success: () => resolve(), fail: reject });
  });
  return filePath;
}

function dateStamp(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}
