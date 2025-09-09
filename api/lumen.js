// api/lumen.js
// Vercel Edge Function: OpenAI proxy with Diana's knowledge base

export const config = { runtime: "edge" };

// --- Import your KB (put this file at lumen-api/data/knowledge.js) ---
import { knowledge } from "../data/knowledge.js";

// --- Small helpers for CORS & JSON responses ---
function corsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  // Allow both your domains; add others if you later use a custom domain
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

// --- Build a compact KB string for the system prompt ---
function kbToText(kb) {
  return kb
    .map(
      (e) =>
        `${e.title}:\n${e.content}${e.url ? `\nLink: ${e.url}` : ""}`
    )
    .join("\n\n");
}

export default async function handler(req) {
  // Preflight
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

    // System prompt that injects your KB
    const system = {
      role: "system",
      content:
        "You are Lumen, Diana’s AI assistant for Cloud & Capital. " +
        "Tone: concise, warm, practical. Use the knowledge below when relevant. " +
        "If you cite, keep it short and link only when helpful.\n\n" +
        kbToText(knowledge),
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",        // adjust if you prefer another model
        temperature: 0.4,
        messages: [system, ...messages].slice(-30), // keep last ~30 turns
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

