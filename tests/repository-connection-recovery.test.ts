import { describe, expect, it } from "vitest";

import {
  completedConnection,
  failedConnection,
  retryConnection,
} from "../lib/repository-connection";

describe("repository connection recovery", () => {
  it("keeps an OAuth failure incomplete and provides retry guidance", () => {
    const state = failedConnection("authorization");
    expect(state).toMatchObject({
      status: "incomplete",
      failure: { reason: "authorization", title: "Authorization was not completed" },
    });
  });

  it("explains repository access failures without claiming success", () => {
    const state = failedConnection("repository_access");
    expect(state).toMatchObject({
      status: "incomplete",
      failure: { reason: "repository_access", title: "Repository access is unavailable" },
    });
  });

  it("offers a recovery path when the specific failure reason is unavailable", () => {
    const state = failedConnection();
    expect(state).toMatchObject({
      status: "incomplete",
      failure: { reason: "unknown", description: expect.stringContaining("exact reason") },
    });
  });

  it("moves from incomplete to connecting when retried", () => {
    expect(retryConnection(failedConnection("authorization"))).toEqual({ status: "connecting" });
  });

  it("only marks the repository connected after a successful outcome", () => {
    expect(completedConnection("acme/vulcan")).toEqual({
      status: "connected",
      repositoryName: "acme/vulcan",
    });
  });
});
