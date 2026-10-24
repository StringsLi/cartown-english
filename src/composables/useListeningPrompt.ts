import { computed, onBeforeUnmount, onDeactivated, ref } from "vue";
import { onHide, onUnload } from "@dcloudio/uni-app";
import { audioPlaybackState, getAudioVolume, playAudio, stopAudio } from "@/services/audioService";

/** Only successful, audible playback of this question opens its answers. */
export function useListeningPrompt() {
  const promptHeard = ref(false);
  const muted = ref(false);
  let generation = 0;

  function resetPrompt() {
    generation += 1;
    promptHeard.value = false;
    muted.value = false;
    stopAudio();
  }

  function playPromptAudio(url: string, label: string, onHeard?: () => void) {
    resetPrompt();
    const request = generation;
    muted.value = getAudioVolume() === 0;
    if (muted.value) return;
    playAudio(url, label, () => {
      if (request !== generation || promptHeard.value) return;
      muted.value = getAudioVolume() === 0;
      if (muted.value) return;
      promptHeard.value = true;
      onHeard?.();
    });
  }

  const promptHint = computed(() => {
    if (promptHeard.value) return "听到啦，现在可以选答案。";
    if (muted.value) return "声音现在是静音，请到家长中心打开音量后再听。";
    if (audioPlaybackState.value.phase === "error") return "声音没有播出来，点听音按钮再试一次。";
    if (audioPlaybackState.value.phase === "loading") return "声音正在准备，听到提示后再选。";
    return "先点听音按钮，听到英文提示后再选。";
  });

  onHide(resetPrompt);
  onUnload(resetPrompt);
  onBeforeUnmount(resetPrompt);
  onDeactivated(resetPrompt);
  return { promptHeard, promptHint, playPromptAudio, resetPrompt };
}
