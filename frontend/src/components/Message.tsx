"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  LoaderCircle,
  Square,
  UserRound,
  Volume2,
} from "lucide-react";
import { LanguageBadge } from "@/src/components/LanguageBadge";
import { SourceCard } from "@/src/components/SourceCard";
import { getSpeechLocale } from "@/src/lib/language";
import { synthesizeSpeech } from "@/src/services/api";
import type { ChatMessage } from "@/src/types/chat";

export function Message({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";
  const [speechState, setSpeechState] = useState<
    "idle" | "loading" | "playing"
  >("idle");
  const [copied, setCopied] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  function stopSpeech() {
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();
    setSpeechState("idle");
  }

  function playWithBrowserVoice(): boolean {
    if (!("speechSynthesis" in window)) return false;

    const utterance = new SpeechSynthesisUtterance(message.content);
    const locale = getSpeechLocale(message.language, message.content);
    utterance.lang = locale;
    utterance.rate = 0.96;
    const languagePrefix = locale.slice(0, 2).toLowerCase();
    const matchingVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith(languagePrefix));
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.onend = () => setSpeechState("idle");
    utterance.onerror = () => {
      setSpeechState("idle");
      setSpeechError("Speech playback is unavailable for this language.");
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeechState("playing");
    return true;
  }

  async function playSpeech() {
    if (speechState === "playing") {
      stopSpeech();
      return;
    }

    setSpeechError(null);
    setSpeechState("loading");
    try {
      const result = await synthesizeSpeech(message.content, message.language);
      const source = result.blob
        ? URL.createObjectURL(result.blob)
        : result.url;
      if (!source) throw new Error("No audio was returned.");

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = result.blob ? source : null;
      const audio = new Audio(source);
      audioRef.current = audio;
      audio.onended = () => setSpeechState("idle");
      audio.onerror = () => {
        setSpeechState("idle");
        setSpeechError("The generated audio could not be played.");
      };
      await audio.play();
      setSpeechState("playing");
    } catch {
      if (!playWithBrowserVoice()) {
        setSpeechState("idle");
        setSpeechError("Text-to-speech is unavailable right now.");
      }
    }
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <article className={`message-row ${isAssistant ? "assistant" : "user"}`}>
      <div className="message-avatar" aria-hidden="true">
        {isAssistant ? <Bot size={17} /> : <UserRound size={17} />}
      </div>
      <div className="message-content">
        <div className="message-meta">
          <span>{isAssistant ? "Indigenous AI" : "You"}</span>
          <LanguageBadge language={message.language} />
        </div>
        <div className="message-bubble">
          {message.content.split("\n").map((line, index) => (
            <p key={`${message.id}-${index}`}>{line || <br />}</p>
          ))}
        </div>
        {isAssistant ? (
          <div className="message-actions">
            <button
              type="button"
              className="message-action"
              onClick={() => void playSpeech()}
              disabled={speechState === "loading"}
              aria-label={speechState === "playing" ? "Stop response audio" : "Play response audio"}
            >
              {speechState === "loading" ? (
                <LoaderCircle className="spin" size={14} />
              ) : speechState === "playing" ? (
                <Square size={12} fill="currentColor" />
              ) : (
                <Volume2 size={14} />
              )}
              {speechState === "loading"
                ? "Preparing audio"
                : speechState === "playing"
                  ? "Stop"
                  : "Listen"}
            </button>
            <button
              type="button"
              className="message-action"
              onClick={() => void copyMessage()}
              aria-label="Copy answer"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
            {speechError ? <span className="speech-error">{speechError}</span> : null}
          </div>
        ) : null}
        {isAssistant && message.sources?.length ? (
          <div className="source-section">
            <div className="source-heading">
              <span>Retrieved sources</span>
              <span>{message.sources.length} found</span>
            </div>
            <div className="source-grid">
              {message.sources.map((source, index) => (
                <SourceCard key={source.id} source={source} index={index} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
