import type { MarkdownStats, OutlineItem } from "./types";
import { renderMermaidSvg } from "./diagramGarden";

const headingPattern = /^(#{1,6})\s+(.+)$/gm;
const fencePattern = /```([^\n`]*)\n([\s\S]*?)```/g;
const manifestLanguages = new Set([
  "yaml",
  "yml",
  "k8s",
  "kubernetes",
  "helm",
  "argocd",
  "argo",
  "flux",
  "cilium",
]);

export async function renderMarkdown(source: string) {
  const masked = maskFencedBlocks(source);
  const [
    { default: rehypeKatex },
    { default: rehypeSanitize, defaultSchema },
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
  const schema = {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      div: [
        ...(defaultSchema.attributes?.div ?? []),
        ["className", "math", "math-display"],
      ],
      span: [
        ...(defaultSchema.attributes?.span ?? []),
        ["className", "math", "math-inline"],
      ],
    },
  } as typeof defaultSchema;
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkFrontmatter, ["yaml", "toml"])
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize, schema)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(masked.source);
  return await restoreFencedBlocks(addHeadingIds(String(file)), masked.blocks);
}

export function extractOutline(source: string): OutlineItem[] {
  const items: OutlineItem[] = [];
  const seen = new Map<string, number>();
  for (const match of withoutFences(source).matchAll(headingPattern)) {
    const text = plainHeading(match[2]);
    const before = source.slice(0, match.index ?? 0);
    items.push({
      id: uniqueId(headingId(text), seen),
      text,
      level: match[1].length,
      line: before.split("\n").length,
    });
  }
  return items;
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

function uniqueId(base: string, seen: Map<string, number>) {
  const safe = base || "section";
  const count = seen.get(safe) ?? 0;
  seen.set(safe, count + 1);
  return count === 0 ? safe : `${safe}-${count}`;
}

function withoutFences(source: string) {
  return source.replace(fencePattern, (match) => match.replace(/[^\n]/g, " "));
}

function plainHeading(value: string) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[*_~]+/g, "")
    .replace(/\s+#*\s*$/, "")
    .trim();
}

interface MaskedBlock {
  token: string;
  language: string;
  source: string;
  line: number;
  diagram: boolean;
}

function maskFencedBlocks(source: string) {
  const blocks: MaskedBlock[] = [];
  const masked = source.replace(
    fencePattern,
    (match, rawLanguage: string, blockSource: string, offset: number) => {
      const language = rawLanguage.trim().split(/\s+/)[0].toLowerCase();
      if (!language) return match;
      const token = `NEKOSCOPEFENCE${blocks.length}END`;
      blocks.push({
        token,
        language,
        source: blockSource.replace(/\n$/, ""),
        line: source.slice(0, offset).split("\n").length,
        diagram: language === "mermaid",
      });
      return `\n${token}\n`;
    },
  );
  return { source: masked, blocks };
}

async function restoreFencedBlocks(html: string, blocks: MaskedBlock[]) {
  let restored = html;
  for (const [index, block] of blocks.entries()) {
    const replacement = block.diagram
      ? await renderDiagramBlock(block, index)
      : renderCodeBlock(block);
    restored = restored.replace(
      new RegExp(`<p>${block.token}</p>|${block.token}`, "g"),
      () => replacement,
    );
  }
  return restored;
}

async function renderDiagramBlock(block: MaskedBlock, index: number) {
  let svg = "";
  let error = "";
  try {
    svg = await renderMermaidSvg(
      block.source,
      `nekoscope-mermaid-${block.line}-${index}`,
    );
  } catch (caught) {
    error =
      caught instanceof Error
        ? caught.message
        : "Diagram could not be rendered";
  }
  if (error) {
    return `<figure class="neko-diagram-card" data-language="mermaid"><figcaption><span>mermaid</span><small>line ${block.line}</small></figcaption><p class="neko-diagram-error">${escapeHtml(error)}</p>${renderCodeBlock(block)}</figure>`;
  }
  return `<figure class="neko-diagram-card" data-language="mermaid"><figcaption><span>mermaid</span><small>line ${block.line}</small></figcaption><div class="neko-diagram-stage">${svg}</div><details><summary>source</summary>${renderCodeBlock(block)}</details></figure>`;
}

function renderCodeBlock(block: Pick<MaskedBlock, "language" | "source">) {
  const language = block.language || "text";
  return `<figure class="neko-code-card" data-language="${escapeHtml(language)}"><figcaption><span>${escapeHtml(language)}</span><button type="button" class="neko-copy" data-copy aria-label="Copy code">copy</button></figcaption><pre><code>${highlightSource(block.source, language)}</code></pre></figure>`;
}

function addHeadingIds(html: string) {
  const seen = new Map<string, number>();
  return html.replace(
    /<h([1-6])>([\s\S]*?)<\/h\1>/g,
    (_match, level: string, body: string) => {
      const text = decodeHtml(body.replace(/<[^>]+>/g, ""));
      return `<h${level} id="${uniqueId(headingId(text), seen)}">${body}</h${level}>`;
    },
  );
}

export function highlightSource(source: string, language: string) {
  const escaped = escapeHtml(source);
  const normalized = language.toLowerCase();
  if (["json", "jsonc"].includes(normalized)) {
    return escaped
      .replace(
        /(&quot;[^&]*?&quot;)(\s*:)/g,
        '<span class="tok-key">$1</span>$2',
      )
      .replace(
        /(:\s*)(&quot;[^&]*?&quot;)/g,
        '$1<span class="tok-string">$2</span>',
      )
      .replace(/\b(true|false|null)\b/g, '<span class="tok-constant">$1</span>')
      .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="tok-number">$1</span>');
  }
  if (
    manifestLanguages.has(normalized) ||
    ["toml", "env", "ini"].includes(normalized)
  ) {
    const highlighted = escaped
      .replace(/^(\s*[\w.-]+)(\s*[:=])/gm, '<span class="tok-key">$1</span>$2')
      .replace(/(&quot;.*?&quot;|'.*?')/g, '<span class="tok-string">$1</span>')
      .replace(/(#.*)$/gm, '<span class="tok-comment">$1</span>');
    if (!manifestLanguages.has(normalized)) return highlighted;
    return highlightManifestTokens(highlighted);
  }
  if (
    [
      "ts",
      "tsx",
      "js",
      "jsx",
      "svelte",
      "rust",
      "rs",
      "go",
      "py",
      "python",
    ].includes(normalized)
  ) {
    return escaped
      .replace(
        /\b(const|let|var|function|return|import|export|from|async|await|type|interface|struct|enum|impl|pub|fn|use|mod|match|class|def|if|else|for|while|in)\b/g,
        '<span class="tok-keyword">$1</span>',
      )
      .replace(
        /(&quot;.*?&quot;|'.*?'|`.*?`)/g,
        '<span class="tok-string">$1</span>',
      )
      .replace(/((?:\/\/|#).*)$/gm, '<span class="tok-comment">$1</span>');
  }
  return escaped;
}

function highlightManifestTokens(value: string) {
  return value
    .replace(
      /\b(Deployment|StatefulSet|DaemonSet|Service|Ingress|Gateway|HTTPRoute|ConfigMap|Secret|Job|CronJob|Pod|Namespace|ServiceAccount|ClusterRole|ClusterRoleBinding|Application|HelmRelease|Kustomization|GitRepository)\b/g,
      '<span class="tok-resource">$1</span>',
    )
    .replace(
      /\b(apps\/v1|batch\/v1|networking\.k8s\.io\/v1|gateway\.networking\.k8s\.io\/v1)\b/g,
      '<span class="tok-api">$1</span>',
    )
    .replace(
      /\b(apiVersion|kind|metadata|spec|status|namespace|labels|annotations|selector|template|containers|image|resources|requests|limits|ports|env|volumeMounts|volumes|serviceAccountName)\b/g,
      '<span class="tok-manifest-key">$1</span>',
    );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeHtml(value: string) {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
