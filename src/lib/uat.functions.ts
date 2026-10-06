import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const startSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  position: z.string().trim().min(1).max(80),
});

export const startSession = createServerFn({ method: "POST" })
  .inputValidator((d) => startSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("uat_sessions")
      .insert(data)
      .select("id, started_at")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

const saveSchema = z.object({
  id: z.string().uuid(),
  current_step: z.number().int().min(0).max(20),
  results: z.record(z.string(), z.any()),
  feedback: z.record(z.string(), z.any()).optional(),
  submit: z.boolean().optional(),
});

export const saveSession = createServerFn({ method: "POST" })
  .inputValidator((d) => saveSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = {
      current_step: data.current_step,
      results: data.results,
      updated_at: new Date().toISOString(),
    };
    if (data.feedback) patch.feedback = data.feedback;
    if (data.submit) {
      patch.status = "submitted";
      patch.submitted_at = new Date().toISOString();
    }
    const { error } = await supabaseAdmin.from("uat_sessions").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSessions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("uat_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return data;
});
