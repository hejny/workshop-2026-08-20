"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle, MessageCircle, Send, X } from "lucide-react";

type AssistantMessage = { role: "user" | "assistant"; content: string };
const INITIAL_MESSAGE: AssistantMessage = { role: "assistant", content: "Ahoj! Vysvětlím vám pojmy z přehledu povinností. Na co se chcete zeptat?" };

export function FloatingAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;
    const nextMessages = [...messages, { role: "user" as const, content: trimmedMessage }];
    setMessages(nextMessages); setMessage(""); setIsLoading(true);
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages }) });
      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok || !result.message) throw new Error(result.error ?? "Odpověď se nepodařila načíst.");
      setMessages((currentMessages) => [...currentMessages, { role: "assistant", content: result.message ?? "" }]);
    } catch (error) { setMessages((currentMessages) => [...currentMessages, { role: "assistant", content: error instanceof Error ? error.message : "Odpověď se nepodařila načíst." }]); }
    finally { setIsLoading(false); }
  }

  return <div className="floating-agent">
    {isOpen && <section className="assistant-panel" aria-label="AI asistent">
      <header className="assistant-header"><div><strong>AI asistent</strong><span>Vysvětlí pojmy jednoduše</span></div><button className="assistant-close" type="button" aria-label="Zavřít asistenta" onClick={() => setIsOpen(false)}><X size={17} /></button></header>
      <div className="assistant-messages" aria-live="polite">{messages.map((currentMessage, index) => <p className={`assistant-message ${currentMessage.role}`} key={`${currentMessage.role}-${index}`}>{currentMessage.content}</p>)}{isLoading && <p className="assistant-message assistant"><LoaderCircle className="assistant-loader" size={16} /> Přemýšlím…</p>}</div>
      <form className="assistant-form" onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Např. Co je identifikovaná osoba?" aria-label="Zpráva pro AI asistenta" disabled={isLoading} /><button type="submit" aria-label="Odeslat zprávu" disabled={isLoading || !message.trim()}><Send size={17} /></button></form>
    </section>}
    <button className="floating-agent-trigger" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((currentValue) => !currentValue)}><MessageCircle size={21} /><span>Zeptat se AI</span></button>
  </div>;
}
