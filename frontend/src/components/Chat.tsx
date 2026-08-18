import { LoaderCircle } from "lucide-react";
import { Message } from "@/src/components/Message";
import type { ChatMessage } from "@/src/types/chat";

export function Chat({
  messages,
  isLoading,
}: {
  messages: ChatMessage[];
  isLoading: boolean;
}) {
  if (!messages.length) {
    return (
      <div className="empty-chat">
        <div className="empty-orbit" aria-hidden="true">
          <span>அ</span>
          <span>മ</span>
          <span>A</span>
        </div>
        <p className="eyebrow">ASK IN YOUR LANGUAGE</p>
        <h2>India speaks in more than one way.</h2>
        <p>
          Ask in Tamil, Tanglish, Malayalam, or English. Answers can be grounded
          in your team&apos;s verified knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="message-list" aria-live="polite">
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      {isLoading ? (
        <div className="thinking-row" role="status">
          <span className="thinking-icon">
            <LoaderCircle className="spin" size={17} />
          </span>
          <span>
            <strong>Finding grounded context</strong>
            <small>Retrieving sources and preparing your answer…</small>
          </span>
        </div>
      ) : null}
    </div>
  );
}
