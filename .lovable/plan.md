# Align the UAT companion with the BRD and Pathway Rules

## What changes

The 14 testing steps stay 14, but their references and content are re-anchored to the two documents just supplied: the BRD (32 requirements, CC-ACC / CC-PTH / CC-COH / CC-OVW / CC-PAT / CC-TSK / CC-INT) and CareCoordination_Pathway_Rules_v7. The old letter badges (A-01 … F-10) are replaced with the BRD requirement IDs.

## 1. Re-map step references (src/lib/steps.ts)

Each step's `ref` becomes the BRD requirement ID that covers what it tests, and each step gains the BRD requirement name. Confirmed mappings from the BRD:

- Pathway list / states / entry — CC-PTH-01…04 (current A-01, A-07)
- Cohorts page behaviour — CC-COH-01…07 (replaces part of the old B-group if the UAT Pack step covered it)
- Overview numbers, filters, map, priority care gaps — CC-OVW-01…09 (current A-04, B-02, B-03, B-08)
- Patient list filters, exclusion, select-all — CC-PAT-01…03 (current D-03, E-07, E-15)
- Task assignment: task chosen by care gap, confirm modal, exclusions with reasons — CC-TSK-01…03 (current D-01, F-04, F-07)
- Task status vs care gap status separation — CC-TSK-04 + CC-INT-03 (current F-10, F-11)
- A step's `area` text is updated to the BRD area names (e.g. "Pathway overview", "Task assignment").

While rewriting, each step's "todo" and "expect" lines are checked against the BRD's functional requirements and business rules for that requirement ID (the parsed BRD text) and corrected where they drift — e.g. the five-care-gap maximum lives in CC-PAT-02's rules, the exclusion-with-reason list in CC-TSK-03.

## 2. Staging vs production — Digital Twin steps (CC-TSK-02, CC-TSK-03, CC-TSK-04)

Nothing is actually delivered to the Sehhaty Digital Twin in staging; that connection is production-only. For the affected steps:

- A new optional `prod` field on a step renders a clearly styled "Checked in production" note box on the step screen, naming exactly what must be re-verified at go-live (real task delivery, task status returning from Sehhaty, task-completion not closing the care gap).
- In staging these steps verify only what the screen shows: the confirmation modal, excluded patients with reasons, counts, and that task status and care gap status are separate fields. Expected results are reworded so a tester never records a failure for something staging cannot do.
- F-10 ("task done but gap stays open") becomes: in staging, confirm the two statuses are held separately and the open-gap count does not react to a simulated patient response; the production note states the final end-to-end check happens after go-live.
- The briefing screen ("Before you begin") gains one plain-language rule card: staging cannot send tasks to the Sehhaty app or track their status — that part is checked on production.

## 3. Patient identity wording

- Briefing card wording updated: in this staging environment patients appear as hashed references; when the system goes live the same screens will show real patient names and MRN.
- The notes-field heading and patient-list step wording updated the same way ("the hashed patient you tested with — on production this will be the patient's name and MRN").

## 4. Ripple updates

- Coordinator screen and Excel export: the requirement column now carries the BRD IDs automatically (no code change expected beyond what the ref change gives).
- No design, colour, font or layout changes; no database changes.

## Verification

- Typecheck clean (`bunx tsgo --noEmit`).
- Playwright walk-through: sign in, briefing shows the two new rule cards, each step screen shows a CC-ID badge and the production note on Digital-Twin steps, submit reaches the summary.
