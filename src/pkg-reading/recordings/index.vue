<template>
  <view class="page recordings-page">
    <text class="section-kicker">LITTLE VOICES, BIG MEMORIES</text>
    <text class="page-title">孩子的录音小册</text>
    <text class="page-subtitle">把勇敢开口的声音，留作成长纪念。</text>
    <view class="soft-card archive-card">
      <text class="card-title">本机保存 {{ records.length }} 条录音</text>
      <text class="card-note">保留最近 12 条。接近存满时，请先备份声音小纪念。</text>
      <text v-if="records.length >= 10" class="capacity-note">已保存 {{ records.length }} / 12 条，录新声音前可以先备份。</text>
      <view class="action-row"><BigButton label="备份全部录音" :disabled="busy || !records.length" @tap="prepareBackup" /><BigButton label="导入备份" variant="ghost" :disabled="busy" @tap="importBackup" /></view>
    </view>
    <view v-if="exportError" class="soft-card export-error" role="alert"><text class="card-title">{{ exportError }}</text><text v-if="exportDetail && exportDetail !== exportError" class="error-detail">微信返回：{{ exportDetail }}</text><text class="card-note">录音仍保留在本机，可以重试或先回听确认。</text></view>
    <text v-if="busy" class="working-note" role="status">正在处理文件，请稍等…</text>
    <view v-if="prepared" class="soft-card ready-card" role="status">
      <text class="card-title">{{ preparedTitle }}</text><text class="card-note">{{ preparedNote }}</text>
      <text class="export-step">{{ exportResult === 'shared' ? '✓ 已发送到所选聊天' : exportResult === 'download-requested' ? '请检查浏览器下载列表' : '第 2 / 2 步 · 文件准备好，点击下面发送' }}</text>
      <text class="file-name">{{ prepared.fileName }}</text>
      <!-- #ifdef MP-WEIXIN -->
      <text class="card-note">点下面的按钮，选择“文件传输助手”或自己的聊天；发送后可在聊天文件中收藏、下载到电脑保存。</text>
      <!-- uni-app 默认延迟 tap；同步执行才能保留微信文件分享要求的用户点击。 -->
      <button class="send-file-button" data-eventsync="true" :disabled="busy" @tap="saveFile">发送文件到微信聊天 ›</button>
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <BigButton label="下载文件到设备 ↓" variant="warm" :disabled="busy" @tap="saveFile" />
      <!-- #endif -->
    </view>
    <view v-if="!records.length" class="soft-card empty-card"><text class="empty-icon">♫</text><text class="card-title">还没有录音小纪念</text><text class="card-note">读一本绘本，点“跟我读”，录完会自动保存到这里。</text><BigButton label="去选一本绘本 ›" variant="ghost" @tap="goBooks" /></view>
    <view v-if="records.length" class="record-filter"><input v-model="search" aria-label="按句子查找录音" placeholder="按英文句子查找录音" /><scroll-view scroll-x class="book-filter"><button role="button" :aria-pressed="!selectedBook" :class="{'book-filter__active': !selectedBook}" @tap="selectedBook = ''">全部 {{ records.length }}</button><button role="button" v-for="choice in bookChoices" :key="choice.id" :aria-pressed="selectedBook === choice.id" :class="{'book-filter__active': selectedBook === choice.id}" @tap="selectedBook = choice.id">{{ choice.title }} · {{ choice.count }}</button></scroll-view><text class="card-note">找到 {{ visibleRecords.length }} 条声音小纪念</text></view>
    <view v-if="records.length && !visibleRecords.length" class="soft-card empty-card"><text class="card-title">换个句子找找看</text><BigButton label="显示全部录音" variant="ghost" @tap="search = ''; selectedBook = ''" /></view>
    <view v-for="(record,index) in visibleRecords" :key="record.createdAt + ':' + record.sentence" class="soft-card record-card">
      <text class="record-index">{{ String(index + 1).padStart(2,'0') }} · {{ getBookById(record.bookId)?.title || '跟读练习' }}</text>
      <text class="record-sentence">{{ record.sentence }}</text>
      <text class="card-note">{{ record.createdAt }}{{ record.durationSeconds ? ` · ${record.durationSeconds} 秒` : '' }}</text>
      <view class="action-row"><BigButton label="听我的录音 ▶" variant="ghost" :disabled="busy" @tap="listen(record)" /><BigButton label="导出音频 ↓" :disabled="busy" @tap="prepareAudio(record)" /></view>
      <view v-if="recordPlaybackState.path === record.audioUrl" class="playback-note" role="status"><text>{{ playbackNote }}</text><button role="button" v-if="['loading','playing'].includes(recordPlaybackState.phase)" @tap="stopRecordPlayback">停止 ■</button></view>
      <button role="button" v-if="getBookById(record.bookId)" class="read-again" @tap="readAgain(record)">回绘本，再读这句 ›</button>
    </view>
    <text class="privacy-note">录音默认保存在这台设备，仅在你点击保存并选择接收方后分享。</text>
    <BigButton label="返回家长中心" variant="ghost" @tap="goParent" />
  </view>
