export type Step = {
  ref: string;
  reqName: string;
  priority: "Highest" | "High" | "Medium";
  area: string;
  title: string;
  crumbs: string[];
  before: string;
  todo: string[];
  expect: string[];
  warn?: string;
  prod?: string;
};

const P = ["Yamamah", "Care Coordination"];
const DP = [...P, "Diabetes Pathway"];

export const STEPS: Step[] = [
  {
    ref: "CC-PTH-02", reqName: "Pathway Activation State", priority: "Medium", area: "Pathways",
    title: "Every pathway is listed with its activation state",
    crumbs: [...P, "Pathways"],
    before: "You are in the staging environment with Care Coordination open.",
    todo: ["Open Care Coordination.", "Read the pathway list."],
    expect: [
      "Every configured pathway is listed as a card, in the same fixed order for every user.",
      "Diabetes Pathway and Chronic Disease Screening show Active, with population figures and an entry action that works.",
      "Every other pathway shows Coming soon, with no population figures and no way in.",
    ],
  },
  {
    ref: "CC-PTH-03", reqName: "Cross-Pathway Population Summary", priority: "Medium", area: "Pathways",
    title: "The summary band six figures reconcile",
    crumbs: [...P, "Pathways"],
    before: "The summary band at the top of the pathways page shows six population figures.",
    todo: [
      "Write down eligible patients, engaged patients and not engaged.",
      "Add engaged and not engaged together.",
      "Read the open care gaps and high-risk patients figures, and the data timestamp.",
    ],
    expect: [
      "Engaged plus not engaged equals eligible exactly.",
      "Open care gaps counts gap instances, not patients, and high-risk patients matches the High Risk tier of the risk pyramid.",
      "A data timestamp is displayed so you know how current the figures are.",
    ],
  },
  {
    ref: "CC-PTH-04", reqName: "Pathway Card Metrics and Entry", priority: "Medium", area: "Pathways",
    title: "Entering a pathway does not ask you to choose it again",
    crumbs: [...P, "Pathways"],
    before: "The Diabetes Pathway card is visible and Active.",
    todo: ["Read the figures on the Diabetes Pathway card.", "Press the entry action on the card."],
    expect: [
      "The card shows eligible patients, engaged patients and open care gaps for this pathway only.",
      "The pathway overview opens already set to Diabetes Pathway.",
      "You are not asked to choose the pathway again.",
    ],
  },
  {
    ref: "CC-OVW-02", reqName: "Administrative and Health Scope Selection", priority: "Highest", area: "Pathway overview",
    title: "Applying the scope filter recomputes everything",
    crumbs: DP,
    before: "You have opened the Diabetes Pathway.",
    todo: ["Open the scope selection.", "Choose one region or one health centre.", "Apply."],
    expect: [
      "The filter shows as applied on screen, naming what you chose.",
      "Every number changes to cover only that selection — the population was recomputed, not just filtered on screen.",
      "Every chart changes together with the numbers.",
      "Clearing the filter returns the pathway to your full granted scope.",
    ],
  },
  {
    ref: "CC-OVW-09", reqName: "Map and PHC Tooltip", priority: "Highest", area: "Pathway overview",
    title: "The map obeys the same scope as the numbers",
    crumbs: [...DP, "Map"],
    before: "The scope filter has been applied successfully.",
    todo: ["Note how many points are on the map before you filter.", "Apply a scope filter to one health centre.", "Look at the map again."],
    expect: ["The map now shows that health centre only.", "The map obeys the same filter as the numbers.", "It does not keep its old view."],
  },
  {
    ref: "CC-OVW-05", reqName: "Priority Care Gaps", priority: "High", area: "Pathway overview",
    title: "The priority care gaps table",
    crumbs: [...DP, "Priority care gaps"],
    before: "You are on the Diabetes Pathway screen.",
    todo: ["Read the priority care gaps table."],
    expect: [
      "Each row shows a care gap and how many patients it affects.",
      "Each row shows the Sehhaty task mapped to that care gap.",
      "Every row has a live task behind it — a gap with no live task does not appear.",
    ],
  },
  {
    ref: "CC-PAT-01", reqName: "Patient List", priority: "Highest", area: "Patient list",
    title: "Choosing the care gap chooses the task, and opens the patients",
    crumbs: [...DP, "Patient list"],
    before: "You are on the pathway screen and you have decided to work the blood sugar test gap.",
    todo: ["Read the task named against the blood sugar row.", "Press the action on that row.", "Before touching anything, read the top of the patient list."],
    expect: [
      "The task named on the row is the task that will be sent.",
      "The care gap you chose is shown as an applied filter.",
      "\"No active task\" is shown as an applied filter.",
      "The count of matching patients is displayed.",
      "Each row shows the patient's details — in staging the name appears as a hashed reference — with risk tier, open care gaps and task status.",
    ],
  },
  {
    ref: "CC-PAT-02", reqName: "Patient List Search and Filters", priority: "Highest", area: "Patient list",
    title: "A sixth care gap cannot be chosen",
    crumbs: [...DP, "Patient list", "Care gaps filter"],
    before: "The patient list is open and the care gaps filter works with one care gap.",
    todo: ["Select five care gaps.", "Try to select a sixth."],
    expect: ["The sixth cannot be selected.", "The screen says why — five is the maximum."],
  },
  {
    ref: "CC-PAT-03", reqName: "Patient Selection", priority: "Highest", area: "Patient list",
    title: "Selecting everyone who matches",
    crumbs: [...DP, "Patient list"],
    before: "Filters are applied to the patient list.",
    todo: ["Press select all.", "Compare the number selected with the matching count.", "Narrow a filter and watch the selection."],
    expect: [
      "The two numbers are the same.",
      "Select all takes every matching patient, not only those on the visible page.",
      "Narrowing a filter removes from the selection any patient who no longer matches.",
    ],
  },
  {
    ref: "CC-TSK-01", reqName: "Pathway and Task Recommendation", priority: "Highest", area: "Assign task",
    title: "The system proposes the pathway and the tasks",
    crumbs: [...DP, "Patient list", "Assign task"],
    before: "Patients are selected and you have opened the assign task action.",
    todo: ["Read the pathway the system proposes.", "Read the task list it proposes.", "Look for anything you could add to the task list."],
    expect: [
      "The proposed pathway fits the care gaps the selected patients carry.",
      "The task list contains only tasks mapped to those care gaps and live in Sehhaty.",
      "You cannot add a task outside the mapped set, and you cannot type a task of your own.",
    ],
  },
  {
    ref: "CC-TSK-02", reqName: "Duplicate and Exclusion Evaluation", priority: "Highest", area: "Assign task",
    title: "Patients who already have the task cannot receive it twice",
    crumbs: [...DP, "Patient list"],
    before: "Some patients in the test data already hold this task in the Sent or Active state.",
    todo: [
      "Open the patient list from the care gap row and search for those patients.",
      "Select a mixed group and continue to confirmation.",
      "Read the exclusion list after confirming.",
    ],
    expect: [
      "Patients already holding the task are not in the list.",
      "Any patient already holding the task in Sent or Active is excluded, and the screen says the reason is a duplicate.",
      "A patient whose earlier task expired or was completed is not excluded — they can receive it again.",
      "No second copy of the task can be created.",
    ],
  },
  {
    ref: "CC-TSK-03", reqName: "Task Push and Assignment Confirmation", priority: "Highest", area: "Assign task",
    title: "Confirming the send",
    crumbs: [...DP, "Patient list", "Assign task"],
    before: "Patients are selected and the task is already set from the care gap you chose.",
    todo: ["Press assign task.", "Review the confirmation screen before confirming.", "Confirm."],
    expect: [
      "Nothing is sent before you confirm.",
      "The confirmation shows the pathway, the tasks, how many patients will be assigned and how many will be excluded.",
      "A result shows how many tasks were assigned.",
      "It shows how many patients were excluded, and why.",
    ],
    prod: "Staging is not connected to the Sehhaty app, so no task actually reaches a patient here. On production, repeat this step and confirm real delivery: the assigned counts match what was confirmed, failed deliveries are reported, and status monitoring starts for every assignment.",
  },
  {
    ref: "CC-TSK-04", reqName: "Task Status Lifecycle", priority: "Highest", area: "The rule that matters most",
    title: "The patient says done, but the care gap stays open",
    crumbs: [...DP, "Patient list"],
    before: "A task has been assigned to a patient and you can see both statuses on their row.",
    todo: [
      "Find the patient in the patient list.",
      "Read the task status and the care gap status — they are two separate values.",
      "Check that the five task statuses exist: Sent, Active, Completed by patient, Expired, Skipped.",
      "Go back to the pathway screen and read the open care gaps number.",
    ],
    expect: [
      "Task status and care gap status are held and shown separately.",
      "A completion recorded against the task does not change the care gap status, the patient's risk tier, or the open care gaps number.",
    ],
    warn: "If the care gap closes when the patient's task is marked done, record this as a failure. The release is not ready, whatever else passes.",
    prod: "Staging receives no task status from Sehhaty, so the full check happens on production: a patient completes the task in the Sehhaty app, the task shows Completed by patient, and the care gap still stays open until a clinical result closes it.",
  },
  {
    ref: "CC-INT-03", reqName: "Sehhaty Digital Twin Task Integration", priority: "Highest", area: "Integration",
    title: "The task loop is bounded by what is live in Sehhaty",
    crumbs: [...P, "Diabetes Pathway", "Assign task"],
    before: "You have completed the sending steps and seen which tasks the app offers.",
    todo: [
      "Read what the app says happens after you confirm a send.",
      "Check the due and expiry dates on a confirmed assignment.",
      "Try to find a task that is designed but not live in Sehhaty.",
    ],
    expect: [
      "The app describes the loop correctly: the task goes to the patient's Sehhaty app and the patient's response comes back as task status.",
      "Due and expiry dates come from the certified pathway definition, counted from the send date — the coordinator cannot change them.",
      "Only tasks live in the Sehhaty catalogue can be selected; a task that is not live never appears.",
    ],
    prod: "On production, close the loop end to end: a real task reaches the patient in Sehhaty, the status events return to Yamamah, and a care gap closes only when a clinical result arrives through the data feed — never from the task being completed.",
  },
];

export type Result = "pass" | "fail" | "blocked";
export type StepRecord = {
  result?: Result;
  notes?: string;
  raise?: boolean;
  raiseText?: string;
  todo?: boolean[];
  expect?: boolean[];
};
export type Feedback = {
  overall?: number;
  clear?: number;
  easier?: number;
  ready?: number;
  change?: string;
  other?: string;
};
