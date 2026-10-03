import { stopAudio } from "@/services/audioService";
import { backTo } from "@/services/navigationService";
export function backToAdventure() { stopAudio(); backTo("/pkg-adventure/index/index"); }
