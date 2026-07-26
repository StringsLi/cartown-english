type TopicIconFolder = "vehicles" | "maps" | "flags";

const topicIconModules = import.meta.glob("../../static/topic-icons/**/*.{png,svg}", {
  eager: true,
  import: "default"
}) as Record<string, string>;

function topicIcon(folder: TopicIconFolder, name: string, extension = "png") {
  const modulePath = `../../static/topic-icons/${folder}/${name}.${extension}`;
  return topicIconModules[modulePath] ?? `/static/topic-icons/${folder}/${name}.${extension}`;
}

export const vehicleIcon = (name: string) => topicIcon("vehicles", name);
export const mapIcon = (name: string) => topicIcon("maps", name);
export const flagIcon = (name: string) => topicIcon("flags", name, "svg");
