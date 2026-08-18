# Indigenous AI Assistant — Frontend + Voice

React/Vinext frontend for the SIH PS29 Indian-language AI prototype. It supports:

- Tamil, Tanglish, Malayalam, and English text input
- browser microphone recording
- backend Whisper transcription
- detected-language display
- real `/ask` integration with the RAG + QLoRA backend
- retrieved source cards
- backend TTS with browser speech fallback
- loading, timeout, permission, backend, transcription, and TTS errors
- fixed Tamil, Tanglish, and Malayalam demo prompts

The frontend contains no predetermined AI answers. The backend must provide the actual RAG and model response.

## Project structure

```text
app/
├── globals.css                 # Complete responsive visual design
├── layout.tsx                  # Metadata and root layout
└── page.tsx                    # Application entry route

src/
├── components/
│   ├── AssistantApp.tsx        # Main state, API flow, composer and shell
│   ├── Chat.tsx                # Empty/loading/conversation states
│   ├── LanguageBadge.tsx       # Detected-language display
│   ├── Message.tsx             # Messages, copy and answer playback
│   ├── SourceCard.tsx          # Retrieved-source metadata
│   └── VoiceButton.tsx         # MediaRecorder + Whisper upload flow
├── lib/
│   └── language.ts             # Lightweight UI fallback detection
├── services/
│   └── api.ts                  # `/health`, `/ask`, `/transcribe`, `/synthesize`
└── types/
    └── chat.ts                 # Shared frontend data contracts
```

## Requirements

- Node.js `>=22.13.0`
- npm
- the FastAPI AI backend running locally or at an HTTPS URL
- a recent Chrome, Edge, Firefox, or Safari browser

Microphone access works only on `localhost` or an HTTPS page.

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Expected terminal output includes a local Vite URL, normally:

```text
http://localhost:5173
```

Open it in the browser. The header should show `AI backend connected` when the backend `/health` endpoint is available. Otherwise it deliberately shows `Backend disconnected`.

## Configure the backend

Edit `.env.local`:

```env
NEXT_PUBLIC_AI_API_URL=http://localhost:8000
```

For deployment, set this to the deployed HTTPS FastAPI origin and rebuild the frontend. Do not commit `.env.local`, tokens, or API keys.

Do not include a trailing slash in the URL.

## Required backend API

### 1. Health check

```http
GET /health
```

Expected response:

```json
{
  "status": "ok"
}
```

Any HTTP `2xx` response is treated as connected.

### 2. Ask the RAG + adapted model

```http
POST /ask
Content-Type: application/json
```

Request:

```json
{
  "query": "Bro Chola empire pathi simple-ah explain pannunga.",
  "language_hint": "ta-en"
}
```

When the selector is `Auto`, `language_hint` is `null`.

Expected response:

```json
{
  "answer": "Chola Empire-na...",
  "language": "ta-en",
  "sources": [
    {
      "id": "chola-014",
      "title": "Chola Dynasty",
      "page": 12,
      "url": "https://example.org/chola",
      "snippet": "Optional retrieved passage preview"
    }
  ]
}
```

The frontend also accepts `detected_language` instead of `language`, and `chunk_id` instead of a source `id`.

Source titles, pages, and URLs must come from RAG metadata. The model should not generate source URLs by itself.

### 3. Whisper transcription

```http
POST /transcribe
Content-Type: multipart/form-data
```

Form fields:

```text
file: recording.webm or recording.mp4
language_hint: auto | ta | ta-en | ml | en  (optional)
```

Expected response:

```json
{
  "text": "சோழர்களைப் பற்றி சொல்லுங்க.",
  "language": "ta"
}
```

The frontend also accepts `transcription` instead of `text` and `detected_language` instead of `language`.

The browser automatically chooses WebM/Opus where supported and MP4 on compatible Safari versions. The backend should let FFmpeg decode either input.

### 4. Text-to-speech

```http
POST /synthesize
Content-Type: application/json
```

Request:

```json
{
  "text": "சோழப் பேரரசு...",
  "language": "ta"
}
```

The preferred response is audio bytes:

