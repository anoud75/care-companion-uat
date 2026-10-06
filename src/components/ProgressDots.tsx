import { STEPS, type StepRecord } from "@/lib/steps";

export function ProgressDots({ results, current }: { results: Record<string, StepRecord>; current: number }) {
  return (
    <div className="flex flex-wrap gap-1.5" aria-label="Progress">
      {STEPS.map((s, i) => {
        const r = results[s.ref]?.result;
        const cls =
          r === "pass" ? "bg-pass" : r === "fail" ? "bg-fail" : r === "blocked" ? "bg-blocked" :
          i === current ? "bg-navy ring-2 ring-teal ring-offset-2" : "bg-border";
        return <span key={s.ref} title={`Step ${i + 1} · ${s.ref}`} className={`h-2.5 flex-1 min-w-3 rounded-full ${cls}`} />;
      })}
    </div>
  );
}
