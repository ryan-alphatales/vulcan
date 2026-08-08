import { describe, expect, it, vi } from "vitest";

describe("OAuth state", () => {
  it("binds provider authorization state to one account and expires it", async () => {
    vi.stubEnv("NEXTAUTH_SECRET", "a-long-local-test-secret-that-is-not-production");
    const { createOAuthState, verifyOAuthState } = await import("../server/integrations/oauth-state");
    const state = createOAuthState("account_1", "github", 1_000);
    expect(verifyOAuthState(state, 2_000)).toMatchObject({ accountId: "account_1", provider: "github" });
    expect(verifyOAuthState(state, 1_000 + 10 * 60 * 1000 + 1)).toBeNull();
    expect(verifyOAuthState(`${state}tampered`, 2_000)).toBeNull();
  });
});
