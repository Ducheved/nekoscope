import YAML from "yaml";
import type { DevopsSummary } from "./types";

export function extractDevopsSummary(
  path: string,
  content: string,
): DevopsSummary {
  const lower = path.toLowerCase();
  if (lower.includes(".github/workflows/"))
    return summarizeGithubActions(content);
  if (
    lower.endsWith("docker-compose.yml") ||
    lower.endsWith("docker-compose.yaml")
  )
    return summarizeCompose(content);
  if (lower.endsWith(".yaml") || lower.endsWith(".yml"))
    return summarizeKubernetes(content);
  if (lower.endsWith(".tf")) return summarizeTerraform(content);
  return { documentType: "config", highlights: [], warnings: [] };
}

export function summarizeKubernetes(content: string): DevopsSummary {
  const parsed = YAML.parse(content) ?? {};
  const metadata = parsed.metadata ?? {};
  const highlights = [
    `kind: ${parsed.kind ?? "Kubernetes"}`,
    `name: ${metadata.name ?? "unnamed"}`,
    `namespace: ${metadata.namespace ?? "default"}`,
  ];
  const lower = content.toLowerCase();
  const warnings = [
    lower.includes(":latest") ? "image tag latest" : "",
    lower.includes("privileged: true") ? "privileged container" : "",
    lower.includes("resources:") ? "" : "missing resource requests or limits",
    lower.includes("hostpath:") ? "hostPath volume" : "",
    lower.includes("password:") || lower.includes("token:")
      ? "secret-looking value appears inline"
      : "",
  ].filter(Boolean);
  return {
    documentType: "kubernetes",
    title: metadata.name,
    highlights,
    warnings,
  };
}

export function summarizeGithubActions(content: string): DevopsSummary {
  const parsed = YAML.parse(content) ?? {};
  const jobs =
    parsed.jobs && typeof parsed.jobs === "object"
      ? Object.keys(parsed.jobs).length
      : 0;
  const lower = content.toLowerCase();
  const warnings = [
    lower.includes("contents: write") ||
    lower.includes("permissions: write-all")
      ? "broad write permissions"
      : "",
    lower.includes("pull_request_target") ? "pull_request_target trigger" : "",
    lower.includes("@master") ? "unpinned third-party action" : "",
  ].filter(Boolean);
  return {
    documentType: "github-actions",
    title: parsed.name,
    highlights: [
      `jobs: ${jobs}`,
      `triggers: ${JSON.stringify(parsed.on ?? {})}`,
    ],
    warnings,
  };
}

export function summarizeCompose(content: string): DevopsSummary {
  const parsed = YAML.parse(content) ?? {};
  const services =
    parsed.services && typeof parsed.services === "object"
      ? Object.keys(parsed.services).length
      : 0;
  const lower = content.toLowerCase();
  return {
    documentType: "docker-compose",
    highlights: [`services: ${services}`],
    warnings: [
      lower.includes("privileged: true") ? "privileged service" : "",
      lower.includes("restart: always") ? "always restart policy" : "",
    ].filter(Boolean),
  };
}

export function summarizeTerraform(content: string): DevopsSummary {
  return {
    documentType: "terraform",
    highlights: [
      `resources: ${count(content, 'resource "')}`,
      `modules: ${count(content, 'module "')}`,
    ],
    warnings: [],
  };
}

function count(content: string, needle: string) {
  return content.split(needle).length - 1;
}
