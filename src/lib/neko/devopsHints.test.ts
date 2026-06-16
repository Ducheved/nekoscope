import { describe, expect, it } from "vitest";
import { summarizeGithubActions, summarizeKubernetes } from "./devopsHints";

describe("devopsHints", () => {
  it("summarizes Kubernetes metadata and safety hints", () => {
    const summary = summarizeKubernetes(
      "kind: Deployment\nmetadata:\n  name: app\nspec: {}\n",
    );
    expect(summary.documentType).toBe("kubernetes");
    expect(summary.highlights).toContain("name: app");
    expect(summary.warnings).toContain("missing resource requests or limits");
  });

  it("summarizes GitHub Actions jobs and permissions", () => {
    const summary = summarizeGithubActions(
      "name: CI\non: push\npermissions:\n  contents: write\njobs:\n  test:\n    runs-on: ubuntu-latest\n",
    );
    expect(summary.documentType).toBe("github-actions");
    expect(summary.highlights).toContain("jobs: 1");
    expect(summary.warnings).toContain("broad write permissions");
  });
});
