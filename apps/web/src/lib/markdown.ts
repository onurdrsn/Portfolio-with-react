/**
 * markdown.ts
 * Lightweight Markdown → HTML renderer.
 * Uses a custom regex-based approach (no external deps needed beyond what's installed).
 * Supports: headers, bold, italic, inline code, code blocks, links, images,
 *            blockquotes, ordered/unordered lists, horizontal rules, tables.
 *
 * Install if not present: npm install marked highlight.js
 * Then swap this file for the marked-based version below.
 */

// ── If you have `marked` and `highlight.js` installed, use this version:
// import { marked } from "marked";
// import hljs from "highlight.js";
// import "highlight.js/styles/github-dark.css";
//
// marked.setOptions({
//   highlight: (code, lang) => {
//     if (lang && hljs.getLanguage(lang)) {
//       return hljs.highlight(code, { language: lang }).value;
//     }
//     return hljs.highlightAuto(code).value;
//   },
//   gfm: true,
//   breaks: true,
// });
//
// export function renderMarkdown(md: string): string {
//   if (!md || md.trim() === "") return "";
//   // If content looks like HTML (starts with <), pass through as-is
//   if (md.trimStart().startsWith("<")) return md;
//   return marked(md) as string;
// }

// ── Built-in lightweight renderer (no extra deps) ──────────────────────
export function renderMarkdown(input: string): string {
    if (!input || input.trim() === "") return "";

    // If content is already HTML (rich editor output), return as-is
    const trimmed = input.trimStart();
    if (trimmed.startsWith("<") && !trimmed.startsWith("<!--")) return input;

    let md = input;

    // Escape HTML entities in code blocks first (to prevent XSS in code)
    const codeBlocks: string[] = [];
    md = md.replace(/```(\w*)\n?([\s\S]*?)```/g, (_match, lang, code) => {
        const escaped = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        const langClass = lang ? ` class="language-${lang}"` : "";
        const langLabel = lang ? `<span class="code-lang">${lang}</span>` : "";
        const html = `<pre class="code-block">${langLabel}<code${langClass}>${escaped}</code></pre>`;
        codeBlocks.push(html);
        return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
    });

    // Inline code
    const inlineCodes: string[] = [];
    md = md.replace(/`([^`]+)`/g, (_match, code) => {
        const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        inlineCodes.push(`<code class="inline-code">${escaped}</code>`);
        return `%%INLINECODE_${inlineCodes.length - 1}%%`;
    });

    // Headings
    md = md.replace(/^###### (.+)$/gm, "<h6>$1</h6>");
    md = md.replace(/^##### (.+)$/gm, "<h5>$1</h5>");
    md = md.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
    md = md.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    md = md.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    md = md.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Horizontal rule
    md = md.replace(/^[-*_]{3,}$/gm, "<hr />");

    // Blockquotes
    md = md.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

    // Bold + italic
    md = md.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
    md = md.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    md = md.replace(/\*(.+?)\*/g, "<em>$1</em>");
    md = md.replace(/___(.+?)___/g, "<strong><em>$1</em></strong>");
    md = md.replace(/__(.+?)__/g, "<strong>$1</strong>");
    md = md.replace(/_(.+?)_/g, "<em>$1</em>");
    md = md.replace(/~~(.+?)~~/g, "<del>$1</del>");

    // Images (before links)
    md = md.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

    // Links
    md = md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Tables
    md = md.replace(
        /(\|.+\|\n)((?:\|[-:]+)+\|\n)((?:\|.+\|\n?)+)/g,
        (_match, header, _sep, body) => {
            const headerCells = header.trim().split("|").filter(Boolean).map((c: string) => `<th>${c.trim()}</th>`).join("");
            const rows = body.trim().split("\n").map((row: string) => {
                const cells = row.trim().split("|").filter(Boolean).map((c: string) => `<td>${c.trim()}</td>`).join("");
                return `<tr>${cells}</tr>`;
            }).join("");
            return `<table><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table>`;
        }
    );

    // Lists: process line by line
    const lines = md.split("\n");
    const result: string[] = [];
    let inUl = false;
    let inOl = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const ulMatch = line.match(/^[\-\*\+] (.+)/);
        const olMatch = line.match(/^\d+\. (.+)/);

        if (ulMatch) {
            if (!inUl) { result.push("<ul>"); inUl = true; }
            result.push(`<li>${ulMatch[1]}</li>`);
        } else if (olMatch) {
            if (!inOl) { result.push("<ol>"); inOl = true; }
            result.push(`<li>${olMatch[1]}</li>`);
        } else {
            if (inUl) { result.push("</ul>"); inUl = false; }
            if (inOl) { result.push("</ol>"); inOl = false; }
            result.push(line);
        }
    }
    if (inUl) result.push("</ul>");
    if (inOl) result.push("</ol>");

    md = result.join("\n");

    // Paragraphs: wrap non-tagged lines
    const finalLines = md.split("\n");
    const paragraphed: string[] = [];
    let buffer: string[] = [];

    const flushBuffer = () => {
        if (buffer.length > 0) {
            const text = buffer.join(" ").trim();
            if (text) paragraphed.push(`<p>${text}</p>`);
            buffer = [];
        }
    };

    const blockTags = /^<(h[1-6]|ul|ol|li|blockquote|pre|hr|table|thead|tbody|tr|th|td|img|div)/;

    for (const line of finalLines) {
        const trimmedLine = line.trim();
        if (trimmedLine === "") {
            flushBuffer();
        } else if (blockTags.test(trimmedLine) || trimmedLine.startsWith("%%CODEBLOCK")) {
            flushBuffer();
            paragraphed.push(trimmedLine);
        } else {
            buffer.push(trimmedLine);
        }
    }
    flushBuffer();

    md = paragraphed.join("\n");

    // Restore code blocks and inline code
    md = md.replace(/%%CODEBLOCK_(\d+)%%/g, (_m, i) => codeBlocks[parseInt(i)]);
    md = md.replace(/%%INLINECODE_(\d+)%%/g, (_m, i) => inlineCodes[parseInt(i)]);

    return md;
}

/**
 * Calculate estimated reading time from HTML or markdown content.
 * @returns reading time in minutes (minimum 1)
 */
export function readingTime(content: string): number {
    const text = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const words = text.split(" ").filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
}