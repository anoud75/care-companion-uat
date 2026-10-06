import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell, GhostButton, PrimaryButton } from "@/components/AppShell";
import { useSession } from "@/lib/session";
import { STEPS, type Feedback, type StepRecord } from "@/lib/steps";
import { fmtTime, tally } from "@/lib/tally";
import { listSessions } from "@/lib/uat.functions";

export const Route = createFileRoute("/coordinator")({
  head: () => ({
    meta: [
      { title: "Coordinator view — Care Coordination UAT" },
      { name: "description", content: "Live progress of every tester in the Care Coordination acceptance testing session." },
      { property: "og:title", content: "Coordinator view — Care Coordination UAT" },
      { property: "og:description", content: "Every tester, live." },
    ],
  }),
  component: Coordinator,
});

type Row = {
  id: string; full_name: string; email: string; position: string; current_step: number;
  results: Record<string, StepRecord>; feedback: Feedback | null; status: string;
  started_at: string; updated_at: string; submitted_at: string | null;
};

const RES_LABEL = { pass: "Pass", fail: "Fail", blocked: "Blocked" } as const;

function Coordinator() {
  const fetchList = useServerFn(listSessions);
  const { session } = useSession();
  const router = useRouter();
  const q = useQuery({ queryKey: ["sessions"], queryFn: () => fetchList() as Promise<Row[]>, refetchInterval: 5000 });
  const rows = q.data ?? [];

  const totals = rows.reduce(
    (a, r) => { const t = tally(r.results); a.pass += t.pass; a.fail += t.fail; a.blocked += t.blocked; a.raised += t.raised; return a; },
    { pass: 0, fail: 0, blocked: 0, raised: 0 },
  );

  async function exportXlsx() {
    const XLSX = await import("xlsx");
    const testers = rows.map((r) => {
      const t = tally(r.results);
      return {
        Name: r.full_name, Email: r.email, Position: r.position,
        Status: r.status === "submitted" ? "Submitted" : "In progress",
        "Steps done": t.done, Passed: t.pass, Failed: t.fail, Blocked: t.blocked, Notes: t.notes, Raised: t.raised,
        Started: new Date(r.started_at).toLocaleString("en-GB", { timeZone: "Asia/Riyadh" }),
        Submitted: r.submitted_at ? new Date(r.submitted_at).toLocaleString("en-GB", { timeZone: "Asia/Riyadh" }) : "",
        "Overall rating": r.feedback?.overall ?? "", "Instructions clear": r.feedback?.clear ?? "",
        "Easier daily work": r.feedback?.easier ?? "", "Ready to go live": r.feedback?.ready ?? "",
        "Would change": r.feedback?.change ?? "", "Anything else": r.feedback?.other ?? "",
      };
    });
    const steps = rows.flatMap((r) =>
      STEPS.map((s, i) => {
        const rec = r.results?.[s.ref] ?? {};
        return {
          Tester: r.full_name, Email: r.email, Step: i + 1, Ref: s.ref, Priority: s.priority, Test: s.title,
          Result: rec.result ? RES_LABEL[rec.result] : "Not tested", Notes: rec.notes ?? "",
          "Criteria ticked": `${(rec.expect ?? []).filter(Boolean).length}/${s.expect.length}`,
        };
      }),
    );
    const raised = rows.flatMap((r) =>
      STEPS.filter((s) => r.results?.[s.ref]?.raise).map((s) => ({
        Tester: r.full_name, Email: r.email, Ref: s.ref, Test: s.title, "Raised item": r.results[s.ref]?.raiseText ?? "",
      })),
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(testers), "Testers");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(steps), "Step results");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(raised.length ? raised : [{ Tester: "", Ref: "", "Raised item": "None yet" }]), "Raised items");
    XLSX.writeFile(wb, `CareCoordination_UAT_Results_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <AppShell wide>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="eyebrow flex items-center gap-2 text-teal">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-teal" /></span>
            Coordinator view
          </div>
          <h1 className="mt-2 text-3xl font-extrabold">Testing session — live</h1>
          <p className="mt-1 text-muted-foreground">Every tester who scans the code appears here. This is the sheet that gets exported.</p>
        </div>
        <div className="flex gap-2">
          <GhostButton onClick={() => router.history.back()}>Back</GhostButton>
          <PrimaryButton onClick={exportXlsx} disabled={!rows.length}>Export to Excel</PrimaryButton>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["Testers", rows.length, "bg-card text-navy border"],
          ["Passed", totals.pass, "bg-pass-soft text-pass"],
          ["Failed", totals.fail, "bg-fail-soft text-fail"],
          ["Blocked", totals.blocked, "bg-blocked-soft text-blocked"],
          ["Raised", totals.raised, "bg-teal-soft text-navy"],
        ].map(([l, v, c]) => (
          <div key={l as string} className={`rounded-xl p-4 ${c}`}>
            <div className="font-display text-2xl font-extrabold">{v}</div>
            <div className="eyebrow mt-1">{l}</div>
          </div>
        ))}
      </div>

      {q.isLoading ? (
        <p className="mt-8 text-muted-foreground">Loading testers…</p>
      ) : !rows.length ? (
        <div className="card-surface mt-6 p-10 text-center text-muted-foreground">No testers yet. They appear here the moment they sign in.</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card-surface mt-6 hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left">
                <tr className="eyebrow text-muted-foreground">
                  <th className="px-4 py-3">Tester</th><th className="px-4 py-3">Position</th><th className="px-4 py-3">Progress</th>
                  <th className="px-3 py-3 text-center">Pass</th><th className="px-3 py-3 text-center">Fail</th><th className="px-3 py-3 text-center">Blocked</th>
                  <th className="px-3 py-3 text-center">Rating</th><th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const t = tally(r.results);
                  const me = session?.id === r.id;
                  return (
                    <tr key={r.id} className={`border-t ${me ? "bg-teal-soft" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-navy">{r.full_name}{me && <span className="ml-2 rounded bg-teal px-1.5 py-0.5 text-[10px] font-bold text-navy">YOU</span>}</div>
                        <div className="text-xs text-muted-foreground">{r.email}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.position}</td>
                      <td className="px-4 py-3 min-w-56"><MiniDots results={r.results} /><div className="mt-1 text-xs text-muted-foreground">{t.done} of {STEPS.length} · started {fmtTime(r.started_at)}</div></td>
                      <td className="px-3 py-3 text-center font-bold text-pass">{t.pass}</td>
                      <td className="px-3 py-3 text-center font-bold text-fail">{t.fail}</td>
                      <td className="px-3 py-3 text-center font-bold text-blocked">{t.blocked}</td>
                      <td className="px-3 py-3 text-center">{r.feedback?.overall ? `${r.feedback.overall}/5` : "–"}</td>
                      <td className="px-4 py-3"><StatusPill r={r} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mt-6 space-y-3 md:hidden">
            {rows.map((r) => {
              const t = tally(r.results);
              const me = session?.id === r.id;
              return (
                <div key={r.id} className={`card-surface p-4 ${me ? "ring-2 ring-teal" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-navy">{r.full_name}{me && " · You"}</div>
                      <div className="truncate text-xs text-muted-foreground">{r.position} · {r.email}</div>
                    </div>
                    <StatusPill r={r} />
                  </div>
                  <div className="mt-3"><MiniDots results={r.results} /></div>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span className="font-bold text-pass">{t.pass} pass</span>
                    <span className="font-bold text-fail">{t.fail} fail</span>
                    <span className="font-bold text-blocked">{t.blocked} blocked</span>
                    <span className="ml-auto text-muted-foreground">{t.done}/{STEPS.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </AppShell>
  );
}

function MiniDots({ results }: { results: Record<string, StepRecord> }) {
  return (
    <div className="flex gap-1">
      {STEPS.map((s) => {
        const r = results?.[s.ref]?.result;
        const c = r === "pass" ? "bg-pass" : r === "fail" ? "bg-pink" : r === "blocked" ? "bg-blocked" : "bg-border";
        return <span key={s.ref} title={s.ref} className={`h-2 flex-1 rounded-full ${c}`} />;
      })}
    </div>
  );
}

function StatusPill({ r }: { r: Row }) {
  return r.status === "submitted" ? (
    <span className="whitespace-nowrap rounded-full bg-pass-soft px-2.5 py-1 text-xs font-semibold text-pass">Submitted {fmtTime(r.submitted_at)}</span>
  ) : (
    <span className="whitespace-nowrap rounded-full bg-amber-soft px-2.5 py-1 text-xs font-semibold text-blocked">Step {Math.min(r.current_step + 1, STEPS.length)}</span>
  );
}
