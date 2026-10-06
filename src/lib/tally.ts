import type { StepRecord } from "./steps";

export function tally(results: Record<string, StepRecord> | null | undefined) {
  const r = Object.values(results ?? {});
  return {
    pass: r.filter((x) => x.result === "pass").length,
    fail: r.filter((x) => x.result === "fail").length,
    blocked: r.filter((x) => x.result === "blocked").length,
    notes: r.filter((x) => x.notes?.trim()).length,
    raised: r.filter((x) => x.raise).length,
    done: r.filter((x) => x.result).length,
  };
}

export function fmtTime(iso?: string | null) {
  if (!iso) return "–";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" });
}
