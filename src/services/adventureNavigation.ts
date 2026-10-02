import { stopAudio } from "@/services/audioService";
export function backToAdventure() {
  stopAudio();
  if (getCurrentPages().length > 1) uni.navigateBack();
  else uni.redirectTo({ url: "/pkg-adventure/index/index" });
}
