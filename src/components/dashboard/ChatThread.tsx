"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Message } from "@/lib/types";

export function ChatThread({ projectId, messages }: { projectId: string; messages: Message[] }) {
  const [draft, setDraft] = useState("");
  const currentUser = useAppStore((s) => s.state.currentUser);
  const sendMessage = useAppStore((s) => s.sendMessage);

  function handleSend() {
    if (draft.trim().length === 0) return;
    sendMessage(projectId, draft.trim());
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages yet" description="Say hello to get the conversation started." />
      ) : (
        <ul className="space-y-3">
          {messages.map((message) => {
            const isMine = message.senderId === currentUser.id;
            return (
              <li key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    isMine ? "bg-primary text-white" : "border border-line bg-white text-ink"
                  }`}
                >
                  {!isMine && <p className="mb-0.5 text-xs font-medium text-ink-secondary">{message.senderName}</p>}
                  <p className="leading-relaxed">{message.body}</p>
                  <p className={`mt-1 text-[11px] ${isMine ? "text-white/70" : "text-ink-muted"}`}>
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form
        className="flex items-end gap-2 border-t border-line pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <label htmlFor="message-draft" className="sr-only">
          Message
        </label>
        <textarea
          id="message-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder="Write a message"
          className="flex-1 resize-none rounded-xl border border-line p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button type="submit" size="md" aria-label="Send message" disabled={draft.trim().length === 0}>
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
