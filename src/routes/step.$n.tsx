import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, type ReactElement } from "react";
import { toast } from "sonner";
import { AppShell, GhostButton, PrimaryButton } from "@/components/AppShell";
import { ProgressDots } from "@/components/ProgressDots";
import { useSession } from "@/lib/session";
import { STEPS, type Result, type StepRecord } from "@/lib/steps";
import { saveSession } from "@/lib/uat.functions";

export const Route = createFileRoute("/step/$n")({
  head: ({ params }) => ({
    meta: [
      { title: `Step ${params.n} of ${STEPS.length} — Care Coordination UAT` },
      { name: "description", content: "Record your result for this acceptance testing step." },
      { property: "og:title", content: `Step ${params.n} — Care Coordination UAT` },
      { property: "og:description", content: "One testing step at a time." },
    ],
  }),
  component: StepPage,
});

const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "mr-1.5 inline-block h-4 w-4 align-[-2px]" };
const CheckIcon = () => <svg {...iconProps}><path d="M4 12.5l5 5L20 6.5" /></svg>;
const CrossIcon = () => <svg {...iconProps}><path d="M6 6l12 12M18 6L6 18" /></svg>;
const BanIcon = () => <svg {...iconProps} strokeWidth={2.5}><circle cx="12" cy="12" r="9" /><path d="M5.8 5.8l12.4 12.4" /></svg>;

const RESULTS: { key: Result; label: string; icon: () => ReactElement; on: string }[] = [
  { key: "pass", label: "Pass", icon: CheckIcon, on: "bg-pass text-primary-foreground border-pass" },
  { key: "fail", label: "Fail", icon: CrossIcon, on: "bg-fail text-primary-foreground border-fail" },
  { key: "blocked", label: "Blocked", icon: BanIcon, on: "bg-blocked text-primary-foreground border-blocked" },
];

