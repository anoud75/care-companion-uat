import { afterEach, describe, expect, it, vi } from "vitest";

import { buildGoogleSheetsSubmission, syncSubmissionToGoogleSheets } from "@/lib/google-sheets";

const session = {
  id: "e5df154a-3e8d-453b-bac4-2658ae297526",
  full_name: "Aisha Al Saud",
  email: "aisha@example.com",
  position: "Nurse",
  started_at: "2026-10-06T08:00:00.000Z",
  results: {
    "A-01": {
      result: "pass" as const,
      todo: [true, true],
      expect: [true, false],
      notes: "As expected",
    },
  },
  feedback: { overall: 5, clear: 4 },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Google Sheets submission payload", () => {
  it("creates one stable, complete row for every UAT step", () => {
    const payload = buildGoogleSheetsSubmission(session, "2026-10-06T09:00:00.000Z");

    expect(payload.submission).toMatchObject({
      id: "e5df154a-3e8d-453b-bac4-2658ae297526",
      overallRating: 5,
      instructionsClear: 4,
      dailyWorkEasier: null,
    });
    expect(payload.steps).toHaveLength(14);
    expect(payload.steps[0]).toMatchObject({
      submissionId: "e5df154a-3e8d-453b-bac4-2658ae297526",
      reference: "A-01",
      result: "pass",
      completedTodo: 2,
      confirmedExpectations: 1,
    });
    expect(payload.steps.at(-1)?.reference).toBe("F-11");
  });

  it("accepts the redirect that Google Apps Script returns after a successful POST", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 302 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      syncSubmissionToGoogleSheets(session, "2026-10-06T09:00:00.000Z"),
    ).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("script.google.com/macros/s/AKfycbyFpvE"),
      expect.objectContaining({ method: "POST", redirect: "manual" }),
    );
  });
});
