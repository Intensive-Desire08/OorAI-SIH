export type LanguageCode = "auto" | "ta" | "ta-en" | "ml" | "en" | string;

export interface Source {
  id: string;
  title: string;
  page?: number | string | null;
  url?: string | null;
  snippet?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  language: LanguageCode;
  sources?: Source[];
  createdAt: Date;
}

export interface AskResponse {
  answer: string;
  language: LanguageCode;
  sources: Source[];
}

export interface TranscriptionResponse {
  text: string;
  language: LanguageCode;
}

export interface SpeechResponse {
  blob?: Blob;
  url?: string;
}
