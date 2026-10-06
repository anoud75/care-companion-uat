/**
 * Care Companion UAT → Google Sheets receiver
 *
 * Attach this script to the target spreadsheet, then deploy it as a web app.
 * The URL in src/lib/google-sheets.ts is already configured as the default
 * receiver. This handler is safe to retry: it updates rows by submission ID.
 */

const SUBMISSIONS_SHEET = "UAT submissions";
const STEPS_SHEET = "UAT step results";

const SUBMISSION_HEADERS = [
  "Submission ID", "Full name", "Email", "Position", "Started at", "Submitted at",
  "Overall rating", "Instructions clear", "Daily work easier", "Ready to go live",
  "Suggested changes", "Other feedback",
];

const STEP_HEADERS = [
  "Submission ID", "Step reference", "Area", "Priority", "Step title", "Result", "Notes",
  "Raised", "Raised item", "Completed to-do items", "Total to-do items",
  "Confirmed expectations", "Total expectations",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30_000);
    const payload = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
    assertPayload(payload);
    validateToken(payload);

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const submissions = getOrCreateSheet(spreadsheet, SUBMISSIONS_SHEET, SUBMISSION_HEADERS);
    const steps = getOrCreateSheet(spreadsheet, STEPS_SHEET, STEP_HEADERS);

    upsertByKey(submissions, payload.submission.id, submissionRow(payload.submission));
    payload.steps.forEach((step) => upsertByKey(steps, `${step.submissionId}:${step.reference}`, stepRow(step)));

    return json({ ok: true, submissionId: payload.submission.id });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function assertPayload(payload) {
  if (payload.action !== "submitUatSession" || payload.schemaVersion !== 1) {
    throw new Error("Unsupported Care Companion submission payload.");
  }
  if (!payload.submission || !payload.submission.id || !Array.isArray(payload.steps)) {
    throw new Error("A submission ID and step results are required.");
  }
}

/**
 * Optional hardening. Set UAT_WEBHOOK_TOKEN in Script Properties and set the
 * same value as GOOGLE_SHEETS_WRITE_TOKEN in your app's server environment.
 */
function validateToken(payload) {
  const expectedToken = PropertiesService.getScriptProperties().getProperty("UAT_WEBHOOK_TOKEN");
  if (expectedToken && payload.token !== expectedToken) throw new Error("Unauthorised submission.");
}

function getOrCreateSheet(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function upsertByKey(sheet, key, row) {
  const rowCount = sheet.getLastRow();
  if (rowCount > 1) {
    const keys = sheet.getRange(2, 1, rowCount - 1, 1).getValues().flat();
    const index = keys.indexOf(key);
    if (index !== -1) {
      sheet.getRange(index + 2, 1, 1, row.length).setValues([row]);
      return;
    }
  }
  sheet.appendRow(row);
}

function submissionRow(s) {
  return [
    s.id, s.fullName, s.email, s.position, s.startedAt, s.submittedAt,
    s.overallRating, s.instructionsClear, s.dailyWorkEasier, s.readyToGoLive,
    s.suggestedChanges, s.otherFeedback,
  ];
}

function stepRow(s) {
  return [
    `${s.submissionId}:${s.reference}`, s.reference, s.area, s.priority, s.title,
    s.result, s.notes, s.raised, s.raisedItem, s.completedTodo, s.totalTodo,
    s.confirmedExpectations, s.totalExpectations,
  ];
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
