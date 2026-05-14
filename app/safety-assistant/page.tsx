"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User } from "lucide-react";

type Role = "user" | "assistant";

interface ChatMessage {
  role: Role;
  content: string;
}

export default function SafetyAssistantPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask about EHS programs, hazard identification, incident triage, permits, ESG metrics, or general workplace safety concepts. This is informational only—not legal or on-site professional advice.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!session?.user || !text || pending) return;

    const nextUser: ChatMessage = { role: "user", content: text };
    const history = [...messages, nextUser];
    setMessages(history);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/ai/safety-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || res.statusText);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          if (m.length === 0) return m;
          const copy = [...m];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant") {
            copy[copy.length - 1] = { role: "assistant", content: acc };
          }
          return copy;
        });
        scrollToBottom();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Request failed";
      toast({ title: "Assistant error", description: msg, variant: "destructive" });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Sorry — ${msg}. Check OPENAI_API_KEY if self-hosting.` },
      ]);
    } finally {
      setPending(false);
      scrollToBottom();
    }
  };

  if (!session?.user) {
    return (
      <div className="container max-w-2xl py-16 text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="text-primary underline">
          Sign in
        </Link>{" "}
        to use the Safety Assistant.
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 px-4 pb-24 md:pb-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">
          <Link href="/insights" className="hover:text-primary">
            Insights
          </Link>{" "}
          / Safety Assistant
        </p>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          Safety Q&amp;A
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Powered by OpenAI via the Vercel AI SDK. Outputs may be incomplete or incorrect—verify
          critical decisions.
        </p>
      </div>

      <Card className="flex flex-col h-[min(70vh,640px)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Conversation</CardTitle>
          <CardDescription>EHS / ESG questions in plain language</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-1 min-h-0 gap-3">
          <ScrollArea className="flex-1 rounded-md border bg-muted/30 p-3">
            <div className="space-y-4 pr-2">
              {messages.map((m, i) => (
                <div
                  key={`${i}-${m.role}-${m.content.slice(0, 16)}`}
                  className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    }`}
                  >
                    {m.content || (pending && i === messages.length - 1 ? "…" : "")}
                  </div>
                  {m.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          <div className="flex gap-2 items-end">
            <Textarea
              placeholder="e.g. What should a small team include in a confined-space rescue plan outline?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              className="resize-none min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              disabled={pending}
            />
            <Button
              type="button"
              size="icon"
              className="h-10 w-10 shrink-0"
              disabled={pending}
              onClick={() => void send()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
