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

export function recordExportDetails(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "errMsg" in error) return String(error.errMsg);
  return typeof error === "string" ? error : "";
}
export function recordExportError(error: unknown): string {
  const message = recordExportDetails(error);
  if (/cancel/i.test(message)) return "已取消，可以随时再导出";
  if (/gesture|user.*tap|user.*click|user.*touch/i.test(message)) return "请再次点击发送按钮，打开微信聊天选择界面";
  if (/no space|disk full|quota|limit exceeded/i.test(message)) return "设备文件空间不足，请腾出空间后重新导出";
  if (/no such file|not exist|file.*not found/i.test(message)) return "文件已失效，请重新点“导出音频”准备文件";
  if (/开发者工具.*不支持/.test(message)) return "开发者工具无法发送文件，请用手机微信扫码验证导出";
  if (/not support|not implemented|不支持/i.test(message)) return "当前微信环境不支持发送文件，请在手机上更新微信后重试";
  return error instanceof Error ? error.message : "文件导出失败，请查看下方原因后重试";
}
