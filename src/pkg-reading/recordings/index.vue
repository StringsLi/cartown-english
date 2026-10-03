<template>
  <view class="page recordings-page">
    <text class="section-kicker">LITTLE VOICES, BIG MEMORIES</text>
    <text class="page-title">孩子的录音小册</text>
    <text class="page-subtitle">把勇敢开口的声音，留作成长纪念。</text>
    <view class="soft-card archive-card">
      <text class="card-title">本机保存 {{ records.length }} 条录音</text>
      <text class="card-note">保留最近 12 条。单条导出为可播放音频，全部备份可导回小程序。</text>
      <view class="action-row"><BigButton label="备份全部录音" :disabled="busy || !records.length" @tap="prepareBackup" /><BigButton label="导入备份" variant="ghost" :disabled="busy" @tap="importBackup" /></view>
    </view>
    <view v-if="prepared" class="soft-card ready-card" role="status">
      <text class="card-title">{{ preparedTitle }}</text><text class="card-note">{{ preparedNote }}</text>
      <text class="file-name">{{ prepared.fileName }}</text>
      <!-- #ifdef MP-WEIXIN -->
      <text class="card-note">点下面的按钮，选择“文件传输助手”或自己的聊天；发送后可在聊天文件中收藏、下载到电脑保存。</text>
      <BigButton label="保存到微信文件 ›" variant="warm" :disabled="busy" @tap="saveFile" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <BigButton label="下载文件到设备 ↓" variant="warm" :disabled="busy" @tap="saveFile" />
      <!-- #endif -->
    </view>
    <view v-if="!records.length" class="soft-card empty-card"><text class="empty-icon">♫</text><text class="card-title">还没有录音小纪念</text><text class="card-note">读一本绘本，点“跟我读”，录完会自动保存到这里。</text><BigButton label="去选一本绘本 ›" variant="ghost" @tap="goBooks" /></view>
    <view v-for="(record,index) in records" :key="record.createdAt + ':' + index" class="soft-card record-card">
      <text class="record-index">{{ String(index + 1).padStart(2,'0') }} · {{ getBookById(record.bookId)?.title || '跟读练习' }}</text>
      <text class="record-sentence">{{ record.sentence }}</text>
      <text class="card-note">{{ record.createdAt }}{{ record.durationSeconds ? ` · ${record.durationSeconds} 秒` : '' }}</text>
      <view class="action-row"><BigButton label="听我的录音 ▶" variant="ghost" :disabled="busy" @tap="listen(record)" /><BigButton label="导出音频 ↓" :disabled="busy" @tap="prepareAudio(record)" /></view>
    </view>
    <text class="privacy-note">录音默认保存在这台设备，仅在你点击保存并选择接收方后分享。</text>
    <BigButton label="返回家长中心" variant="ghost" @tap="goParent" />
  </view>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { onShow, onHide, onUnload } from "@dcloudio/uni-app";
