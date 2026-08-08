import { describe, expect, it } from "vitest";

import { extractChangedCode } from "../server/scans/diff-extraction";

describe("changed-code extraction", () => {
  it("retains only added source lines with their original text and locations", () => {
    const result = extractChangedCode(`diff --git a/src/a.ts b/src/a.ts
index 123..456 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -1,3 +1,4 @@
 export const value = 1;
-const oldSecret = "old";
+const apiKey = "not-a-real-secret";
+export const next = value + 1;
 console.log(value);`);

    expect(result).toEqual({
      kind: "success",
      unsupportedFiles: [],
      blocks: [{
        filePath: "src/a.ts",
        startLine: 2,
        endLine: 3,
        changeType: "modified",
        content: 'const apiKey = "not-a-real-secret";\nexport const next = value + 1;',
      }],
    });
  });

  it("marks a new file as added and never includes deleted lines", () => {
    const result = extractChangedCode(`diff --git a/new.ts b/new.ts
new file mode 100644
--- /dev/null
+++ b/new.ts
@@ -0,0 +1,2 @@
+export const enabled = true;`);
    expect(result).toMatchObject({ kind: "success", blocks: [{ changeType: "added", content: "export const enabled = true;" }] });
  });

  it("distinguishes unavailable, invalid, and empty diffs", () => {
    expect(extractChangedCode(null)).toEqual({ kind: "failure", reason: "unavailable" });
    expect(extractChangedCode("not a unified diff")).toEqual({ kind: "failure", reason: "invalid_diff" });
    expect(extractChangedCode("diff --git a/readme.md b/readme.md\n--- a/readme.md\n+++ b/readme.md")).toEqual({ kind: "empty", unsupportedFiles: [] });
  });
});
