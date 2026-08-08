import OpenAI from "openai";
import { z } from "zod";

import type { ChangedCodeBlock } from "@/server/scans/diff-extraction";
import type { PersistedFinding, SecurityAnalyzer } from "@/server/scans/execution";
import { normalizeFindingLocations } from "@/server/scans/finding-normalization";
import { deepSeekModel, scanConfidenceThreshold } from "@/server/scans/settings";

const outputSchema = z.object({ findings: z.array(z.object({ title: z.string().min(1).max(240), severity: z.enum(["critical", "high", "medium", "low"]), confidence: z.number().int().min(0).max(100), explanation: z.string().min(1), suggestedFix: z.string().min(1), filePath: z.string().min(1).optional(), startLine: z.number().int().positive().optional(), endLine: z.number().int().positive().optional(), riskHighlights: z.array(z.string().min(1)).max(5) })).max(100) });

/** DeepSeek is used through its OpenAI-compatible Chat Completions interface. */
export class DeepSeekSecurityAnalyzer implements SecurityAnalyzer {
  async analyze(blocks: ChangedCodeBlock[]): Promise<PersistedFinding[]> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw Object.assign(new Error("DeepSeek is not configured."), { name: "AiServiceError" });
    try {
      const client = new OpenAI({ apiKey, baseURL: "https://api.deepseek.com" });
      const completion = await client.chat.completions.create({
        model: deepSeekModel(),
        messages: [
          {
            role: "system",
            content: "You are Vulcan's security-review engine. Analyze only the supplied changed code. Return only a JSON object matching exactly this contract: {\"findings\":[{\"title\":\"short issue name\",\"severity\":\"critical|high|medium|low\",\"confidence\":0,\"explanation\":\"plain-language security risk\",\"suggestedFix\":\"specific remediation\",\"filePath\":\"changed file path\",\"startLine\":1,\"endLine\":1,\"riskHighlights\":[\"short risk detail\"]}]}. Every finding must contain every listed field; confidence is an integer from 0 to 100. Do not use keys named risk, path, line, or fix. Return {\"findings\":[]} when there are no credible findings.",
          },
          { role: "user", content: JSON.stringify({ changedBlocks: blocks }) },
        ],
        response_format: { type: "json_object" },
      });
      const content = completion.choices[0]?.message.content;
      if (!content) throw new SyntaxError("DeepSeek returned no analysis content.");
      const parsed = outputSchema.parse(JSON.parse(content));
      const threshold = scanConfidenceThreshold();
      return normalizeFindingLocations(parsed.findings.filter((finding) => finding.confidence >= threshold), blocks);
    } catch (error) {
      if (error instanceof z.ZodError || error instanceof SyntaxError) throw Object.assign(new Error("The analysis response was invalid."), { name: "AiServiceError" });
      throw error;
    }
  }
}
