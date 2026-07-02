type TopicIconFolder = "vehicles" | "maps" | "flags";

const topicIconModules = import.meta.glob("../../static/topic-icons/**/*.png", {
  eager: true,
  import: "default"
}) as Record<string, string>;

function topicIcon(folder: TopicIconFolder, name: string) {
  const modulePath = `../../static/topic-icons/${folder}/${name}.png`;
  return topicIconModules[modulePath] ?? `/static/topic-icons/${folder}/${name}.png`;
}

export const vehicleIcon = (name: string) => topicIcon("vehicles", name);
export const mapIcon = (name: string) => topicIcon("maps", name);
export const flagIcon = (name: string) => topicIcon("flags", name);
