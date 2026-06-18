// Supabase Edge Function for AI Brain (Deno Runtime)
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, text, targetLanguage, tone, messages } = await req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY is not set in environment.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = "";
    if (action === 'rewrite') {
      prompt = `Rewrite the following message to be ${tone || 'Professional'}. Maintain the key information but alter the style: "${text}"`;
    } else if (action === 'translate') {
      prompt = `Translate the following text into ${targetLanguage || 'English'}: "${text}"`;
    } else if (action === 'summary') {
      prompt = `Summarize the following chat conversation messages. Identify key decisions, important tasks, action items, and potential risks:\n${JSON.stringify(messages)}`;
    } else if (action === 'command') {
      prompt = `Analyze this slack-style command and parse the details: "${text}". Reply with a JSON object containing keys: 'type' (e.g. 'create_task', 'assign_task'), 'title', 'assignee', 'target_language' depending on the input command.`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const completion = await response.json();
    const resultText = completion.choices?.[0]?.message?.content?.trim();

    return new Response(
      JSON.stringify({ result: resultText }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
