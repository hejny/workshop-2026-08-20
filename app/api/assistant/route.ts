import { COMPANY_ITEMS } from "@/lib/co-hori-data";
import { NextResponse } from "next/server";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-4o-mini";
const MAX_MESSAGES = 12;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI asistent není nakonfigurovaný." }, { status: 503 });
  try {
    const body = (await request.json()) as { messages?: unknown };
    if (!Array.isArray(body.messages)) return NextResponse.json({ error: "Neplatný formát zprávy." }, { status: 400 });
    const messages = body.messages.filter((item): item is { role: "user" | "assistant"; content: string } => typeof item === "object" && item !== null && "role" in item && (item.role === "user" || item.role === "assistant") && "content" in item && typeof item.content === "string").slice(-MAX_MESSAGES);
    if (!messages.length) return NextResponse.json({ error: "Zpráva je prázdná." }, { status: 400 });
    const context = COMPANY_ITEMS.map((item) => `${item.title}: ${item.description} Kategorie: ${item.category}.`).join("\n");
    const response = await fetch(OPENAI_API_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: OPENAI_MODEL, temperature: 0.2, messages: [{ role: "system", content: `Jsi český AI asistent pro malé s.r.o. Vysvětluj termíny stručně, lidsky a prakticky. Opírej se pouze o kontext níže; pokud dotaz vyžaduje právní nebo daňový výklad mimo něj, přiznej nejistotu a doporuč ověření u účetní či poradce. Neříkej, že jsi právník. Kontext povinností:\n${context}` }, ...messages] }) });
    if (!response.ok) return NextResponse.json({ error: "AI asistent je momentálně nedostupný." }, { status: 502 });
    const result = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const assistantMessage = result.choices?.[0]?.message?.content;
    if (!assistantMessage) return NextResponse.json({ error: "AI asistent neposlal odpověď." }, { status: 502 });
    return NextResponse.json({ message: assistantMessage });
  } catch { return NextResponse.json({ error: "Požadavek se nepodařilo zpracovat." }, { status: 500 }); }
}
