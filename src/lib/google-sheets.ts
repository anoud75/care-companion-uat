import { STEPS, type Feedback, type StepRecord } from "./steps";

export const DEFAULT_GOOGLE_SHEETS_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbyFpvE-1Y0EDbdDSaaXZjTl8CrHPkXt1HzilK3cEtiqmWD6uOnsR_odSZh0ho8x1hfM/exec";

type GoogleSheetsSession = {
  id: string;
  full_name: string;
  email: string;
  position: string;
  started_at: string;
  results: Record<string, StepRecord>;
  feedback?: Feedback | null;
};

type GoogleSheetsSubmission = {
  action: "submitUatSession";
  schemaVersion: 1;
  submission: {
    id: string;
    fullName: string;
    email: string;
    position: string;
    startedAt: string;
    submittedAt: string;
    overallRating: number | null;
    instructionsClear: number | null;
    dailyWorkEasier: number | null;
    readyToGoLive: number | null;
    suggestedChanges: string;
    otherFeedback: string;
  };
  steps: Array<{
    submissionId: string;
    reference: string;
    area: string;
    priority: string;
    title: string;
    result: string;
    notes: string;
    raised: boolean;
    raisedItem: string;
    completedTodo: number;
    totalTodo: number;
    confirmedExpectations: number;
    totalExpectations: number;
  }>;
};

/**
 * Creates the stable payload consumed by docs/google-apps-script.gs.
 * The submission ID makes retries safe: the script updates existing rows rather
 * than adding duplicate tester submissions.
 */
export function buildGoogleSheetsSubmission(
  session: GoogleSheetsSession,
  submittedAt: string,
): GoogleSheetsSubmission {
  const feedback = session.feedback ?? {};

  return {
    action: "submitUatSession",
    schemaVersion: 1,
    submission: {
      id: session.id,
      fullName: session.full_name,
      email: session.email,
      position: session.position,
      startedAt: session.started_at,
      submittedAt,
      overallRating: feedback.overall ?? null,
      instructionsClear: feedback.clear ?? null,
      dailyWorkEasier: feedback.easier ?? null,
      readyToGoLive: feedback.ready ?? null,
      suggestedChanges: feedback.change ?? "",
      otherFeedback: feedback.other ?? "",
    },
    steps: STEPS.map((step) => {
      const record = session.results[step.ref] ?? {};
      return {
        submissionId: session.id,
        reference: step.ref,
        area: step.area,
        priority: step.priority,
        title: step.title,
        result: record.result ?? "",
        notes: record.notes ?? "",
        raised: Boolean(record.raise),
        raisedItem: record.raiseText ?? "",
        completedTodo: record.todo?.filter(Boolean).length ?? 0,
        totalTodo: step.todo.length,
        confirmedExpectations: record.expect?.filter(Boolean).length ?? 0,
        totalExpectations: step.expect.length,
      };
    }),
  };
}

function errorMessage(body: string): string {
  try {
    const parsed = JSON.parse(body) as { error?: unknown; ok?: unknown };
    if (typeof parsed.error === "string") return parsed.error;
    if (parsed.ok === false) return "The Google Sheet rejected the submission.";
  } catch {
    // Google Apps Script may return a plain-text error page.
  }
  return body.slice(0, 300) || "The Google Sheet did not return a response.";
}

export async function syncSubmissionToGoogleSheets(
  session: GoogleSheetsSession,
  submittedAt: string,
): Promise<void> {
  const endpoint =
    process.env["GOOGLE_SHEETS_WEB_APP_URL"]?.trim() || DEFAULT_GOOGLE_SHEETS_WEB_APP_URL;
  const writeToken = process.env["GOOGLE_SHEETS_WRITE_TOKEN"]?.trim();
  const payload = {
    ...buildGoogleSheetsSubmission(session, submittedAt),
    ...(writeToken ? { token: writeToken } : {}),
  };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // Apps Script responds with a 302 after it has accepted the POST. Its
      // redirect target is a Google content URL that server-to-server clients
      // cannot always read, so preserve the 302 as our success signal.
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    throw new Error(
      `Could not reach Google Sheets: ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }

  if (response.status === 302) return;

  const body = await response.text();
  if (!response.ok)
    throw new Error(`Google Sheets returned ${response.status}: ${errorMessage(body)}`);

  try {
    const parsed = JSON.parse(body) as { ok?: unknown; error?: unknown };
    if (parsed.ok !== true)
      throw new Error(
        typeof parsed.error === "string"
          ? parsed.error
          : "The Google Sheet did not confirm the submission.",
      );
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Google Sheets returned an unexpected response: ${errorMessage(body)}`);
    }
    throw error;
  }
}
