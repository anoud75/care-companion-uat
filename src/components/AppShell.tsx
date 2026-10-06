import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/yamamah-logo.png.asset.json";

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
        <div className={`mx-auto flex items-center justify-between gap-3 px-4 py-3 ${wide ? "max-w-7xl" : "max-w-3xl"}`}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img src={logo.url} alt="Yamamah" className="h-9 w-9 shrink-0" />
            <div className="leading-tight min-w-0">
              <div className="font-display font-bold text-navy truncate">Care Coordination</div>
              <div className="text-xs text-muted-foreground truncate">User Acceptance Testing · Staging</div>
            </div>
          </Link>
          <Link
            to="/coordinator"
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold text-navy hover:bg-accent transition-colors"
            activeProps={{ className: "bg-accent border-teal" }}
          >
            Coordinator view
          </Link>
        </div>
      </header>
      <main className={`mx-auto w-full flex-1 px-4 py-6 sm:py-10 ${wide ? "max-w-7xl" : "max-w-3xl"}`}>{children}</main>
      <footer className="py-6 text-center text-xs text-muted-foreground px-4">
        Health Holding Company · Yamamah population health platform · Care Coordination release one
      </footer>
    </div>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35 ${className}`}
    />
  );
}

export function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center rounded-lg border bg-card px-5 py-3 text-sm font-semibold text-navy transition hover:bg-secondary ${className}`}
    />
  );
}
