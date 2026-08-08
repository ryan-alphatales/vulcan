import { afterEach, describe, expect, it } from "vitest";

import { createAuthorizationUrl } from "@/server/integrations/oauth";

const originalEnvironment = {
  APP_URL: process.env.APP_URL,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
};

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe("GitHub OAuth authorization", () => {
  it("requests the scopes needed for webhook installation and PR feedback", () => {
    Object.assign(process.env, {
      APP_URL: "https://vulcan.example.test",
      GITHUB_CLIENT_ID: "client-id",
      GITHUB_CLIENT_SECRET: "client-secret",
    });

    const url = createAuthorizationUrl("github", "state-value");

    expect(url.searchParams.get("scope")?.split(" ")).toEqual(["read:user", "repo", "admin:repo_hook"]);
  });
});
