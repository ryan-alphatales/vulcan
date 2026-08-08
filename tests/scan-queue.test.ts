import { describe, expect, it } from "vitest";

import { SCAN_QUEUE_NAME } from "@/server/queue/scans";

describe("scan queue configuration", () => {
  it("uses a BullMQ-compatible queue name", () => {
    expect(SCAN_QUEUE_NAME).not.toContain(":");
  });
});
