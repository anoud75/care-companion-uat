import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell, PrimaryButton } from "@/components/AppShell";
import hhc from "@/assets/hhc-logo.png.asset.json";
import yamamah from "@/assets/yamamah-logo.png.asset.json";
import { useSession } from "@/lib/session";
import { startSession } from "@/lib/uat.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Care Coordination UAT Companion" },
      { name: "description", content: "Start your guided acceptance test of Yamamah Care Coordination release one." },
      { property: "og:title", content: "Care Coordination — UAT Companion" },
      { property: "og:description", content: "Scan, sign in, and test release one step by step." },
    ],
  }),
  component: Welcome,
});

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

function Welcome() {
  const { session, ready, set } = useSession();
  const navigate = useNavigate();
  const start = useServerFn(startSession);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && session && !session.submitted_at) {
      if (session.briefed) navigate({ to: "/step/$n", params: { n: String(session.current_step + 1) } });
      else navigate({ to: "/briefing" });
    }
  }, [ready, session, navigate]);

  const valid = name.trim().length >= 2 && emailOk(email) && position.trim().length > 0;

  async function onStart() {
    if (!valid) return;
    setBusy(true);
    try {
      const row = await start({ data: { full_name: name.trim(), email: email.trim(), position: position.trim() } });
      set({
        id: row.id, full_name: name.trim(), email: email.trim(), position: position.trim(),
        started_at: row.started_at, current_step: 0, results: {},
      });
      navigate({ to: "/briefing" });
    } catch {
      toast.error("Could not start your session. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const field = "mt-1.5 w-full rounded-lg border border-input bg-card px-3.5 py-3 text-[15px] outline-none focus:border-teal focus:ring-2 focus:ring-teal/30";

  return (
    <AppShell>
      <section className="welcome-band card-surface overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b px-6 py-4 sm:px-10">
          <img src={hhc.url} alt="Health Holding Company" className="h-12 w-auto sm:h-14" />
          <div className="h-10 w-px bg-border" />
          <img src={yamamah.url} alt="Yamamah" className="h-10 w-auto sm:h-12" />
        </div>
        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-soft px-3 py-1 text-xs font-bold text-navy">
            <span className="h-1.5 w-1.5 rounded-full bg-teal" /> Release one · Staging
          </span>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">Care Coordination acceptance testing</h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            You are about to test the Diabetes Pathway and Chronic Disease Screening. The session follows the journey
            through the platform, one step at a time.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-md">
            {[["14", "Steps"], ["~45", "Minutes"], ["1", "Screen at a time"]].map(([v, l]) => (
              <div key={l} className="rounded-xl border bg-background px-3 py-3">
                <div className="text-xl font-extrabold text-navy">{v}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card-surface mt-6 p-6 sm:p-8">
        <div className="eyebrow text-teal">Tester details</div>
        <h2 className="mt-2 text-xl font-bold">Tell us who you are</h2>
        <p className="mt-1 text-sm text-muted-foreground">So your results can be traced back and your notes credited to you.</p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-navy">Full name *</span>
            <input className={field} value={name} placeholder="Maha Al-Otaibi" autoComplete="name"
              onChange={(e) => setName(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, name: true }))} />
            {touched["name"] && name.trim().length < 2 && <span className="mt-1 block text-xs text-fail">Please enter your full name.</span>}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy">Email *</span>
            <input className={field} type="email" value={email} placeholder="name@hhc.sa" autoComplete="email"
              onChange={(e) => setEmail(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, email: true }))} />
            {touched["email"] && !emailOk(email) && <span className="mt-1 block text-xs text-fail">Please enter a valid email.</span>}
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-navy">Position *</span>
            <input className={field} value={position} placeholder="e.g. Care coordinator" autoComplete="organization-title"
              onChange={(e) => setPosition(e.target.value)} onBlur={() => setTouched((t) => ({ ...t, position: true }))} />
            {touched["position"] && !position.trim() && <span className="mt-1 block text-xs text-fail">Please enter your position.</span>}
          </label>
        </div>

        <PrimaryButton className="mt-7 w-full" disabled={!valid || busy} onClick={onStart}>
          {busy ? "Starting…" : "Start testing"}
        </PrimaryButton>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Your email is only used to attribute your results and credit your notes.
        </p>
      </section>
    </AppShell>
  );
}