function StepPage() {
  const { n } = Route.useParams();
  const idx = Math.max(0, Math.min(STEPS.length - 1, Number(n) - 1 || 0));
  const step = STEPS[idx]!;
  const { session, ready, update } = useSession();
  const navigate = useNavigate();
  const save = useServerFn(saveSession);

  useEffect(() => {
    if (ready && !session) navigate({ to: "/" });
    if (ready && session?.submitted_at) navigate({ to: "/submitted" });
  }, [ready, session, navigate]);

  if (!session) return <AppShell><div /></AppShell>;
  const rec: StepRecord = session.results[step.ref] ?? {};
  const todo = rec.todo ?? step.todo.map(() => false);
  const expect = rec.expect ?? step.expect.map(() => false);

  const patch = (p: Partial<StepRecord>) =>
    update((s) => ({ ...s, results: { ...s.results, [step.ref]: { ...rec, todo, expect, ...p } } }));

  const pct = Math.round((Object.values(session.results).filter((r) => r.result).length / STEPS.length) * 100);

  async function go(next: number) {
    const current_step = Math.max(next, 0);
    update((s) => ({ ...s, current_step: Math.min(current_step, STEPS.length - 1) }));
    save({ data: { id: session!.id, current_step, results: session!.results } }).catch(() =>
      toast.error("Could not sync — your answers are kept on this device."),
    );
    if (next >= STEPS.length) navigate({ to: "/feedback" });
    else navigate({ to: "/step/$n", params: { n: String(next + 1) } });
    window.scrollTo({ top: 0 });
  }

  const tick = (arr: boolean[], i: number) => arr.map((v, j) => (j === i ? !v : v));

  return (
    <AppShell>
      <div className="flex items-baseline justify-between">
        <div className="eyebrow text-navy">Step {idx + 1} of {STEPS.length}</div>
        <div className="text-xs text-muted-foreground">{pct}% complete</div>
      </div>
      <div className="mt-3"><ProgressDots results={session.results} current={idx} /></div>

      <nav className="mt-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground" aria-label="Where you are">
        <span className="eyebrow mr-1 text-teal">Where you are</span>
        {step.crumbs.map((c, i) => (
          <span key={i} className={i === step.crumbs.length - 1 ? "font-semibold text-navy" : ""}>
            {i > 0 && <span className="mx-1">›</span>}{c}
          </span>
        ))}
      </nav>

      <article className="card-surface mt-4 overflow-hidden">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-md bg-navy px-2 py-1 font-bold text-white">{step.ref}</span>
            <span className={`rounded-full px-2.5 py-1 font-semibold ${step.priority === "Highest" ? "bg-fail-soft text-fail" : "bg-secondary text-navy"}`}>
              {step.priority} priority
            </span>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">{step.area}</span>
          </div>
          <h1 className="mt-3 text-xl sm:text-2xl font-bold leading-snug">{step.title}</h1>

          <div className="mt-5 rounded-xl border-l-4 border-amber bg-amber-soft p-4">
            <div className="eyebrow text-amber">Before you start</div>
            <p className="mt-1 text-sm text-navy">{step.before}</p>
          </div>

          <h2 className="eyebrow mt-6 text-muted-foreground">What to do — tick each one as you go</h2>
          <ul className="mt-2 space-y-2">
            {step.todo.map((t, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-secondary/60">
                  <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[var(--navy)]" checked={todo[i]} onChange={() => patch({ todo: tick(todo, i) })} />
                  <span className={`text-sm ${todo[i] ? "text-muted-foreground line-through decoration-1" : "text-navy"}`}>
                    <b className="mr-1">{i + 1}</b>{t}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-xl border-l-4 border-teal bg-teal-soft p-4">
            <h2 className="eyebrow text-navy">What you should see — all of these must be true</h2>
            <ul className="mt-2 space-y-2">
              {step.expect.map((t, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-3">
                    <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[var(--pass)]" checked={expect[i]} onChange={() => patch({ expect: tick(expect, i) })} />
                    <span className={`text-sm ${expect[i] ? "text-muted-foreground" : "text-navy"}`}>{t}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {step.warn && (
            <div className="mt-4 rounded-xl border border-fail bg-fail-soft p-4 text-sm text-fail">
              <b>Stop and read.</b> {step.warn}
            </div>
          )}

          <h2 className="mt-7 font-display text-base font-bold text-navy">Your result for this step</h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {RESULTS.map((r) => (
              <button key={r.key} type="button" onClick={() => patch({ result: r.key })}
                className={`rounded-lg border-2 px-2 py-3 text-sm font-semibold transition ${rec.result === r.key ? r.on : "bg-card text-navy hover:bg-secondary"}`}>
                <r.icon />{r.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Blocked means you could not run it. Say what stopped you.</p>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-navy">Notes — describe what happened on screen, and the hashed patient you tested with</span>
            <textarea rows={3} value={rec.notes ?? ""} onChange={(e) => patch({ notes: e.target.value })}
              placeholder={rec.result && rec.result !== "pass" ? "Please describe what happened" : "Optional, but please write something if this did not pass"}
              className={`mt-1.5 w-full rounded-lg border bg-card px-3.5 py-3 text-sm outline-none focus:border-teal focus:ring-2 focus:ring-teal/30 ${rec.result && rec.result !== "pass" && !rec.notes ? "border-fail" : "border-input"}`} />
          </label>

          <label className="mt-4 flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="mt-0.5 h-5 w-5 accent-[var(--teal)]" checked={!!rec.raise} onChange={(e) => patch({ raise: e.target.checked })} />
            <span className="text-sm text-navy">Something here is outside the requirements and I want it raised</span>
          </label>
          {rec.raise && (
            <div className="mt-3 rounded-xl border border-teal bg-teal-soft p-4">
              <div className="eyebrow text-navy">Raised item — becomes a change request, not a defect</div>
              <textarea rows={3} value={rec.raiseText ?? ""} onChange={(e) => patch({ raiseText: e.target.value })}
                placeholder="What did you see, and what would you expect instead?"
                className="mt-2 w-full rounded-lg border border-input bg-card px-3.5 py-3 text-sm outline-none focus:border-teal" />
            </div>
          )}
        </div>
      </article>

      <div className="sticky bottom-0 -mx-4 mt-6 flex gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <GhostButton onClick={() => (idx === 0 ? navigate({ to: "/briefing" }) : go(idx - 1))}>Back</GhostButton>
        <PrimaryButton className="flex-1" disabled={!rec.result} onClick={() => go(idx + 1)}>
          {idx === STEPS.length - 1 ? "Continue to feedback" : "Next step"}
        </PrimaryButton>
      </div>
    </AppShell>
  );
}
