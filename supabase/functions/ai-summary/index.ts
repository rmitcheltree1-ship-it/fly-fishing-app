// Supabase Edge Function: ai-summary
// Proxies the fly-fishing season summary through the server so the Anthropic
// API key lives in one Supabase secret (ANTHROPIC_API_KEY) instead of on every
// user's device. Auth: requires a valid Supabase session JWT.
//
// Deploy (Dashboard): Edge Functions → Deploy new function → name "ai-summary"
//   → paste this file → Deploy.
// Secret  (Dashboard): Edge Functions → ai-summary → Secrets →
//   add ANTHROPIC_API_KEY = sk-ant-…
//
// Or via CLI: supabase functions deploy ai-summary
//             supabase secrets set ANTHROPIC_API_KEY=sk-ant-…

import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the caller is a signed-in user of this project.
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Not signed in" }), {
        status: 401,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const { summary } = await req.json();
    if (!summary) {
      return new Response(JSON.stringify({ error: "Missing summary payload" }), {
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" },
      });
    }

    const anthropic = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000, // deliberately short output: a 4-5 sentence coaching note
      system:
        "You are a fly fishing coach analyzing an angler's personal trip log. " +
        "Be specific, reference actual numbers, and give 1-2 actionable observations. " +
        "Keep it to 4-5 sentences.",
      messages: [
        { role: "user", content: `Here is my season data: ${JSON.stringify(summary)}` },
      ],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