</template>
<script setup lang="ts">
import { navigate } from "@/services/navigationService";
import { computed, ref } from "vue";
import { onShow, onHide, onUnload } from "@dcloudio/uni-app";
import BigButton from "@/components/BigButton.vue";
import { getBookById } from "@/services/bookService";
import { getRepeatRecords, mergeRepeatRecords, flushLearningState } from "@/services/progressService";
import type { RepeatRecord } from "@/types/book";
import { playRecord, stopRecordPlayback, recordPlaybackState } from "@/services/recordService";
import { stopAudio } from "@/services/audioService";
import { prepareRepeatRecordAudio, prepareRepeatRecordArchive, importRepeatRecordArchive } from "@/pkg-reading/services/recordArchiveService";
import { savePreparedRecord, releasePreparedRecord, recordExportError, recordExportDetails, type PreparedRecordFile } from "@/pkg-reading/services/recordExportService";
const records = ref(getRepeatRecords()), busy = ref(false), prepared = ref<PreparedRecordFile | null>(null);
const preparedTitle = ref(""), preparedNote = ref("");
const search = ref(""), selectedBook = ref(""), exportResult = ref("");
const exportError = ref(""), exportDetail = ref("");
let pageAlive = true;
function clearExportError() { exportError.value = ""; exportDetail.value = ""; }
function showExportError(error: unknown) {
  if (!pageAlive) return;
  exportError.value = recordExportError(error); exportDetail.value = recordExportDetails(error);
  uni.pageScrollTo({ scrollTop: 0, duration: 250 });
}
const visibleRecords = computed(() => records.value.filter(r => (!selectedBook.value || r.bookId === selectedBook.value) && r.sentence.toLowerCase().includes(search.value.trim().toLowerCase())));
const bookChoices = computed(() => [...new Set(records.value.map(r => r.bookId))].map(id => ({ id, title: getBookById(id)?.title || "其他跟读", count: records.value.filter(r => r.bookId === id).length })));
const playbackNote = computed(() => ({ idle: "", loading: "正在准备声音…", playing: "正在播放这段声音 ♪", ended: "听完啦，可以再听一次。", error: "声音暂时播放不了，可以重试；文件缺失时可从备份恢复。" })[recordPlaybackState.value.phase]);
onShow(() => { records.value = getRepeatRecords(); });
onHide(stopRecordPlayback); onUnload(() => { pageAlive = false; stopRecordPlayback(); releasePreparedRecord(prepared.value); });
function listen(record: RepeatRecord) { stopAudio(); playRecord(record.audioUrl); }
function setPrepared(file: PreparedRecordFile, title: string, note: string) {
  if (!pageAlive) { releasePreparedRecord(file); return; }
  releasePreparedRecord(prepared.value); prepared.value = file; preparedTitle.value = title; preparedNote.value = note;
  uni.pageScrollTo({ scrollTop: 0, duration: 250 });
}
function clearPrepared() { releasePreparedRecord(prepared.value); prepared.value = null; exportResult.value = ""; clearExportError(); }
async function prepareAudio(record: RepeatRecord) {
  if (busy.value) return; busy.value = true; stopRecordPlayback(); clearPrepared();
  try { setPrepared(await prepareRepeatRecordAudio(record), "音频准备好了", "这是可单独播放的音频文件，点击下面的按钮完成保存。"); }
  catch (e) { showExportError(e); }
  finally { busy.value = false; }
}
async function prepareBackup() {
  if (busy.value) return; busy.value = true; stopRecordPlayback(); clearPrepared();
  try { const file = await prepareRepeatRecordArchive(records.value); setPrepared(file, `${file.count} 条录音备份准备好了`, `${file.skipped ? `跳过 ${file.skipped} 条已失效录音。` : ''}JSON 备份用于导入恢复；想直接播放，请导出单条音频。`); }
  catch (e) { showExportError(e); }
  finally { busy.value = false; }
}
async function saveFile() {
  if (!prepared.value || busy.value) return; clearExportError(); busy.value = true;
  try { const result = await savePreparedRecord(prepared.value); exportResult.value = result; if (result === "download-requested") preparedNote.value = "下载已请求，请检查浏览器下载列表。没有下载提示时，可在普通浏览器中打开后再试。"; uni.showToast({ title: result === "shared" ? "已发送到所选聊天" : "已请求下载，请查看浏览器下载", icon: "none" }); }
  catch (e) { showExportError(e); }
  finally { busy.value = false; }
}
async function importBackup() {
  if (busy.value) return; clearExportError(); busy.value = true; stopRecordPlayback();
  try { const archive = await importRepeatRecordArchive(records.value); const result = mergeRepeatRecords(archive.records, true); flushLearningState(); records.value = getRepeatRecords(); if (pageAlive) uni.showModal({ title: "备份恢复完成", content: [`新增 ${result.added} 条录音`, result.repaired ? `修复 ${result.repaired} 条失效录音` : '', archive.duplicates ? `${archive.duplicates} 条已在本机，无需重复保存` : '', archive.skipped ? `跳过 ${archive.skipped} 条无效录音` : '', archive.limited ? `备份超出 12 条，另有 ${archive.limited} 条未处理` : ''].filter(Boolean).join('；') + '。本机保留最近 12 条。', showCancel: false }); }
  catch (e) { showExportError(e); }
  finally { busy.value = false; }
}
function goBooks() { navigate({ url: "/pages/books/index" }, "reLaunch"); }
function goParent() { navigate({ url: "/pkg-user/parent/index" }, "reLaunch"); }
function readAgain(record: RepeatRecord) { stopRecordPlayback(); navigate({ url: `/pkg-reading/repeat/index?bookId=${encodeURIComponent(record.bookId)}&sentence=${encodeURIComponent(record.sentence)}` }); }
</script>
<style scoped lang="scss">
.recordings-page { padding-bottom: 52rpx; }.archive-card,.ready-card,.record-card,.empty-card { padding: 28rpx; margin-top: 24rpx; }.archive-card { background: #e8efe2; }.ready-card { background: #fff1da; }.card-title { display: block; font-size: 29rpx; font-weight: 900; line-height: 1.5; }.card-note { display: block; color: $color-muted; font-size: 23rpx; line-height: 1.6; margin: 12rpx 0; }.action-row { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 14rpx; margin-top: 22rpx; }.action-row :deep(.big-button) { padding: 0 12rpx; font-size: 24rpx; }.record-index { font-size: 20rpx; color: $color-coral; font-weight: 800; }.record-sentence { display: block; font-size: 34rpx; font-weight: 800; line-height: 1.5; margin-top: 14rpx; word-break: break-word; }.file-name { display: block; font-size: 20rpx; color: $color-muted; word-break: break-all; margin-bottom: 20rpx; }.empty-card { text-align: center; }.empty-icon { display: block; font-size: 65rpx; color: #b69b73; margin-bottom: 20rpx; }.privacy-note { display: block; padding: 28rpx 10rpx; font-size: 21rpx; line-height: 1.6; text-align: center; color: $color-muted; }
</style>
<style scoped lang="scss">
.capacity-note,.working-note,.export-step { display: block; font-size: 22rpx; line-height: 1.6; color: #a66e30; margin: 14rpx 0; }.working-note { text-align: center; }.record-filter { margin-top: 28rpx; }.record-filter input { height: 86rpx; padding: 0 24rpx; border-radius: 22rpx; border: 1rpx solid #e5dfd4; background: #fffdf9; font-size: 25rpx; }.book-filter { white-space: nowrap; margin-top: 16rpx; }.book-filter button { display: inline-flex; align-items: center; min-height: 80rpx; padding: 0 24rpx; margin-right: 12rpx; font-size: 23rpx; color: #8a7e6b; background: #efeade; border-radius: 24rpx; }.book-filter .book-filter__active { background: #36554c; color: white; }.playback-note { display: flex; align-items: center; justify-content: space-between; gap: 14rpx; padding: 20rpx 0 0; color: #74836f; font-size: 23rpx; line-height: 1.5; }.playback-note text { flex: 1; }.playback-note button { flex: none; min-height: 76rpx; padding: 16rpx 20rpx; background: #e8eee1; border-radius: 20rpx; }.read-again { display: block; margin-top: 20rpx; padding: 18rpx 0; font-size: 22rpx; color: #95866f; }
</style>

<style scoped lang="scss">
.send-file-button { display: flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 30rpx; border-radius: 999rpx; background: #c48a28; color: white; font-size: 16px; font-weight: 800; }
.send-file-button[disabled] { opacity: .55; }.export-error { padding: 28rpx; margin-top: 24rpx; background: #fff1e9; }.error-detail { display: block; margin-top: 14rpx; font-size: 22rpx; line-height: 1.6; word-break: break-all; color: #985239; }
</style>
