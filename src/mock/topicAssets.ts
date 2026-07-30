import { highResolutionAsset } from "@/services/assetService";

type TopicIconFolder = "vehicles" | "maps" | "flags";

function topicIcon(folder: TopicIconFolder, name: string) {
  return highResolutionAsset(`/static/topic-icons/${folder}/${name}.webp`);
}

export const vehicleIcon = (name: string) => topicIcon("vehicles", name);
export const mapIcon = (name: string) => topicIcon("maps", name);
export const flagIcon = (name: string) => topicIcon("flags", name);