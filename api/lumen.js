// api/lumen.js
// Vercel Edge Function: tiny proxy to OpenAI (keeps your API key secret)

export const config = { runtime: "edge" };

function corsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  // Allow your two sites; add more if needed
  const allowed =
    /cloudandcapital\.github\.io$|cloudandcapital-github-io\.vercel\.app$/.test(origin)
      ? origin
      : "*";
  return {
    "access-control-allow-origin": allowed,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type, authorization",
  };
}

function jsonHeaders(req) {
  return { ...corsHeaders(req), "content-type": "application/json" };
}

export default async function handler(req) {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response("Only POST", { status: 405, headers: corsHeaders(req) });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), {
        status: 500,
        headers: jsonHeaders(req),
      });
    }

    const body = await req.json().catch(() => ({}));
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (!messages.length) {
      return new Response(JSON.stringify({ error: "Provide messages[]" }), {
        status: 400,
        headers: jsonHeaders(req),
      });
    }

    // System prompt keeps Lumen on-brand
    const system = {
      role: "system",
      content:
        "You are Lumen, Diana’s AI assistant for Cloud & Capital. Tone: concise, warm, practical. If asked about projects, tools, or writing, answer clearly and suggest next steps.",
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [system, ...messages].slice(-30), // last 30 turns
      }),
    });

    if (!r.ok) {
      const err = await r.text();
      return new Response(JSON.stringify({ error: err }), {
        status: 500,
        headers: jsonHeaders(req),
      });
    }

    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: jsonHeaders(req),
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: jsonHeaders(req),
    });
  }
}
