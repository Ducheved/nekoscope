export function parseDeepLink(url: string) {
  const parsed = new URL(url);
  return {
    action: parsed.hostname || parsed.pathname.replace("/", ""),
    path: parsed.searchParams.get("path") ?? "",
  };
}

export function cliUsage() {
  return [
    "nekoscope <file>",
    "nekoscope <folder>",
    "nekoscope <file> --line <n>",
    "nekoscope --ask <file>",
  ];
}
