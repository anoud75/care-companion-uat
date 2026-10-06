import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell, GhostButton } from "@/components/AppShell";
import { useSession } from "@/lib/session";
import { tally, fmtTime } from "@/lib/tally";

export const Route = createFileRoute("/submitted")({
  head: () => ({
    meta: [
      { title: "Submitted — Care Coordination UAT" },
      { name: "description", content: "Your testing results have been recorded." },
      { property: "og:title", content: "Submitted — Care Coordination UAT" },
      { property: "og:description", content: "Your testing results have been recorded." },
    ],
  }),
  component: Submitted,
});

function Submitted() {
  const { session, ready, set } = useSession();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !session) navigate({ to: "/" });
  }, [ready, session, navigate]);
  if (!session) return <AppShell><div /></AppShell>;
  const t = tally(session.results);
  const first = session.full_name.split(" ")[0];
  const tiles = [
    ["Passed", t.pass, "text-pass bg-pass-soft"],
    ["Failed", t.fail, "text-fail bg-fail-soft"],
    ["Blocked", t.blocked, "text-blocked bg-blocked-soft"],
    ["Notes", t.notes, "text-navy bg-teal-soft"],
  ] as const;

  return (
    <AppShell>
      <div className="grid h-14 w-14 place-items-center rounded-full bg-pass text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5" /></svg>
      </div>
      <div className="eyebrow mt-5 text-pass">Submitted</div>
      <h1 className="mt-2 text-3xl font-extrabold">Thank you, {first}</h1>
      <p className="mt-2 text-muted-foreground">Your results have been recorded and sent to the test coordinator. Nothing else is needed from you today.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([l, v, c]) => (
          <div key={l} className={`rounded-xl p-4 ${c}`}>
            <div className="text-3xl font-extrabold font-display">{v}</div>
            <div className="eyebrow mt-1">{l}</div>
          </div>
        ))}
      </div>

      <div className="card-surface mt-6 p-5">
        <div className="eyebrow text-muted-foreground">Your session</div>
        <div className="mt-2 font-semibold text-navy">{session.full_name} · {session.position}</div>
        <div className="text-sm text-muted-foreground">{session.email}</div>
        <div className="mt-2 text-sm text-navy">
          Started {fmtTime(session.started_at)} · finished {fmtTime(session.submitted_at)} · {t.done} steps · rating {session.feedback?.overall ?? "–"} of 5
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to="/coordinator" className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          See what the coordinator receives
        </Link>
        <GhostButton onClick={() => { set(null); navigate({ to: "/" }); }}>Start a new session</GhostButton>
      </div>
    </AppShell>
  );
}