```http
Content-Type: audio/wav
```

The frontend also supports a JSON response:

```json
{
  "audio_url": "https://backend.example/audio/response-123.wav"
}
```

If this endpoint fails, the frontend attempts the browser Web Speech API using `ta-IN`, `ml-IN`, or `en-IN`. Availability and pronunciation depend on voices installed on the device.

## FastAPI CORS

When frontend and backend use different origins, FastAPI must allow the frontend origin:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://your-frontend-domain.example",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
```

Never use `allow_origins=["*"]` together with credentials in a production configuration.

## User flow

### Text

```text
Composer → POST /ask → RAG → Qwen + QLoRA adapter
         → answer + detected language + source metadata → frontend
```

### Voice

```text
MediaRecorder → POST /transcribe → Whisper → transcript
              → POST /ask → RAG → Qwen + adapter
              → optional POST /synthesize → audio playback
```

The frontend does not run or train Whisper in the browser. It records audio and sends it to the backend voice endpoint.

## Fixed demo scenarios

Use these exact prompts during rehearsal:

1. Tamil: `சோழர்களைப் பற்றி எளிமையாக சொல்லுங்க.`
2. Tanglish: `Bro Chola empire pathi simple-ah explain pannunga.`
3. Malayalam: `ചോള സാമ്രാജ്യത്തെക്കുറിച്ച് ലളിതമായി പറയൂ.`

For each test, verify:

- transcription matches the spoken request
- the detected-language badge is correct
- the answer stays in the expected language/style
- at least one relevant RAG source is displayed
- `Listen` plays either backend TTS or the documented browser fallback
- total latency is acceptable for the live demo

## Validation commands

```bash
npm run lint
npm test
```

`npm test` performs the production build, validates the deployable artifact, and checks rendered metadata.

Expected result:

```text
tests 1
pass 1
fail 0
```

## Common errors

### `Backend disconnected`

1. Open `http://localhost:8000/health` directly.
2. Check `NEXT_PUBLIC_AI_API_URL` in `.env.local`.
3. Restart the frontend after changing the environment file.
4. Check FastAPI CORS and whether both URLs use compatible HTTP/HTTPS schemes.

### Microphone permission denied

- allow microphone access in browser site settings
- use `localhost` during development or HTTPS after deployment
- close other applications exclusively using the microphone
- on iOS, test in Safari rather than an embedded in-app browser

### Whisper returns empty text

- record for at least one complete sentence
- confirm FFmpeg can decode the uploaded WebM or MP4 file
- inspect backend logs for audio duration and MIME type
- do not force Tamil for a Tanglish recording until measured tests show it helps

### Tamil or Malayalam appears as English

The backend-provided language is authoritative. The frontend includes only a lightweight script/Tanglish heuristic for immediate display. Return `ta`, `ta-en`, `ml`, or `en` from the backend for consistent routing.

### TTS does not speak

- inspect `/synthesize` for an HTTP error
- verify audio responses use an `audio/*` content type
- verify an `audio_url` is reachable from the browser
- install an OS/browser Tamil or Malayalam voice if relying on the fallback
- keep text output working even when audio fails

### Request timeout

The UI stops a request after 45 seconds. Keep the model loaded, pre-build the FAISS index, warm the inference process before the demo, and stream later only if the team has time to coordinate a streaming contract.

## GitHub checklist

Commit:

- `app/`, `src/`, `README.md`
- `package.json` and `package-lock.json`
- `.env.example`
- small public test fixtures where licensing permits

Do not commit:

- `.env.local` or API keys
- model weights or adapters
- recorded participant audio
- raw private documents
- generated FAISS indexes or large datasets unless the team intentionally uses Git LFS

## Team integration responsibility

- The RAG team owns retrieved chunks and trustworthy source metadata.
- The fine-tuning team owns the Qwen base + LoRA adapter inference result.
- The backend/integration owner combines them behind `/ask`.
- The frontend/voice team owns recording, user interaction, displaying returned language/sources, and audio playback.

Freeze these request/response fields before final integration. If the backend changes them, update only `src/services/api.ts`; UI components should not need rewriting.
