let currentAudio: UniApp.InnerAudioContext | null = null;

export function playAudio(url?: string): void {
  if (!url) {
    uni.showToast({ title: "音频稍后补充", icon: "none" });
    return;
  }

  stopAudio();

  currentAudio = uni.createInnerAudioContext();
  currentAudio.src = url;
  currentAudio.autoplay = true;
  currentAudio.onError(() => {
    uni.showToast({ title: "音频素材稍后补充", icon: "none" });
  });
}

export function stopAudio(): void {
  if (!currentAudio) {
    return;
  }

  currentAudio.stop();
  currentAudio.destroy();
  currentAudio = null;
}

export function speakEnglish(text: string): void {
  if (!text) {
    return;
  }

  // #ifdef H5
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.82;
    utterance.pitch = 1.15;
    window.speechSynthesis.speak(utterance);
    return;
  }
  // #endif

  uni.showToast({ title: text, icon: "none" });
}
