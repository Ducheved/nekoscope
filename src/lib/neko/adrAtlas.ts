export interface AdrRecord {
  path: string;
  title: string;
  status: string;
  date: string;
  sections: string[];
}

export function parseAdr(path: string, content: string): AdrRecord {
  const lines = content.split("\n");
  const title =
    lines
      .find((line) => line.startsWith("# "))
      ?.slice(2)
      .trim() ?? path;
  const status =
    findField(lines, "status") ??
    findSectionText(content, "Status") ??
    "unknown";
  const date = findField(lines, "date") ?? "unknown";
  const sections = lines
    .filter((line) => /^#{2,3}\s+/.test(line))
    .map((line) => line.replace(/^#{2,3}\s+/, "").trim());
  return { path, title, status, date, sections };
}

export function isAdr(path: string) {
  const lower = path.toLowerCase();
  return (
    lower.includes("/adr/") ||
    /^\d{4}-.+\.md$/.test(lower.split("/").pop() ?? "")
  );
}

function findField(lines: string[], name: string) {
  const prefix = `${name}:`;
  return lines
    .find((line) => line.toLowerCase().startsWith(prefix))
    ?.slice(prefix.length)
    .trim();
}

function findSectionText(content: string, section: string) {
  const pattern = new RegExp(
    `^##\\s+${section}\\s*$([\\s\\S]*?)(^##\\s+|\\z)`,
    "im",
  );
  return content.match(pattern)?.[1]?.trim();
}
