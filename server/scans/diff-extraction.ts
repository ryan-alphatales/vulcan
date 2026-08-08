export type ChangedCodeBlock = {
  filePath: string;
  startLine: number;
  endLine: number;
  changeType: "added" | "modified";
  content: string;
};

export type DiffExtractionResult =
  | { kind: "success"; blocks: ChangedCodeBlock[]; unsupportedFiles: string[] }
  | { kind: "empty"; unsupportedFiles: string[] }
  | { kind: "failure"; reason: "unavailable" | "invalid_diff" };

/**
 * Isolates added lines from a unified diff without altering their source text.
 * Deleted and unchanged context are intentionally excluded from scan input.
 */
export function extractChangedCode(unifiedDiff: string | null): DiffExtractionResult {
  if (unifiedDiff === null) return { kind: "failure", reason: "unavailable" };
  if (!unifiedDiff) return { kind: "empty", unsupportedFiles: [] };

  const blocks: ChangedCodeBlock[] = [];
  const unsupportedFiles: string[] = [];
  let currentPath: string | undefined;
  let currentChangeType: "added" | "modified" = "modified";
  let sawDiffHeader = false;
  let newLine = 0;
  let blockStart: number | undefined;
  let blockLines: string[] = [];

  const flush = () => {
    if (currentPath && blockStart !== undefined && blockLines.length > 0) {
      blocks.push({
        filePath: currentPath,
        startLine: blockStart,
        endLine: blockStart + blockLines.length - 1,
        changeType: currentChangeType,
        content: blockLines.join("\n"),
      });
    }
    blockStart = undefined;
    blockLines = [];
  };

  for (const line of unifiedDiff.split("\n")) {
    if (line.startsWith("diff --git ")) {
      flush();
      sawDiffHeader = true;
      currentPath = undefined;
      currentChangeType = "modified";
      continue;
    }
    if (line.startsWith("new file mode ")) {
      currentChangeType = "added";
      continue;
    }
    if (line.startsWith("+++ ")) {
      flush();
      const candidate = line.slice(4);
      currentPath = candidate === "/dev/null" ? undefined : candidate.replace(/^b\//, "");
      continue;
    }
    if (line.startsWith("Binary files ") || line.startsWith("GIT binary patch")) {
      flush();
      if (currentPath) unsupportedFiles.push(currentPath);
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
    if (hunk) {
      flush();
      newLine = Number(hunk[1]);
      continue;
    }
    if (!currentPath || newLine === 0 || line.startsWith("\\ No newline")) continue;
    if (line.startsWith("+")) {
      if (blockStart === undefined) blockStart = newLine;
      blockLines.push(line.slice(1));
      newLine += 1;
      continue;
    }
    flush();
    if (!line.startsWith("-")) newLine += 1;
  }
  flush();
  if (!sawDiffHeader) return { kind: "failure", reason: "invalid_diff" };
  return blocks.length > 0 ? { kind: "success", blocks, unsupportedFiles } : { kind: "empty", unsupportedFiles };
}
