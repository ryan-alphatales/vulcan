import { describe, expect, it } from "vitest";

import { normalizeFindingLocations } from "../server/scans/finding-normalization";

const finding = { title: "Risk", severity: "high" as const, confidence: 92, explanation: "Plain explanation.", suggestedFix: "Specific fix.", riskHighlights: [] };

describe("finding location normalization", () => {
  it("preserves a location contained in a changed-code block", () => {
    const result = normalizeFindingLocations([{ ...finding, filePath: "src/auth.ts", startLine: 10, endLine: 11 }], [{ filePath: "src/auth.ts", startLine: 8, endLine: 12, changeType: "modified", content: "source" }]);
    expect(result[0]).toMatchObject({ filePath: "src/auth.ts", startLine: 10, endLine: 11 });
  });

  it("removes a location that is missing, outside the change, or on another file", () => {
    const blocks = [{ filePath: "src/auth.ts", startLine: 8, endLine: 12, changeType: "modified" as const, content: "source" }];
    expect(normalizeFindingLocations([{ ...finding, filePath: "src/other.ts", startLine: 10 }, { ...finding, filePath: "src/auth.ts", startLine: 99 }, finding], blocks)).toEqual([
      { ...finding, filePath: undefined, startLine: undefined, endLine: undefined },
      { ...finding, filePath: undefined, startLine: undefined, endLine: undefined },
      { ...finding, filePath: undefined, startLine: undefined, endLine: undefined },
    ]);
  });
});
