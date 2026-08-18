import type {
  AskResponse,
  LanguageCode,
  Source,
  SpeechResponse,
  TranscriptionResponse,
} from "@/src/types/chat";

const API_BASE_URL = (process.env.NEXT_PUBLIC_AI_API_URL ?? "").replace(
  /\/$/,
  "",
);
const REQUEST_TIMEOUT_MS = 45_000;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "ABORTED"
      | "BACKEND_UNAVAILABLE"
      | "BAD_RESPONSE"
      | "REQUEST_FAILED"
      | "TIMEOUT",
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function endpoint(path: string): string {
  return `${API_BASE_URL}${path}`;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort("timeout"),
    REQUEST_TIMEOUT_MS,
  );

  const externalSignal = init.signal;
  const abortFromExternal = () => controller.abort("cancelled");
  externalSignal?.addEventListener("abort", abortFromExternal, { once: true });

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch {
    if (controller.signal.aborted) {
      const timedOut = controller.signal.reason === "timeout";
      throw new ApiError(
        timedOut
          ? "The AI took too long to respond."
          : "The request was cancelled.",
        timedOut ? "TIMEOUT" : "ABORTED",
      );
    }
    throw new ApiError(
      "The AI backend is unavailable. Check that it is running and the API URL is correct.",
      "BACKEND_UNAVAILABLE",
    );
  } finally {
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", abortFromExternal);
  }
}

function normalizeSources(value: unknown): Source[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object",
    )
    .map((item, index) => ({
      id: String(item.id ?? item.chunk_id ?? `source-${index + 1}`),
      title: String(item.title ?? item.name ?? `Source ${index + 1}`),
      page:
        typeof item.page === "number" || typeof item.page === "string"
          ? item.page
          : null,
      url: typeof item.url === "string" ? item.url : null,
      snippet: typeof item.snippet === "string" ? item.snippet : null,
    }));
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as Record<string, unknown>;
      detail = typeof body.detail === "string" ? body.detail : "";
    } catch {
      // The backend may return an empty or non-JSON error response.
    }
    throw new ApiError(
      detail || `The backend returned HTTP ${response.status}.`,
      response.status >= 500 ? "BACKEND_UNAVAILABLE" : "REQUEST_FAILED",
      response.status,
    );
  }

  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    throw new ApiError("The backend returned invalid JSON.", "BAD_RESPONSE");
  }
}

export async function askQuestion(
  query: string,
  languageHint: LanguageCode,
  signal?: AbortSignal,
): Promise<AskResponse> {
  const response = await fetchWithTimeout(endpoint("/ask"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      language_hint: languageHint === "auto" ? null : languageHint,
    }),
    signal,
  });
  const body = await readJson(response);

  if (typeof body.answer !== "string" || !body.answer.trim()) {
    throw new ApiError(
      "The backend response did not contain an answer.",
      "BAD_RESPONSE",
    );
  }

  return {
    answer: body.answer.trim(),
    language: String(
      body.language ?? body.detected_language ?? languageHint,
    ),
    sources: normalizeSources(body.sources),
  };
}

export async function transcribeAudio(
  audio: Blob,
  languageHint: LanguageCode,
  signal?: AbortSignal,
): Promise<TranscriptionResponse> {
  const extension = audio.type.includes("mp4") ? "mp4" : "webm";
  const form = new FormData();
  form.append("file", audio, `recording.${extension}`);
  if (languageHint !== "auto") form.append("language_hint", languageHint);

  const response = await fetchWithTimeout(endpoint("/transcribe"), {
    method: "POST",
    body: form,
    signal,
  });
  const body = await readJson(response);
  const text = body.text ?? body.transcription;

  if (typeof text !== "string" || !text.trim()) {
    throw new ApiError(
      "Whisper returned an empty transcription.",
      "BAD_RESPONSE",
    );
  }

  return {
    text: text.trim(),
    language: String(body.language ?? body.detected_language ?? "auto"),
  };
}

export async function synthesizeSpeech(
  text: string,
  language: LanguageCode,
  signal?: AbortSignal,
): Promise<SpeechResponse> {
  const response = await fetchWithTimeout(endpoint("/synthesize"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
    signal,
  });

  if (!response.ok) {
    throw new ApiError(
      `Text-to-speech returned HTTP ${response.status}.`,
      "REQUEST_FAILED",
      response.status,
    );
  }

  if (response.headers.get("content-type")?.startsWith("audio/")) {
    return { blob: await response.blob() };
  }

  const body = (await response.json()) as Record<string, unknown>;
  const audioUrl = body.audio_url ?? body.url;
  if (typeof audioUrl !== "string" || !audioUrl) {
    throw new ApiError(
      "The TTS response did not contain audio.",
      "BAD_RESPONSE",
    );
  }
  return { url: audioUrl };
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(endpoint("/health"), {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}
