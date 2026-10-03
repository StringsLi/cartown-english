export interface PreparedRecordFile { filePath: string; fileName: string }
let fileSequence = 0;
export function recordFileStamp(): string { return `${Date.now()}-${++fileSequence}`; }
declare const wx: typeof uni & { env: { USER_DATA_PATH: string }; shareFileMessage(options: { filePath: string; fileName: string; success(): void; fail(error: unknown): void }): void };

export async function prepareRecordFile(content: string, fileName: string, encoding: "utf8" | "base64", mimeType: string): Promise<PreparedRecordFile> {
  // #ifdef H5
  const bytes = encoding === "base64" ? Uint8Array.from(atob(content), c => c.charCodeAt(0)) : content;
  return { filePath: URL.createObjectURL(new Blob([bytes], { type: mimeType })), fileName };
  // #endif
  // #ifdef MP-WEIXIN
  const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
  await new Promise<void>((resolve, reject) => {
    wx.getFileSystemManager().writeFile({ filePath, data: content, encoding, success: () => resolve(), fail: reject });
  });
  return { filePath, fileName };
  // #endif
  throw new Error("请在微信小程序或网页中导出录音");
}

// 文件准备好后，由用户再次点击触发分享，避免异步文件读取消耗用户手势。
export function savePreparedRecord(file: PreparedRecordFile): Promise<"download-requested" | "shared"> {
  // #ifdef H5
  const link = document.createElement("a"); link.href = file.filePath; link.download = file.fileName;
  document.body.appendChild(link); link.click(); link.remove();
  return Promise.resolve("download-requested");
  // #endif
  // #ifdef MP-WEIXIN
  if (typeof wx.shareFileMessage !== "function") return Promise.reject(new Error("请更新微信后再导出文件"));
  return new Promise<"shared">((resolve, reject) => {
    wx.shareFileMessage({ filePath: file.filePath, fileName: file.fileName, success: () => resolve("shared"), fail: reject });
  });
  // #endif
  return Promise.reject(new Error("当前平台暂不支持导出"));
}

export function releasePreparedRecord(file?: PreparedRecordFile | null): void {
  if (!file) return;
  // #ifdef H5
  URL.revokeObjectURL(file.filePath);
  // #endif
  // #ifdef MP-WEIXIN
  wx.getFileSystemManager().unlink({ filePath: file.filePath, fail: () => {} });
  // #endif
}

export function recordExportError(error: unknown): string {
  const message = error && typeof error === "object" && "errMsg" in error ? String(error.errMsg) : "";
  if (/cancel/i.test(message)) return "已取消，可以随时再导出";
  return error instanceof Error ? error.message : "文件导出失败，请重试";
}
