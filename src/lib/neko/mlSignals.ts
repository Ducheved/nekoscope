import type { MlSummary } from "./types";

export function extractMlSummary(path: string, content: string): MlSummary {
  const lower = path.toLowerCase();
  if (lower.endsWith("metrics.json")) return metricsSummary(content);
  if (lower.endsWith(".ipynb")) return notebookSummary(content);
  if (lower.endsWith("model_card.md") || lower.endsWith("dataset_card.md"))
    return cardSummary(path, content);
  return {
    documentType: "ml-signal",
    metrics: [],
    signals: findEntrypoints(content),
  };
}

function metricsSummary(content: string): MlSummary {
  const parsed = JSON.parse(content);
  const metrics = Object.entries(parsed)
    .filter(([, value]) =>
      ["number", "string", "boolean"].includes(typeof value),
    )
    .map(([name, value]) => ({ name, value: String(value) }));
  return {
    documentType: "metrics",
    title: "Metrics",
    metrics,
    signals: [],
  };
}

function notebookSummary(content: string): MlSummary {
  const parsed = JSON.parse(content);
  return {
    documentType: "notebook",
    title: "Notebook",
    metrics: [],
    signals: [`cells: ${parsed.cells?.length ?? 0}`],
  };
}

function cardSummary(path: string, content: string): MlSummary {
  const title = content
    .split("\n")
    .find((line) => line.startsWith("# "))
    ?.slice(2);
  return {
    documentType: path.toLowerCase().includes("dataset")
      ? "dataset-card"
      : "model-card",
    title,
    metrics: [],
    signals: findEntrypoints(content),
  };
}

function findEntrypoints(content: string) {
  return ["train.py", "predict.py", "inference.py", "serve.py"]
    .filter((name) => content.includes(name))
    .map((name) => `entrypoint: ${name}`);
}
