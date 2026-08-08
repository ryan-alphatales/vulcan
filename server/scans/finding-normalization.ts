import type { ChangedCodeBlock } from "@/server/scans/diff-extraction";
import type { PersistedFinding } from "@/server/scans/execution";

/** Removes an AI-supplied location unless it is a real changed-code location. */
export function normalizeFindingLocations(findings: PersistedFinding[], blocks: ChangedCodeBlock[]): PersistedFinding[] {
  return findings.map((finding) => {
    if (!finding.filePath || !finding.startLine) return { ...finding, filePath: undefined, startLine: undefined, endLine: undefined };
    const endLine = finding.endLine ?? finding.startLine;
    const matchingBlock = blocks.find((block) => block.filePath === finding.filePath && finding.startLine! >= block.startLine && endLine <= block.endLine);
    return matchingBlock ? { ...finding, endLine } : { ...finding, filePath: undefined, startLine: undefined, endLine: undefined };
  });
}
