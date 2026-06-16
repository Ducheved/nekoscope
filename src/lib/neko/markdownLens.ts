import type { MarkdownStats, OutlineItem } from "./types";

const headingPattern = /^(#{1,6})\s+(.+)$/gm;
const wikiPattern = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;
const markdownLinkPattern = /\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)/g;

export async function renderMarkdown(source: string) {
  const [
    { default: rehypeKatex },
    { default: rehypeSanitize },
    { default: rehypeStringify },
    { default: remarkFrontmatter },
    { default: remarkGfm },
    { default: remarkMath },
    { default: remarkParse },
    { default: remarkRehype },
    { unified },
  ] = await Promise.all([
    import("rehype-katex"),
    import("rehype-sanitize"),
    import("rehype-stringify"),
    import("remark-frontmatter"),
    import("remark-gfm"),
    import("remark-math"),
    import("remark-parse"),
    import("remark-rehype"),
    import("unified"),
  ]);
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(source);
  return String(file);
}

export function extractOutline(source: string): OutlineItem[] {
  const items: OutlineItem[] = [];
  for (const match of source.matchAll(headingPattern)) {
    const text = cleanHeading(match[2]);
    const before = source.slice(0, match.index ?? 0);
    items.push({
      id: headingId(text),
      text,
      level: match[1].length,
      line: before.split("\n").length,
    });
  }
  return items;
}

export function extractWikiLinks(source: string) {
  return Array.from(source.matchAll(wikiPattern)).map((match) =>
    match[1].trim(),
  );
}

export function extractStandardLinks(source: string) {
  return Array.from(source.matchAll(markdownLinkPattern))
    .map((match) => match[1].trim())
    .filter(
      (target) =>
        !target.startsWith("http://") && !target.startsWith("https://"),
    );
}

export function markdownStats(source: string): MarkdownStats {
  const words = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    words,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
    headings: extractOutline(source).length,
  };
}

export function headingId(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

function cleanHeading(value: string) {
  return value.replace(/\s+#*$/, "").trim();
}
