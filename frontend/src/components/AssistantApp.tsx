"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent, KeyboardEvent } from "react";
import {
  ArrowUp,
  BookOpenCheck,
  Check,
  CircleAlert,
  Database,
  LoaderCircle,
  RotateCw,
  Sparkles,
  Waves,
  X,
} from "lucide-react";
import { Chat } from "@/src/components/Chat";
import { VoiceButton } from "@/src/components/VoiceButton";
import {
  getLanguageLabel,
  inferLanguage,
  LANGUAGE_OPTIONS,
} from "@/src/lib/language";
import { askQuestion, checkBackendHealth } from "@/src/services/api";
import type {
  ChatMessage,
  LanguageCode,
  TranscriptionResponse,
} from "@/src/types/chat";

const DEMO_PROMPTS = [
  {
    label: "Tamil",
    text: "சோழர்களைப் பற்றி எளிமையாக சொல்லுங்க.",
  },
  {
    label: "Tanglish",
    text: "Bro Chola empire pathi simple-ah explain pannunga.",
  },
  {
    label: "Malayalam",
    text: "ചോള സാമ്രാജ്യത്തെക്കുറിച്ച് ലളിതമായി പറയൂ.",
  },
];

type BackendStatus = "checking" | "online" | "offline";

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

export function AssistantApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [languageHint, setLanguageHint] = useState<LanguageCode>("auto");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] =
    useState<BackendStatus>("checking");
  const endRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);

  const refreshBackendStatus = useCallback(async () => {
    setBackendStatus("checking");
    setBackendStatus((await checkBackendHealth()) ? "online" : "offline");
  }, []);

  useEffect(() => {
    let cancelled = false;
    void checkBackendHealth().then((online) => {
      if (!cancelled) setBackendStatus(online ? "online" : "offline");
    });
    return () => {
      cancelled = true;
      activeRequestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isLoading]);

  async function sendQuery(
    queryOverride?: string,
    detectedLanguage?: LanguageCode,
  ) {
    const query = (queryOverride ?? input).trim();
    if (!query || isLoading) {
      if (!query) setError("Type a question or use the microphone first.");
      return;
    }

    setError(null);
    setInput("");
    setIsLoading(true);
    const language =
      detectedLanguage && detectedLanguage !== "auto"
        ? detectedLanguage
        : languageHint === "auto"
          ? inferLanguage(query)
          : languageHint;
    const userMessage: ChatMessage = {
      id: newId(),
      role: "user",
      content: query,
      language,
      createdAt: new Date(),
    };
    setMessages((current) => [...current, userMessage]);

    const controller = new AbortController();
    activeRequestRef.current = controller;
    try {
      const response = await askQuestion(
        query,
        languageHint,
        controller.signal,
      );
      setMessages((current) => [
        ...current,
        {
          id: newId(),
          role: "assistant",
          content: response.answer,
          language:
            response.language === "auto"
              ? inferLanguage(response.answer)
              : response.language,
          sources: response.sources,
          createdAt: new Date(),
        },
      ]);
      setBackendStatus("online");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The request failed unexpectedly.",
      );
      setBackendStatus("offline");
    } finally {
      setIsLoading(false);
      activeRequestRef.current = null;
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendQuery();
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendQuery();
    }
  }

  function handleTranscription(result: TranscriptionResponse) {
    setInput(result.text);
    void sendQuery(result.text, result.language);
  }

  const currentLanguage =
    languageHint === "auto" && input.trim()
      ? inferLanguage(input)
      : languageHint;

  return (
    <main className="assistant-shell">
      <aside className="identity-panel">
        <div className="identity-pattern" aria-hidden="true" />
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <Waves size={23} strokeWidth={1.8} />
          </div>
          <div>
            <p>SIH · PS29</p>
            <span>INDIGENOUS AI</span>
          </div>
        </div>

        <div className="identity-copy">
          <p className="eyebrow">YOUR INDIAN AI ASSISTANT</p>
          <h1>
            Speak naturally.
            <br />
            Stay grounded.
          </h1>
          <p>
            A culturally aware assistant for the way India actually
            communicates—across languages, scripts, and code-mixed
            conversations.
          </p>
        </div>

        <div className="system-map" aria-label="System capabilities">
          <div>
            <span>
              <Sparkles size={15} />
            </span>
            <p>
              <strong>Adapted model</strong>
              <small>Natural regional language</small>
            </p>
          </div>
          <div>
            <span>
              <Database size={15} />
            </span>
            <p>
              <strong>Grounded answers</strong>
              <small>RAG with real sources</small>
            </p>
          </div>
          <div>
            <span>
              <BookOpenCheck size={15} />
            </span>
            <p>
              <strong>Transparent</strong>
              <small>Evidence shown beside answers</small>
            </p>
          </div>
        </div>

        <div className="language-field">
          <label htmlFor="language">Preferred language</label>
          <select
            id="language"
            value={languageHint}
            onChange={(event) => setLanguageHint(event.target.value)}
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="identity-footer">
          <span>Base model + QLoRA</span>
          <span>RAG grounded</span>
        </div>
      </aside>

      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <p className="chat-kicker">MULTILINGUAL CONVERSATION</p>
            <h2>Ask Indigenous AI</h2>
          </div>
          <div className={`backend-state ${backendStatus}`}>
            <span aria-hidden="true" />
            {backendStatus === "checking"
              ? "Checking backend"
              : backendStatus === "online"
                ? "AI backend connected"
                : "Backend disconnected"}
            {backendStatus === "offline" ? (
              <button
                type="button"
                onClick={() => void refreshBackendStatus()}
                aria-label="Retry backend connection"
              >
                <RotateCw size={13} />
              </button>
            ) : null}
          </div>
        </header>

        <div className="chat-scroll">
          <Chat messages={messages} isLoading={isLoading} />
          <div ref={endRef} />
        </div>

        <div className="composer-zone">
          {!messages.length ? (
            <div className="demo-prompts" aria-label="Demo prompts">
              {DEMO_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => {
                    setInput(prompt.text);
                    setError(null);
                  }}
                >
                  <span>{prompt.label}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="error-banner" role="alert">
              <CircleAlert size={18} aria-hidden="true" />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </div>
          ) : null}

          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                if (error) setError(null);
              }}
              onKeyDown={handleComposerKeyDown}
              placeholder="Ask in Tamil, Tanglish, Malayalam, or English…"
              rows={1}
              aria-label="Your question"
              disabled={isLoading}
            />
            <div className="composer-actions">
              <VoiceButton
                disabled={isLoading}
                languageHint={languageHint}
                onError={setError}
                onTranscription={handleTranscription}
              />
              <button
                className="send-button"
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send question"
              >
                {isLoading ? (
                  <LoaderCircle className="spin" size={19} />
                ) : (
                  <ArrowUp size={20} strokeWidth={2.3} />
                )}
              </button>
            </div>
          </form>
          <div className="composer-note">
            <span>
              <Check size={12} /> {getLanguageLabel(currentLanguage)}
            </span>
            <span>Enter to send · Shift + Enter for a new line</span>
          </div>
        </div>
      </section>
    </main>
  );
}
