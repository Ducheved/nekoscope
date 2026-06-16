export const ideOptions = [
  "system",
  "code",
  "cursor",
  "sublime",
  "zed",
  "custom",
] as const;

export function buildIdeRequest(
  path: string,
  ide = "system",
  line?: number,
  customCommand?: string,
) {
  return {
    path,
    ide,
    line,
    customCommand,
  };
}
