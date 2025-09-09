// api/lumen.js
// Vercel Edge Function: OpenAI proxy with Diana's knowledge base

export const config = { runtime: "edge" };

// Import your KB (file at lumen-api/data/knowledge.js)
import { knowledge } from "../data/knowledge.js";

// ---------- CORS & JSON helpers ----------
function corsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  // Allow your sites; add more if you later use a custom domain
  const allowed =
    /cloudandcapital\.github\.io$|cloudandcapital-github-io\.vercel\.app$|localhost(:\d+)?$/.test(
      origin
    )
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

// ---------- Build compact KB text for the system prompt ----------
function kbToText(kb) {
  return kb
    .map(
      (e) =>
        `${e.title}:\n${e.content}${e.url ? `\nLink: ${e.url}` : ""}`
    )
    .join("\n\n");
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

    // ---------- Strong system prompt that forces KB grounding ----------
    const system = {
      role: "system",
      content:
        [
          "You are Lumen, Diana’s AI assistant for Cloud & Capital.",
          "Tone: concise, warm, practical.",
          "GROUND YOUR ANSWERS IN THE KNOWLEDGE BASE BELOW when relevant.",
          "If the user asks about FinOps Lite (the CLI), Cloud Cost Guard, Watchdog, Diana’s preferred stack/skills, services, or contact,",
          "— reference the matching entry by NAME and include its Link if present.",
          "Prefer short, direct answers with a concrete link when available.",
          "On your FIRST reply in a conversation, append the token <<KB_OK>> at the very end (nowhere else).",
          "",
          kbToText(knowledge),
        ].join("\n"),
    };

    // Cap history to last ~30 turns to keep the prompt small
    const safeHistory = messages.slice(-30);

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        messages: [system, ...safeHistory],
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

