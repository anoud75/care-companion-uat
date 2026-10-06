import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Feedback, StepRecord } from "./steps";

export type LocalSession = {
  id: string;
  full_name: string;
  email: string;
  position: string;
  started_at: string;
  briefed?: boolean;
  current_step: number;
  results: Record<string, StepRecord>;
  feedback?: Feedback;
  submitted_at?: string;
};

const KEY = "uat-companion-session";

type Ctx = {
  session: LocalSession | null;
  ready: boolean;
  set: (s: LocalSession | null) => void;
  update: (fn: (s: LocalSession) => LocalSession) => void;
};

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const set = useCallback((s: LocalSession | null) => {
    setSession(s);
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  }, []);

  const update = useCallback((fn: (s: LocalSession) => LocalSession) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return <SessionCtx.Provider value={{ session, ready, set, update }}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const c = useContext(SessionCtx);
  if (!c) throw new Error("SessionProvider missing");
  return c;
}
