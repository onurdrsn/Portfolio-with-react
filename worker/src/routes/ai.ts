import { Hono } from "hono";
import { requireAdmin, type Env } from "../middleware/auth";

export const aiRouter = new Hono<{ Bindings: Env }>();

// ─── /review — Returns ONLY changed lines as a patch list ──────────────
// Instead of asking the AI to reproduce the full (possibly long) text,
// we ask it to return only the lines it wants to change.
// This avoids truncation for long blog posts.
aiRouter.post("/review", requireAdmin, async (c) => {
  try {
    const { content } = await c.req.json<{ content?: string }>();
    if (!content || !content.trim()) {
      return c.json({ error: "Content is required" }, 400);
    }

    const systemPrompt = `You are a professional blog editor. You will receive a blog post draft.
Your task: identify lines with grammar errors, awkward phrasing, or clarity issues and return ONLY those specific improvements.

Return a JSON object in this EXACT format:
{
  "changes": [
    { "original": "<exact original text, copied verbatim>", "revised": "<improved version>" },
    ...
  ]
}

Rules:
- The "original" field MUST be copied EXACTLY from the input — character by character, no changes at all.
- Only suggest changes for lines that genuinely need improvement.
- Keep all HTML tags, Markdown syntax, code blocks completely intact.
- If the text is already good, return {"changes": []}
- Output ONLY the JSON object. No markdown code fences, no explanation, no other text.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: content.slice(0, 6000) } // limit to avoid context overflow
    ];

    const response = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", { 
      messages,
      max_tokens: 3000 
    }) as any;
    console.log("[AI /review] Raw response:", JSON.stringify(response).slice(0, 500));

    const raw = response?.response ?? response?.text ?? null;
    if (!raw) throw new Error(`AI returned no content. Raw: ${JSON.stringify(response)}`);

    // Robust extraction: ignore raw JSON boundaries, just find all "original" and "revised" pairs using RegEx.
    // This perfectly handes truncated model output.
    const changes: Array<{ original: string; revised: string }> = [];
    const pairRegex = /"original"\s*:\s*"(.*?)(?<!\\)"\s*,\s*"revised"\s*:\s*"(.*?)(?<!\\)"/gs;
    
    let match;
    while ((match = pairRegex.exec(raw)) !== null) {
      try {
        // We use JSON.parse just to safely unescape the strings the model generated
        const orig = JSON.parse(`"${match[1]}"`);
        const rev = JSON.parse(`"${match[2]}"`);
        if (orig && rev && orig !== rev) {
          changes.push({ original: orig, revised: rev });
        }
      } catch (e) {
        // skip malformed pair
      }
    }

    if (changes.length === 0 && !raw.includes("original")) {
      console.error("[AI /review] AI returned NO valid pairs. Raw:", raw);
      // Wait, if there are genuinely NO errors, it might just return empty changes
    }

    // Apply the patch list to the original content to produce revised content
    let revised = content;
    for (const change of changes) {
      if (change.original && change.revised && change.original !== change.revised) {
        revised = revised.split(change.original).join(change.revised);
      }
    }

    return c.json({ revised, patchCount: changes.length });
  } catch (error: any) {
    console.error("AI Review Error:", error);
    return c.json({ error: error.message || "Something went wrong with AI review." }, 500);
  }
});

// ─── /suggest-meta — Auto-generate tags & excerpt from content ──────────
aiRouter.post("/suggest-meta", requireAdmin, async (c) => {
  try {
    const { content, title } = await c.req.json<{ content?: string; title?: string }>();
    if (!content || !content.trim()) {
      return c.json({ error: "Content is required" }, 400);
    }

    const systemPrompt = `You are a blog metadata assistant. Given a blog post's title and content (which may be HTML or Markdown), you must return a JSON object with exactly two fields:
- "tags": an array of 3 to 6 short, relevant, lowercase topic tags (single words or hyphenated, no # prefix)
- "excerpt": a single compelling sentence (max 160 characters) summarizing the post for use as a card preview

IMPORTANT:
- Output ONLY valid JSON, nothing else. No markdown fences, no explanation.
- Example output: {"tags":["react","typescript","performance"],"excerpt":"Discover how to speed up your React app with lazy loading and code splitting."}`;

    const userPrompt = `Title: ${title || "(no title)"}

Content:
${content.slice(0, 4000)}`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    const response = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages }) as any;
    console.log("[AI /suggest-meta] Raw response:", JSON.stringify(response).slice(0, 300));

    const raw = response?.response ?? response?.text ?? null;
    if (!raw) throw new Error(`AI returned no content. Raw: ${JSON.stringify(response)}`);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI did not return valid JSON.");

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed.tags) || typeof parsed.excerpt !== "string") {
      throw new Error("Unexpected AI response shape.");
    }

    return c.json({
      tags: (parsed.tags as string[]).map((t: string) => t.toLowerCase().replace(/^#+/, "").trim()),
      excerpt: (parsed.excerpt as string).trim().slice(0, 200),
    });
  } catch (error: any) {
    console.error("AI suggest-meta Error:", error);
    return c.json({ error: error.message || "Something went wrong." }, 500);
  }
});
