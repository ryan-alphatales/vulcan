import { describe, expect, it } from "vitest";

import { authOptions } from "@/server/auth/options";

describe("Auth.js session callback", () => {
  it("exposes the account id from the JWT subject to protected routes", async () => {
    const callback = authOptions.callbacks?.session;
    if (!callback) throw new Error("Expected an Auth.js session callback.");

    const session = await callback({
      session: { user: { name: "Vulcan User", email: "user@example.test", image: null }, expires: "2099-01-01" },
      token: { sub: "account_123" },
    } as never);

    expect((session.user as { id?: string } | undefined)?.id).toBe("account_123");
  });
});
