"use client";

import { useEffect, useRef, useState } from "react";
import { LoaderCircle, Mic, Square } from "lucide-react";
import { transcribeAudio } from "@/src/services/api";
import type { LanguageCode, TranscriptionResponse } from "@/src/types/chat";

const MAX_RECORDING_SECONDS = 30;

interface VoiceButtonProps {
  disabled?: boolean;
  languageHint: LanguageCode;
  onError: (message: string) => void;
  onTranscription: (result: TranscriptionResponse) => void;
}

function preferredMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

export function VoiceButton({
  disabled,
  languageHint,
  onError,
  onTranscription,
}: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    if (!isRecording) return;
    const timer = window.setInterval(() => {
      setElapsed((current) => {
        if (current + 1 >= MAX_RECORDING_SECONDS) {
          recorderRef.current?.stop();
          return MAX_RECORDING_SECONDS;
        }
        return current + 1;
      });
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  useEffect(
    () => () => {
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      onError(
        "This browser does not support microphone recording. Try a recent Chrome or Safari version.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = preferredMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        onError("The microphone recording failed. Please try again.");
        setIsRecording(false);
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
        const audio = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (audio.size < 1_000) {
          onError(
            "The recording was too short. Tap the microphone, speak clearly, then tap stop.",
          );
          setElapsed(0);
          return;
        }

        setIsTranscribing(true);
        try {
          onTranscription(await transcribeAudio(audio, languageHint));
        } catch (error) {
          onError(
            error instanceof Error
              ? error.message
              : "Whisper transcription failed.",
          );
        } finally {
          setIsTranscribing(false);
          setElapsed(0);
        }
      };

      recorder.start(250);
      setElapsed(0);
      setIsRecording(true);
    } catch (error) {
      const permissionDenied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError");
      onError(
        permissionDenied
          ? "Microphone permission was denied. Allow microphone access in your browser settings."
          : "The microphone could not be opened. Check whether another app is using it.",
      );
    }
  }

  function handleClick() {
    if (isRecording) {
      recorderRef.current?.stop();
      return;
    }
    void startRecording();
  }

  const label = isTranscribing
    ? "Transcribing audio"
    : isRecording
      ? `Stop recording, ${elapsed} seconds elapsed`
      : "Start voice input";

  return (
    <button
      className={`voice-button ${isRecording ? "is-recording" : ""}`}
      type="button"
      onClick={handleClick}
      disabled={disabled || isTranscribing}
      aria-label={label}
      title={label}
    >
      {isTranscribing ? (
        <LoaderCircle className="spin" size={20} />
      ) : isRecording ? (
        <>
          <Square size={15} fill="currentColor" />
          <span className="recording-time">0:{String(elapsed).padStart(2, "0")}</span>
        </>
      ) : (
        <Mic size={20} />
      )}
    </button>
  );
}
