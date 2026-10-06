export type Step = {
  ref: string;
  priority: "Highest" | "High" | "Medium";
  area: string;
  title: string;
  crumbs: string[];
  before: string;
  todo: string[];
  expect: string[];
  warn?: string;
};

const P = ["Yamamah", "Care Coordination"];
const DP = [...P, "Diabetes Pathway"];

export const STEPS: Step[] = [
  {
    ref: "A-01", priority: "Medium", area: "Pathways page",
    title: "Every pathway is listed with its state",
    crumbs: [...P, "Pathways"],
    before: "You are in the staging environment with Care Coordination open.",
    todo: ["Open Care Coordination.", "Read the pathway list."],
    expect: [
      "All pathways are listed.",
      "Diabetes Pathway and Chronic Disease Screening are open.",
      "Every other pathway shows Coming soon.",
    ],
  },
  {
    ref: "A-04", priority: "Medium", area: "Pathways page",
    title: "The three population numbers add up",
    crumbs: [...P, "Pathways"],
    before: "The summary band at the top of the pathways page shows six numbers.",
    todo: ["Write down eligible patients, engaged patients and not engaged.", "Add engaged and not engaged together."],
    expect: ["Engaged plus not engaged equals eligible exactly.", "If not, all three numbers are written in Notes."],
  },
  {
    ref: "A-07", priority: "Medium", area: "Pathways page",
    title: "Entering a pathway does not ask you to choose it again",
    crumbs: [...P, "Pathways"],
    before: "The Diabetes Pathway card is visible and open.",
    todo: ["Press the entry action on the Diabetes Pathway card."],
    expect: ["The pathway screen opens already set to Diabetes Pathway.", "You are not asked to choose the pathway again."],
  },
  {
    ref: "B-02", priority: "Highest", area: "Pathway screen",
    title: "Applying the filter",
    crumbs: DP,
    before: "You have opened the Diabetes Pathway.",
    todo: ["Open the filter.", "Choose one region or one health centre.", "Apply."],
    expect: [
      "The filter shows as applied on screen, naming what you chose.",
      "Every number changes to cover only that selection.",
      "Every chart changes together with the numbers.",
    ],
  },
  {
    ref: "B-03", priority: "Highest", area: "Pathway screen",
    title: "The filter changes the map too",
    crumbs: [...DP, "Map"],
    before: "The filter has been applied successfully.",
    todo: ["Note how many points are on the map before you filter.", "Apply a filter to one health centre.", "Look at the map again."],
    expect: ["The map now shows that health centre only.", "The map obeys the same filter as the numbers.", "It does not keep its old view."],
  },
  {
    ref: "B-08", priority: "High", area: "Pathway screen",
    title: "The priority care gaps table",
    crumbs: [...DP, "Priority care gaps"],
    before: "You are on the Diabetes Pathway screen.",
    todo: ["Read the priority care gaps table."],
    expect: [
      "Each row shows a care gap and how many patients it affects.",
      "Each row shows the patient task that goes with it.",
      "Every row has a task behind it.",
    ],
  },
  {
    ref: "D-01", priority: "Highest", area: "Choosing the work",
    title: "Choosing the care gap chooses the task, and opens the patients",
    crumbs: [...DP, "Patient list"],
    before: "You are on the pathway screen and you have decided to work the blood sugar test gap.",
    todo: ["Read the task named against the blood sugar row.", "Press the action on that row.", "Before touching anything, read the top of the patient list."],
    expect: [
      "The task named on the row is the task that will be sent.",
      "The care gap you chose is shown as an applied filter.",
      "\"No active task\" is shown as an applied filter.",
      "The count of matching patients is displayed.",
    ],
  },
  {
    ref: "D-03", priority: "Highest", area: "Choosing the work",
    title: "Patients who already have the task are not in the list",
    crumbs: [...DP, "Patient list"],
    before: "Some patients in the test data already hold this task.",
    todo: ["Open the patient list from the care gap row.", "Pick two of those patients and search for them in this list."],
    expect: ["They are not in the list.", "The list contains only patients who can receive the task now."],
  },
  {
    ref: "E-07", priority: "Highest", area: "Patient list",
    title: "A sixth care gap cannot be chosen",
    crumbs: [...DP, "Patient list", "Care gaps filter"],
    before: "The patient list is open and the care gaps filter works with one care gap.",
    todo: ["Select five care gaps.", "Try to select a sixth."],
    expect: ["The sixth cannot be selected.", "The screen says why — five is the maximum."],
  },
  {
    ref: "E-15", priority: "Highest", area: "Patient list",
    title: "Selecting everyone who matches",
    crumbs: [...DP, "Patient list"],
    before: "Filters are applied to the patient list.",
    todo: ["Press select all.", "Compare the number selected with the matching count."],
    expect: ["The two numbers are the same.", "Select all takes every matching patient, not only those on the visible page."],
  },
  {
    ref: "F-04", priority: "Highest", area: "Sending",
    title: "Confirming the send",
    crumbs: [...DP, "Patient list", "Assign task"],
    before: "Patients are selected and the task is already set from the care gap you chose.",
    todo: ["Press assign task.", "Review the list.", "Confirm."],
    expect: [
      "Nothing is sent before you confirm.",
      "A result shows how many tasks were sent.",
      "It shows how many patients were excluded, and why.",
    ],
  },
  {
    ref: "F-07", priority: "Highest", area: "Sending",
    title: "That patient is now out of the sending list",
    crumbs: [...DP, "Patient list"],
    before: "A task has been sent and its status shows as running in Yamamah.",
    todo: ["Go back to the same care gap row and open the patient list again.", "Search for the patient you just sent to."],
    expect: ["The patient is no longer in the list.", "No second copy of the task can be created."],
  },
  {
    ref: "F-10", priority: "Highest", area: "The rule that matters most",
    title: "The patient says done, but the care gap stays open",
    crumbs: [...DP, "Patient list"],
    before: "The task is with the patient and the Digital Twin team is ready to mark it completed on their side.",
    todo: [
      "Ask the Digital Twin team to mark the task completed.",
      "Find the patient in the patient list.",
      "Read the task status and the care gap status.",
      "Go back to the pathway screen and read the open care gaps number.",
    ],
    expect: [
      "The task status shows completed.",
      "The patient's risk level has not changed.",
      "The open care gaps number has not moved.",
      "The care gap is still open.",
    ],
    warn: "If the care gap closes when the patient marks the task done, record this as a failure. The release is not ready, whatever else passes.",
  },
  {
    ref: "F-11", priority: "Highest", area: "Sending",
    title: "The care gap closes on the clinical result",
    crumbs: [...DP, "Patient list"],
    before: "F-10 has passed and a result for that patient exists in the clinical data used by staging.",
    todo: ["Wait for the next data refresh.", "Find the patient."],
    expect: ["The care gap is now closed.", "The open care gaps number has fallen."],
  },
];

export const POSITIONS = [
  "Care coordinator",
  "PHC lead",
  "Physician",
  "Nurse",
  "Clinical owner",
  "Business sponsor",
  "Other",
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