import BigButton from "@/components/BigButton.vue";
import { getBookById } from "@/services/bookService";
import { getRepeatRecords, mergeRepeatRecords, flushLearningState } from "@/services/progressService";
import type { RepeatRecord } from "@/types/book";
import { playRecord, stopRecordPlayback } from "@/pkg-reading/services/recordService";
import { stopAudio } from "@/services/audioService";
import { prepareRepeatRecordAudio, prepareRepeatRecordArchive, importRepeatRecordArchive } from "@/pkg-reading/services/recordArchiveService";
import { savePreparedRecord, releasePreparedRecord, recordExportError, type PreparedRecordFile } from "@/pkg-reading/services/recordExportService";
const records = ref(getRepeatRecords()), busy = ref(false), prepared = ref<PreparedRecordFile | null>(null);
const preparedTitle = ref(""), preparedNote = ref("");
onShow(() => { records.value = getRepeatRecords(); });
onHide(stopRecordPlayback); onUnload(() => { stopRecordPlayback(); releasePreparedRecord(prepared.value); });
function listen(record: RepeatRecord) { stopAudio(); playRecord(record.audioUrl); }
function setPrepared(file: PreparedRecordFile, title: string, note: string) {
  releasePreparedRecord(prepared.value); prepared.value = file; preparedTitle.value = title; preparedNote.value = note;
  uni.pageScrollTo({ scrollTop: 0, duration: 250 });
}
async function prepareAudio(record: RepeatRecord) {
  if (busy.value) return; busy.value = true; stopRecordPlayback();
  try { setPrepared(await prepareRepeatRecordAudio(record), "音频准备好了", "这是可单独播放的音频文件，点击下面的按钮完成保存。"); }
  catch (e) { uni.showToast({ title: recordExportError(e), icon: "none" }); }
  finally { busy.value = false; }
}
async function prepareBackup() {
  if (busy.value) return; busy.value = true; stopRecordPlayback();
  try { const file = await prepareRepeatRecordArchive(records.value); setPrepared(file, `${file.count} 条录音备份准备好了`, `${file.skipped ? `跳过 ${file.skipped} 条已失效录音。` : ''}JSON 备份用于导入恢复；想直接播放，请导出单条音频。`); }
  catch (e) { uni.showToast({ title: recordExportError(e), icon: "none" }); }
  finally { busy.value = false; }
}
async function saveFile() {
  if (!prepared.value || busy.value) return; busy.value = true;
  try { const result = await savePreparedRecord(prepared.value); uni.showToast({ title: result === "shared" ? "已发送到所选聊天" : "已请求下载，请查看浏览器下载", icon: "none" }); }
  catch (e) { uni.showToast({ title: recordExportError(e), icon: "none" }); }
  finally { busy.value = false; }
}
async function importBackup() {
  if (busy.value) return; busy.value = true; stopRecordPlayback();
  try { const archive = await importRepeatRecordArchive(); const result = mergeRepeatRecords(archive.records); flushLearningState(); records.value = getRepeatRecords(); uni.showModal({ title: "备份恢复完成", content: `新增 ${result.added} 条录音${archive.skipped ? `，跳过 ${archive.skipped} 条无效录音` : ''}。本机保留最近 12 条。`, showCancel: false }); }
  catch (e) { uni.showToast({ title: recordExportError(e), icon: "none" }); }
  finally { busy.value = false; }
}
function goBooks() { uni.reLaunch({ url: "/pages/books/index" }); }
function goParent() { uni.reLaunch({ url: "/pkg-user/parent/index" }); }
</script>
<style scoped lang="scss">
.recordings-page { padding-bottom: 52rpx; }.archive-card,.ready-card,.record-card,.empty-card { padding: 28rpx; margin-top: 24rpx; }.archive-card { background: #e8efe2; }.ready-card { background: #fff1da; }.card-title { display: block; font-size: 29rpx; font-weight: 900; line-height: 1.5; }.card-note { display: block; color: $color-muted; font-size: 23rpx; line-height: 1.6; margin: 12rpx 0; }.action-row { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14rpx; margin-top: 22rpx; }.action-row :deep(.big-button) { padding: 0 12rpx; font-size: 24rpx; }.record-index { font-size: 20rpx; color: $color-coral; font-weight: 800; }.record-sentence { display: block; font-size: 34rpx; font-weight: 800; line-height: 1.5; margin-top: 14rpx; word-break: break-word; }.file-name { display: block; font-size: 20rpx; color: $color-muted; word-break: break-all; margin-bottom: 20rpx; }.empty-card { text-align: center; }.empty-icon { display: block; font-size: 65rpx; color: #b69b73; margin-bottom: 20rpx; }.privacy-note { display: block; padding: 28rpx 10rpx; font-size: 21rpx; line-height: 1.6; text-align: center; color: $color-muted; }
</style>
