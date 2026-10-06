import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, GhostButton, PrimaryButton } from "@/components/AppShell";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/briefing")({
  head: () => ({
    meta: [
      { title: "Before you begin — Care Coordination UAT" },
      { name: "description", content: "Four rules that change how you record what you see during testing." },
      { property: "og:title", content: "Before you begin — Care Coordination UAT" },
      { property: "og:description", content: "Four rules for recording results in Care Coordination testing." },
    ],
  }),
  component: Briefing,
});

const RULES = [
  ["You are checking against the requirements", "Confirm the system does what the Business Requirements Document says. Not decide what it should do."],
  ["If something is not in the requirements, raise it", "Do not change it and do not mark the step failed. Switch on “Something outside the requirements”. It becomes a change request, not a defect."],
  ["This is staging", "Patient names and file numbers are hidden behind codes. No sign-in here and no patient app — the patient side is confirmed with the Digital Twin team."],
  ["The task is chosen first", "You pick the care gap and its task is already decided. The list then opens showing only patients who do not already hold that task."],
];

function Briefing() {
  const { session, ready, update } = useSession();
  const navigate = useNavigate();
  const [ack, setAck] = useState(!!session?.briefed);

  useEffect(() => {
    if (ready && !session) navigate({ to: "/" });
  }, [ready, session, navigate]);

  return (
    <AppShell>
      <div className="eyebrow text-amber">Before you begin</div>
      <h1 className="mt-2 text-3xl font-extrabold">Four things to know</h1>
      <p className="mt-2 text-muted-foreground">Please read these. They change how you record what you see.</p>

      <ol className="mt-6 space-y-3">
        {RULES.map(([t, b], i) => (
          <li key={t} className={`card-surface flex gap-4 p-5 ${i === 1 ? "border-teal ring-1 ring-teal/40" : ""}`}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-primary-foreground">{i + 1}</span>
            <div>
              <div className="font-semibold text-navy">{t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{b}</p>
            </div>
          </li>
        ))}
      </ol>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-4">
        <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[var(--navy)]" checked={ack} onChange={(e) => setAck(e.target.checked)} />
        <span className="text-sm text-navy">I have read these four points and I understand how to record what I see.</span>
      </label>

      <div className="mt-6 flex gap-3">
        <GhostButton onClick={() => navigate({ to: "/" })}>Back</GhostButton>
        <PrimaryButton className="flex-1" disabled={!ack} onClick={() => {
          update((s) => ({ ...s, briefed: true }));
          navigate({ to: "/step/$n", params: { n: String((session?.current_step ?? 0) + 1) } });
        }}>
          Begin — step {(session?.current_step ?? 0) + 1}
        </PrimaryButton>
      </div>
    </AppShell>
  );
}
