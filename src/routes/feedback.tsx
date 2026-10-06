import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, GhostButton, PrimaryButton } from "@/components/AppShell";
import { useSession } from "@/lib/session";
import { STEPS, type Feedback } from "@/lib/steps";
import { saveSession } from "@/lib/uat.functions";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback — Care Coordination UAT" },
      { name: "description", content: "Two minutes on how testing went and what you think of Care Coordination." },
      { property: "og:title", content: "Feedback — Care Coordination UAT" },
      { property: "og:description", content: "Tell the team how testing went." },
    ],
  }),
  component: FeedbackPage,
});

const STAR_LABELS = ["", "Poor", "Fair", "Okay", "Good", "Excellent"];
const SCALES: { key: keyof Feedback; q: string; lo: string; hi: string }[] = [
  { key: "clear", q: "The instructions were clear and easy to follow", lo: "Strongly disagree", hi: "Strongly agree" },
  { key: "easier", q: "Care Coordination would make my daily work easier", lo: "Strongly disagree", hi: "Strongly agree" },
  { key: "ready", q: "I am confident this is ready to go live", lo: "Not confident", hi: "Very confident" },
];

function FeedbackPage() {
  const { session, ready, update } = useSession();
  const navigate = useNavigate();
  const save = useServerFn(saveSession);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && !session) navigate({ to: "/" });
  }, [ready, session, navigate]);
  if (!session) return <AppShell><div /></AppShell>;
  const fb = session.feedback ?? {};
  const setFb = (p: Partial<Feedback>) => update((s) => ({ ...s, feedback: { ...s.feedback, ...p } }));

  async function submit() {
    setBusy(true);
    try {
      await save({ data: { id: session!.id, current_step: STEPS.length, results: session!.results, feedback: fb, submit: true } });
      update((s) => ({ ...s, submitted_at: new Date().toISOString() }));
      navigate({ to: "/submitted" });
    } catch {
      toast.error("Could not submit. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const box = "mt-2 w-full rounded-lg border border-input bg-card px-3.5 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30";

  return (
    <AppShell>
      <div className="eyebrow text-teal">Last part</div>
      <h1 className="mt-2 text-3xl font-extrabold">How was it?</h1>
      <p className="mt-2 text-muted-foreground">Two minutes. This tells us whether the testing itself worked, and what you think of Care Coordination.</p>

      <div className="card-surface mt-6 space-y-7 p-5 sm:p-7">
        <div>
          <h2 className="font-semibold text-navy">Overall, how was your testing experience today?</h2>
          <div className="mt-3 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button" aria-label={`${i} stars`} onClick={() => setFb({ overall: i })}
                className={`text-3xl leading-none transition ${i <= (fb.overall ?? 0) ? "text-amber" : "text-border hover:text-amber/60"}`}>★</button>
            ))}
            <span className="ml-3 text-sm font-semibold text-navy">{STAR_LABELS[fb.overall ?? 0]}</span>
          </div>
        </div>

        {SCALES.map((s) => (
          <div key={s.key}>
            <h2 className="font-semibold text-navy">{s.q}</h2>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((v) => (
                <button key={v} type="button" onClick={() => setFb({ [s.key]: v } as Partial<Feedback>)}
                  className={`rounded-lg border-2 py-2.5 text-sm font-bold transition ${fb[s.key] === v ? "border-navy bg-navy text-primary-foreground" : "bg-card text-navy hover:bg-secondary"}`}>{v}</button>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-xs text-muted-foreground"><span>1 · {s.lo}</span><span>5 · {s.hi}</span></div>
          </div>
        ))}

        <label className="block">
          <span className="font-semibold text-navy">What would you change or add?</span>
          <textarea rows={3} className={box} placeholder="Your suggestions" value={fb.change ?? ""} onChange={(e) => setFb({ change: e.target.value })} />
        </label>
        <label className="block">
          <span className="font-semibold text-navy">Anything else about Care Coordination you want the team to read</span>
          <textarea rows={3} className={box} value={fb.other ?? ""} onChange={(e) => setFb({ other: e.target.value })} />
        </label>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
        <GhostButton onClick={() => navigate({ to: "/step/$n", params: { n: String(STEPS.length) } })}>Back to the last step</GhostButton>
        <PrimaryButton className="flex-1" disabled={!fb.overall || busy} onClick={submit}>{busy ? "Submitting…" : "Submit my results"}</PrimaryButton>
      </div>
    </AppShell>
  );
}
