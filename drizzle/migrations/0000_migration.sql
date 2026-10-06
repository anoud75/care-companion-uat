CREATE TABLE public.uat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  position text NOT NULL,
  current_step int NOT NULL DEFAULT 0,
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  feedback jsonb,
  status text NOT NULL DEFAULT 'in_progress',
  started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);
GRANT ALL ON public.uat_sessions TO service_role;
ALTER TABLE public.uat_sessions ENABLE ROW LEVEL SECURITY;