import { getRepeatRecords, mergeRepeatRecords } from "@/services/progressService";
import type { RepeatRecord } from "@/types/book";

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
  restored: number;
  skipped: number;
}

export async function exportRepeatRecordArchive(): Promise<number> {
  const records = getRepeatRecords().slice(0, MAX_ARCHIVE_RECORDS);
  const archive: RepeatArchive = {
    kind: "cartown-repeat-records",
    version: ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    records: await Promise.all(records.map(toArchiveRecord))
  };
  await saveMiniProgramArchive(JSON.stringify(archive, null, 2));
  return archive.records.length;
}

export async function importRepeatRecordArchive(): Promise<RecordArchiveResult> {
  return restoreArchive(await chooseArchiveFile());
}

export async function restoreArchive(content: string): Promise<RecordArchiveResult> {
  const archive = parseArchive(content);
  const restored: RepeatRecord[] = [];
  let skipped = 0;

  for (const record of archive.records.slice(0, MAX_ARCHIVE_RECORDS)) {
    const audioUrl = await restoreAudio(record.audio);
    if (!audioUrl || !record.bookId || !record.sentence || !record.createdAt) {
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

  const merged = mergeRepeatRecords(restored);
  return {
    total: archive.records.length,
    restored: merged.added,
    skipped: skipped + restored.length - merged.added
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
  if (audioUrl.startsWith("data:audio/")) return { encoding: "data-url", value: audioUrl };

  try {
    const base64 = await readMiniProgramFile(audioUrl, "base64");
    if (base64.length > MAX_AUDIO_BYTES * 1.4) return { encoding: "unavailable" };
    return { encoding: "base64", value: base64, mimeType: "audio/mpeg" };
  } catch {
    return { encoding: "unavailable" };
  }
}

async function restoreAudio(audio: ArchiveAudio): Promise<string | null> {
  if (audio.encoding === "data-url") {
    return audio.value.length <= MAX_AUDIO_BYTES * 1.5 ? audio.value : null;
  }
  if (audio.encoding === "base64" && audio.value.length <= MAX_AUDIO_BYTES * 1.4) {
    return writeMiniProgramAudio(audio.value);
  }
  return null;
}

function parseArchive(content: string): RepeatArchive {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("The backup file is not valid JSON.");
  }
  if (!isRepeatArchive(parsed)) throw new Error("This is not a supported recording backup.");
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
}

async function saveMiniProgramArchive(content: string): Promise<void> {
  const manager = uni.getFileSystemManager();
  const filePath = `${wx.env.USER_DATA_PATH}/cartown-repeat-records-${dateStamp()}.json`;

  await new Promise<void>((resolve, reject) => {
    manager.writeFile({ filePath, data: content, encoding: "utf8", success: () => resolve(), fail: reject });
  });
  await new Promise<void>((resolve) => {
    uni.openDocument({ filePath, showMenu: true, success: () => resolve(), fail: () => resolve() });
  });
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

async function writeMiniProgramAudio(base64: string): Promise<string> {
  const manager = uni.getFileSystemManager();
  const filePath = `${wx.env.USER_DATA_PATH}/cartown-repeat-import-${Date.now()}.mp3`;
  await new Promise<void>((resolve, reject) => {
    manager.writeFile({ filePath, data: base64, encoding: "base64", success: () => resolve(), fail: reject });
  });
  return filePath;
}

function dateStamp(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
}
