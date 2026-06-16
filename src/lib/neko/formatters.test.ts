import { describe, expect, it } from "vitest";
import { formatDocument, isOneLineJson } from "./formatters";

describe("formatters", () => {
  it("detects long one-line JSON", () => {
    const value = JSON.stringify({
      items: Array.from({ length: 40 }, (_, index) => ({ index })),
    });
    expect(isOneLineJson(value)).toBe(true);
  });

  it("formats JSON with stable indentation", () => {
    expect(formatDocument("config.json", '{"a":1,"b":{"c":2}}')).toBe(
      '{\n  "a": 1,\n  "b": {\n    "c": 2\n  }\n}\n',
    );
  });

  it("reports YAML parse errors", () => {
    expect(() => formatDocument("bad.yaml", "a: [")).toThrow();
  });
});
