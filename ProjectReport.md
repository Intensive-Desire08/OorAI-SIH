# OorAI - Indigenous AI Platform
## Smart India Hackathon (SIH) PS29: Next-Generation Indigenous AI Foundation Models

**Project Type:** Localized Generative AI / NLP  
**Initial Deployment:** Tamil Nadu - Tamil, Tanglish, English, Malayalam  
**Core Technology:** Open-weight LLM + QLoRA + RAG  
**Primary Interface:** Voice-first conversational assistant  
**Scalability:** Reusable local knowledge packs for Indian languages

**Tagline:** "AI that understands where you come from."

---

## 1. Executive Summary

OorAI is a voice-first localized AI platform designed to understand regional languages as they are actually spoken in daily life. Initial implementation targets Tamil Nadu with support for Tamil, Tanglish (Tamil-English code-mixing), Malayalam, formal Tamil, colloquial Tamil, and culturally specific references.

The system combines:
- Open-weight LLM (Qwen-based) with parameter-efficient fine-tuning (QLoRA)
- Retrieval-Augmented Generation (RAG) with verified local data
- Speech recognition (Whisper)
- Text-to-speech for Tamil/Malayalam
- Source-grounded responses with citation

**Architecture Philosophy:** Separate language behavior from factual knowledge. Fine-tuning teaches HOW the model communicates. RAG supplies WHAT factual information to use.

This architecture is feasible for a 5-day SIH prototype with a clear path toward deployment in education, government services, libraries, and rural information kiosks.

---

## 2. Problem Statement

General-purpose AI assistants handle major languages but struggle with localized usage:
- Users speak colloquial Tamil, mix Tamil-English, use Tanglish text
- Regional information scattered across government documents, newspapers, archives, literature
- Generic assistants may translate words correctly while missing register, local context, cultural meaning
- Long Tamil documents difficult to search and understand
- Voice access critical for users more comfortable speaking than typing
- LLMs hallucinate when not grounded in verifiable local sources

---

## 3. Proposed Solution

OorAI acts as a local intelligence layer between user and curated regional knowledge ecosystem. Users speak or type naturally. System recognizes language/register, retrieves relevant local evidence, generates grounded response, optionally speaks answer back in Tamil.

Experience is conversational, not translation-centric:
- "Indha government scheme-ku college students eligible ah?"
- "இந்த திருக்குறளோட meaning simple Tamil-la explain pannu."
- "Explain this Tamil government circular in normal spoken Tamil."
- "Sangam literature na simple ah Tanglish-la sollu."

---

## 4. Key Innovation and Novelty

Not merely "fine-tuning an LLM on Tamil data." Positioning: reusable architecture for culturally grounded, voice-first, hyperlocal AI.

- **Code-mixed intelligence:** Tamil, Tanglish, English coexist in same conversation
- **Register adaptation:** Same answer produced in simple, formal, colloquial, or Tamil-English modes
- **Source-grounded local answers:** RAG retrieves evidence from curated regional documents before generation
- **Voice-first interaction:** Speech input/output improves accessibility and demo impact
- **Local knowledge packs:** Regional datasets replaced/expanded without retraining entire system
- **Potential private deployment:** Open-weight model enables future local/institutional hosting

---

## 5. Technical Architecture

### End-to-End Pipeline

```
USER
  ↓
Text OR Voice
  ↓
If Voice → Whisper Speech-to-Text
  ↓
Language Detection
  ↓
Query Router
  ↓
RAG Retrieval (Vector DB)
  ↓
Relevant Indian Knowledge + Sources
  ↓
Indian-adapted Qwen (Base + QLoRA adapter)
  ↓
Final Answer
  ↓
Text response + Source Citations
  ↓
Text-to-Speech (Tamil/Malayalam)
  ↓
Voice response + Display
```

### Pipeline Stages (Detailed)

| Step | Component | Description |
|------|-----------|-------------|
| 1 | User Input | Speaks or types in Tamil, Tanglish, Malayalam, or English |
| 2 | Speech-to-Text | Whisper converts voice input to text |
| 3 | Normalization | Language, code-mix, query normalization interprets request |
| 4 | Retriever | Searches Tamil/local knowledge base via semantic similarity |
| 5 | Context Injection | Relevant passages and metadata supplied to LLM |
| 6 | LLM Generation | Fine-tuned Qwen generates culturally/linguistically appropriate answer |
| 7 | Grounding Layer | Preserves source attribution, reduces unsupported claims |
| 8 | Response Display | Shows answer with supporting sources |
| 9 | TTS | Tamil/Malayalam text-to-speech produces spoken response |

---

## 6. Fine-Tuning vs. RAG: Critical Distinction

**Fine-tuning teaches:** HOW the model should behave
- Natural Tamil conversation
- Tanglish handling
- Malayalam conversation
- Indian conversational style
- Translation behavior
- Cultural response style
- Register control

**RAG provides:** WHAT factual information to use at inference time
- Chola history
- Pongal, Onam cultural information
- Tamil Nadu/Kerala geography
- Government circulars
- Tamil literature
- Verified Indian contextual information

| Component | Best Used For | OorAI Usage |
|-----------|---------------|-------------|
| Fine-tuning/QLoRA | Behavior, style, instruction following, code-mixed responses | Tamil/Tanglish conversation examples, register control, local phrasing |
| RAG | Large, changing, or source-sensitive knowledge | Newsletters, government circulars, literature, local history, verified reference documents |

**Do NOT dump all RAG documents into fine-tuning dataset automatically.**

### SQL Analogy for RAG

Traditional DB:
```
User question → SQL query → database → rows → application
```

RAG:
```
User question → embedding → vector similarity search → relevant document chunks → LLM → natural-language answer
```

Vector database performs semantic similarity retrieval, not traditional SQL.

---

## 7. Technology Stack

| Layer | Recommendation |
|-------|----------------|
| Foundation LLM | Qwen (start with Qwen3-0.6B for validation, scale up if needed) |
| Fine-tuning | QLoRA/LoRA using curated Tamil/Tanglish instruction data |
| Retrieval | Embedding model + vector database (FAISS/Qdrant/Chroma) + metadata filtering |
| Knowledge Base | Verified Tamil/local documents with source, date, category, location metadata |
| Speech Recognition | Whisper (existing model, no training needed) |
| Text-to-Speech | Indian-language TTS (AI4Bharat or reliable API fallback) |
| Backend | Python + FastAPI coordinating ASR, retrieval, LLM, TTS |
| Frontend | React web interface with microphone, transcript, answer, source cards |
| Training Framework | PyTorch, Hugging Face Transformers, PEFT, TRL |

**Development Stack:**
- Python
- PyTorch
- Hugging Face Transformers
- PEFT
- TRL
- QLoRA/LoRA
- Sentence Transformers (or suitable embedding model)
- FAISS/Qdrant/Chroma
- FastAPI
- React
- Whisper
- GitHub for source code

---

## 8. Dataset Strategy

Intentionally divided by purpose:

| Data Category | Primary Role |
|---------------|--------------|
| Tamil literature and reference works | Cultural/linguistic knowledge; primarily RAG |
| Tamil newspapers/newsletters | Modern terminology, local context; RAG with date metadata |
| Government documents | Civic information, schemes; RAG with strong source citation |
| Spoken Tamil transcripts | Conversational fine-tuning |
| Tanglish conversations | Code-mixed understanding and response generation |
| Tamil-English parallel examples | Cross-language consistency |
| Idioms, proverbs, regional vocabulary | Cultural/register adaptation |
| Instruction-response pairs | Primary supervised fine-tuning material |

### Fine-Tuning Dataset Requirements

Create high-quality conversational/instruction dataset teaching **behavior**, not just facts.

**Example Categories:**
- Tamil conversational
- Tanglish conversational
- Malayalam conversational
- Translation (Tamil ↔ Malayalam ↔ English)
- Indian cultural explanations
- Code-mixing
- Child-friendly explanations
- Technical explanations in Tamil/Tanglish
- Regional conversational style

**Format (JSONL):**
```json
{"messages":[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}
```

**Data Quality Requirements:**
- Source responsibly
- Verify language quality
- Avoid duplicates
- Prevent train/test leakage
- Balance Tamil/Malayalam/Tanglish
- Preserve natural conversational style
- Avoid synthetic garbage

**Dataset Size:** 1,000–5,000 high-quality examples (feasible for 5-day constraint)

**Split:**
- 80% train
- 10% validation
- 10% test (MUST remain unseen during training)

### RAG Dataset Requirements

**Initial Knowledge Focus:**

Tamil/Tamil Nadu:
- Chola history
- Tamil culture
- Pongal
- Tamil Nadu geography
- Tamil literature/history

Malayalam/Kerala:
- Kerala history
- Onam
- Kerala culture
- Kerala geography

General India:
- Indian history
- Indian geography
- Indian festivals
- Verified Indian contextual information

**Source Preferences:**
- Official government sources
- Reputable educational institutions
- Museums
- Archives
- Established public knowledge resources
- Appropriately licensed material

**Metadata Tracking:**
- Title
- Source
- URL
- Date accessed
- Language
- Topic
- Page/section

**Do NOT:**
- Blindly scrape random websites
- Ignore licensing
- Create enormous knowledge base

**Goal:** Small, high-quality, traceable corpus (5-10 high-quality documents to start)

---

## 9. Team Structure (6 People, 3 Teams)

### TEAM 1 — FINE-TUNING (2 people)

**Responsibilities:**
- Select base LLM (Qwen)
- Prepare fine-tuning dataset
- Prepare Tamil/Malayalam/Tanglish conversational examples
- QLoRA/LoRA fine-tuning
- Evaluate base model vs adapted model
- Produce final Indian-adapted model/adapter

**Output:** Indian-adapted Qwen model (base + LoRA adapter)

**Integration Contract:**
```
Input: system prompt + optional RAG context + user query
Output: generated response
```

### TEAM 2 — RAG (2 people)

**Responsibilities:**
- Collect reliable Indian knowledge sources
- Clean documents
- Chunk documents
- Generate embeddings
- Create vector database (FAISS/Qdrant)
- Retrieve relevant context
- Return retrieved context + source metadata
- Integrate retrieval with LLM

**Output:** Indian knowledge retrieval pipeline

**Integration Contract:**
```
INPUT: {"query": "Chola empire pathi simple-ah explain pannunga"}
OUTPUT: {
  "context": ["...", "..."],
  "sources": [{"title": "...", "page": 12}],
  "scores": [...]
}
```

### TEAM 3 — FRONTEND + VOICE (2 people)

**Responsibilities:**
- React/web frontend
- Microphone interaction
- Whisper speech-to-text
- Text-to-speech
- Language detection/integration
- API integration
- Final polished user experience

**Output:** Working user-facing AI application

**API Contract (Backend):**
```
POST /ask
Request: {"query": "Chola empire pathi explain pannunga"}
Response: {
  "answer": "...",
  "language": "ta-en",
  "sources": [{"title": "...", "page": 12}]
}
```

---

## 10. Directory Structure

```
indigenous-ai/
├── data/
│   ├── finetuning/
│   │   ├── train.jsonl
│   │   ├── validation.jsonl
│   │   └── test.jsonl
│   └── rag/
│       ├── documents/
│       └── processed/
│
├── finetuning/
│   ├── train.py
│   ├── evaluate.py
│   └── inference.py
│
├── rag/
│   ├── ingest.py
│   ├── chunker.py
│   ├── embedder.py
│   ├── indexer.py
│   ├── retrieve.py
│   ├── generate.py
│   └── query.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx
│   │   │   ├── VoiceButton.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── SourceCard.jsx
│   │   │   └── LanguageBadge.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
│
├── backend/
│   └── (FastAPI integration layer)
│
├── requirements.txt
├── README.md
└── .gitignore
```

**Do NOT commit to GitHub:**
- API keys
- .env files
- Huge model weights
- Huge raw datasets
- Generated checkpoints
- Unnecessary binary files

Model adapters hosted separately on Hugging Face Hub if appropriate.

---

## 11. Component Implementation Details

### 11.1 Fine-Tuning Pipeline

```
Base Qwen
  ↓
Indian instruction/conversation dataset
  ↓
Train/validation/test split
  ↓
Tokenizer
  ↓
4-bit quantized base model
  ↓
LoRA adapter configuration
  ↓
QLoRA/SFT training
  ↓
Saved adapter
  ↓
Inference
  ↓
Benchmark against original Qwen
```

**QLoRA Implementation:**
- 4-bit quantization (BitsAndBytesConfig)
- LoRAConfig: rank, alpha, dropout, target modules
- PEFT library
- SFTTrainer
- Hyperparameters: learning rate, batch size, gradient accumulation, epochs, sequence length

**Start with small settings, adjust based on GPU memory.**

**Baseline Requirement:** Run base Qwen against test questions BEFORE fine-tuning. Save outputs. This proves measurable improvement.

**Training Environment:** Google Colab, Kaggle, university GPU, or suitable cloud GPU.

**Deliverables:**
- train.py
- inference.py
- evaluate.py
- Dataset format documentation
- Trained LoRA adapter
- Benchmark results
- Integration instructions

### 11.2 RAG Pipeline

```
Indian documents
  ↓
Text extraction (PDF/text parsing)
  ↓
Cleaning (handle page breaks, headers, footers, broken Unicode, duplicates)
  ↓
Chunking (reasonable size + overlap, preserve metadata)
  ↓
Embedding model (multilingual, supports Tamil/Malayalam)
  ↓
Vector database (FAISS/Qdrant)
  ↓
Retriever (query embedding → vector search → top K results)
  ↓
Top-K relevant chunks with metadata
  ↓
Context construction for LLM prompt
  ↓
Qwen generates answer
  ↓
Answer + sources
```

**Chunking Strategy:**
- Cannot embed 200-page document as one vector
- Use reasonable chunk size and overlap
- Preserve metadata per chunk:
  ```json
  {
    "text": "...",
    "source": "...",
    "title": "...",
    "page": "...",
    "language": "...",
    "topic": "..."
  }
  ```

**Embeddings:**
- Convert sentence/document chunk to semantic vector
- Use multilingual embedding model supporting Tamil/Malayalam
- Test retrieval quality with actual Tamil/Tanglish/Malayalam queries

**Vector Database (FAISS):**
- Cosine similarity / inner product
- Nearest-neighbor search
- Maintain mapping: vector ID → chunk → source → page/section

**Retrieval:**
```
query → query embedding → vector search → top K results (start K=3-5)
```

**Return:**
```json
{
  "chunks": [...],
  "sources": [...],
  "scores": [...]
}
```

**RAG Prompt Template:**
```
SYSTEM: Answer using supplied context. If context insufficient, do not fabricate facts.

CONTEXT: [retrieved chunks]

USER: [user question]
```

**Source Citations:** Every answer exposes source documents used:
```
Answer: ...

Sources:
1. Chola History — page 12
2. Tamil Historical Archive — section 4
```

**Retrieval Confidence:**
```
Question → retrieve → similarity score
If sufficiently relevant: use retrieved context
If not relevant: do not inject irrelevant context
```

Allow model to answer general questions. For factual questions requiring reliable grounding where evidence unavailable, system should state insufficient reliable information.

**Do not blindly use RAG for every question.**

**RAG API Endpoint (FastAPI):**
```
POST /retrieve
Input: {"query": "..."}
Output: {"context": "...", "sources": [...]}
```

**Deliverables:**
- Ingestion code
- Chunking code
- Embedding code
- Vector index creation
- Retrieval code
- Metadata mapping
- RAG prompt template
- Test queries/results
- Source display
- API interface
- Documentation

### 11.3 Voice Pipeline

```
Voice input
  ↓
Microphone recording
  ↓
Whisper (existing model, no training)
  ↓
Transcribed text
  ↓
Language detection
  ↓
RAG + Indian-adapted Qwen
  ↓
Text answer
  ↓
TTS (Indian-language or API fallback)
  ↓
Audio response
  ↓
Browser playback
```

**Whisper Implementation:**
- Use existing Whisper model
- Do NOT train Whisper
- Test with Tamil, Tanglish, Malayalam, English
- Measure: transcription quality, latency, language handling

**Language Detection:**
Display detected language:
- "Detected: Tamil"
- "Detected: Tamil + English (Tanglish)"
- "Detected: Malayalam"

Investigate if Whisper provides sufficient language information. Do not build unnecessarily complicated classifier if it risks 5-day deadline.

**Text-to-Speech:**
- Investigate Indian-language/open-source TTS (AI4Bharat) first
- If local TTS impractical within 5 days, use reliable API fallback
- Test: Tamil, Malayalam, English
- Do NOT spend entire project training new TTS model if Tanglish TTS quality poor

**Priority:**
1. Correct model response
2. Natural language
3. Reliable retrieval
4. Then voice quality

**Error Handling:**
- Microphone permission denied
- Empty input
- Whisper failure
- Backend unavailable
- RAG failure
- TTS failure
- Timeout
- Unsupported language

Application must not crash during SIH demo.

**Deliverables:**
- React frontend
- Voice recording
- Whisper integration
- Language display
- TTS integration
- Backend API integration
- Source display
- Polished UI
- Demo scenarios
- Setup instructions

### 11.4 Frontend UI Design

**Screen Layout:**
```
INDIGENOUS AI
"Your Indian AI Assistant"

[ 🎤 Speak ]

Detected: Tamil + English

User: "Bro Chola empire pathi explain pannunga"

AI: "Chola empire-na..."

Sources:
📄 Chola History
📄 Tamil Historical Archive

[ 🔊 Play response ]
```

**Components:**
- Chat input
- Send button
- Microphone button
- Conversation history
- AI response card
- Loading state
- Error state
- Source cards
- Detected-language badge
- Audio playback

Modern and polished but not overloaded. First make it work, then polish.

---

## 12. Language Handling Examples

System should handle:

**Tamil:**
```
"சோழர்களைப் பற்றி சொல்லுங்க."
```

**Tanglish:**
```
"Bro Chola empire pathi simple-ah explain pannunga."
```

**Malayalam:**
```
"ചോള സാമ്രാജ്യത്തെക്കുറിച്ച് പറയൂ."
```

**English:**
```
"Explain the Chola Empire simply."
```

Focus on natural code-mixed communication, not only textbook language.

---

## 13. Evaluation Strategy

Essential to demonstrate measurable improvement.

### Comparison Required

1. Base Qwen
2. QLoRA fine-tuned Qwen
3. QLoRA + RAG
4. Complete system where appropriate

### Benchmark Categories

- Tamil
- Tanglish
- Malayalam
- Cultural questions
- Translation
- Code-mixed communication
- Conversational ability

### Metrics

- Answer correctness
- Language quality
- Cultural correctness
- Translation quality
- Retrieval relevance
- Retrieval accuracy
- Hallucination rate
- Latency
- Speech transcription accuracy
- Register-control accuracy (simple, formal, colloquial, mixed modes)
- Citation correctness
- Percentage of factual claims supported by sources

**NEVER invent benchmark numbers. Only report experimentally measured results.**

If automated metrics unreliable for category, design human evaluation rubric.

### RAG Test Set

Test:
- Tamil queries
- Tanglish queries
- Malayalam queries
- English queries
- Questions whose answers definitely exist
- Questions whose answers do not exist

Measure:
- Retrieval relevance
- Retrieval accuracy
- Top-k usefulness
- Failure cases

Do not evaluate only by asking whether final answer "sounds good."

---

## 14. Core Features for SIH MVP

Prioritize small number of highly reliable features:

1. Tamil/Tanglish/Malayalam/English text and voice input
2. Fine-tuned response layer demonstrating noticeably better local-language behavior
3. RAG over curated and verified Tamil knowledge collection
4. Tamil/Malayalam speech output
5. Visible source attribution for retrieved factual answers
6. Answer-style switching: Simple Tamil, Formal Tamil, Colloquial Tamil, Tamil-English

---

## 15. High-Impact Demonstration Flow (90 seconds)

Prove multiple capabilities rather than showing many unfinished features:

1. Judge asks cultural/literary question in natural spoken Tamil or Tanglish
2. OorAI transcribes, retrieves relevant information, answers naturally in Tamil
3. User asks for same explanation in English or Tanglish without restarting conversation
4. User asks question about uploaded Tamil government document or local scheme
5. OorAI retrieves exact relevant section, gives simplified answer, displays source, reads answer aloud

**Demonstrates:** Speech recognition, code-mixing, contextual conversation, RAG, source grounding, register adaptation, Tamil speech synthesis.

### Prepared Demo Scenarios

**Demo 1 — Tamil:**
Voice: "சோழர்களைப் பற்றி சொல்லுங்க."
Expected: Tamil response + sources + audio

**Demo 2 — Tanglish:**
Voice: "Bro Chola empire pathi simple-ah explain pannunga."
Expected: Tanglish-aware response + relevant RAG sources

**Demo 3 — Malayalam:**
Voice: "ചോള സാമ്രാജ്യത്തെക്കുറിച്ച് പറയൂ."
Expected: Malayalam response + relevant context

Keep test cases fixed for reliable demo.

---

## 16. Use Cases

- **Government services:** Simplify schemes, circulars, public information
- **Education:** Explain Tamil literature, history, academic material at different difficulty levels
- **Libraries and archives:** Conversational search over regional collections
- **Rural/community kiosks:** Voice-based access to verified information
- **Local news intelligence:** Search curated regional news collections with date/source awareness
- **Institutional assistants:** Private knowledge bases for colleges, municipalities, organizations

---

## 17. Scalability Beyond Tamil Nadu

Tamil positioned as first deployment, not platform limit. Same core architecture supports Malayalam, Kannada, Telugu, Marathi, other Indian languages by replacing/extending:
- Language adapter
- Speech components
- Local knowledge pack

Transforms project from single Tamil chatbot into framework for localized AI systems across India: one reusable intelligence architecture with region-specific language and knowledge layers.

If time permits during hackathon, Hindi can be added.

---

## 18. Feasibility Assessment

| Area | Assessment | Remarks |
|------|-----------|---------|
| LLM customization | High | LoRA/QLoRA makes domain and style adaptation practical |
| Tamil knowledge retrieval | High | RAG built from curated documents without full model retraining |
| Tamil voice input/output | High | Existing Indic ASR/TTS models provide strong starting point |
| Tanglish handling | Medium-High | Requires careful data collection, normalization, evaluation |
| Real-time experience | Medium-High | Achievable with small/quantized model and optimized pipeline |
| Fully offline deployment | Medium | Possible later; hardware requirements depend on model size |
| Hackathon MVP | High | Focused end-to-end prototype realistic |

---

## 19. Risks and Mitigation

| Risk | Mitigation |
|------|-----------|
| Poor or noisy local data | Curate sources, remove duplicates, preserve metadata, create trusted-source hierarchy |
| Hallucination | Use RAG, citations, confidence/abstention rules, restrict high-stakes answers to verified evidence |
| Copyright/data licensing | Use public-domain, openly licensed, authorized, appropriately permitted material; store source/license metadata |
| Outdated news or policies | Keep dynamic content in RAG, attach publication/effective dates rather than encoding through fine-tuning |
| Weak Tanglish performance | Create realistic code-mixed instruction data, test multiple spellings of common Tamil words |
| Slow voice pipeline | Use streaming where possible, smaller models, caching, quantization |
| Over-scoped prototype | Deliver six core MVP features before adding location awareness or additional languages |

---

## 20. 5-Day Development Roadmap

### Phase-by-Phase Priority

**IMPORTANT:** All three teams work simultaneously. Do NOT wait for another team to finish before starting. Each team creates working independent component, then integrates through clearly defined interfaces.

### TEAM 1 — Fine-Tuning Priority

**DAY 1:** Qwen running + tiny dataset + baseline
**DAY 2:** First successful QLoRA training
**DAY 3:** Inference + RAG integration compatibility
**DAY 4:** Improve dataset/training + evaluation
**DAY 5:** Final benchmark + documentation + model upload

If training fails, immediately troubleshoot instead of spending hours polishing code.

### TEAM 2 — RAG Priority

**DAY 1:** 5-10 high-quality documents + extraction + chunking
**DAY 2:** Embeddings + FAISS + basic retrieval
**DAY 3:** Qwen integration + context generation
**DAY 4:** Source citations + confidence/fallback + retrieval testing
**DAY 5:** Optimization + documentation + final integration

### TEAM 3 — Frontend + Voice Priority

**DAY 1:** Basic React UI + microphone + backend mock/interface
**DAY 2:** Whisper + API integration
**DAY 3:** Actual AI backend integration + TTS
**DAY 4:** Polish UI + language/source display + error handling
**DAY 5:** Freeze features and rehearse exact demo

### High-Level Phases

**Phase 1 - Foundation:** Select model, collect licensed/usable Tamil sources, build document ingestion, baseline RAG

**Phase 2 - Language Adaptation:** Create instruction dataset, QLoRA fine-tune for Tamil/Tanglish/register behavior

**Phase 3 - Voice:** Integrate Tamil ASR and TTS; measure transcription and end-to-end latency

**Phase 4 - Grounding:** Add citations, metadata filtering, source/date display, refusal for unsupported factual claims

**Phase 5 - Demo Polish:** Build UI, pre-load strong demo collections, test noisy speech, rehearse 90-second judging flow

**Phase 6 - Expansion (post-hackathon):** Add local knowledge packs, location awareness, more Indian languages, optional private/offline deployment

---

## 21. Development Strategy and Rules

### DO NOT Attempt:
- Training foundation model from scratch
- Huge models
- 10+ languages
- Massive datasets
- Custom STT training
- Custom TTS training
- Production-scale infrastructure
- Mobile + web simultaneously
- Unnecessary agent systems

### Prioritize:
1. Working QLoRA experiment
2. Working RAG
3. Working text-based end-to-end pipeline
4. Whisper
5. TTS
6. Integration
7. Benchmark
8. Polished frontend

### Integration Requirements

**Frontend → Backend/API → AI pipeline**

RAG exposes: `query → retrieved context + sources`

Fine-tuning exposes: `prompt/context → model response`

Voice exposes: `audio → text` and `text → audio`

Final integration layer combines them.

### Development Environment

Use VS Code/GitHub for development. GPU training on Google Colab/Kaggle/university GPU/suitable cloud GPU.

Do not over-engineer. Goal is working SIH prototype with genuine model adaptation and measurable evaluation.

---

## 22. SIH Pitch

"OorAI is a voice-first local intelligence platform that understands how communities actually speak, retrieves knowledge from trusted regional sources, and responds in a culturally appropriate form. We begin with Tamil Nadu, supporting Tamil, Tanglish, and English, and design the same architecture to scale into localized AI systems across India."

---

## 23. Final Recommendation

Concept is technically feasible and suitable for SIH prototype. Strongest implementation is NOT generic Tamil chatbot or model trained indiscriminately on local documents.

**Recommended Solution:** Hybrid system where:
- Customized open-weight LLM handles language behavior
- RAG supplies verified local knowledge
- Voice layer makes system accessible and demonstrably different

**Focus on execution quality:**
- Carefully curated knowledge base
- Small but high-quality instruction dataset
- Reliable Tamil/Tanglish voice interaction
- Visible source grounding
- Polished live demonstration

If these elements work consistently, OorAI presents strong combination of technical depth, social relevance, scalability, and practical usability.

---

## 24. Reference Technologies

- **Google AI for Developers** - Gemma documentation and model tuning guidance
- **Meta Llama** - Official fine-tuning and customization documentation
- **Qwen** - Open-weight LLM base model
- **AI4Bharat** - Indic language speech recognition, speech datasets, Indic TTS resources
- **Retrieval-Augmented Generation (RAG)** - Semantic/vector retrieval combined with LLM generation
- **LoRA/QLoRA** - Parameter-efficient fine-tuning methods for adapting open-weight LLMs
- **PEFT** - Parameter-Efficient Fine-Tuning library
- **Hugging Face Transformers** - LLM training and inference
- **Whisper** - Speech-to-text for multiple languages including Indian languages
- **FAISS** - Vector similarity search for RAG
- **FastAPI** - Backend API framework
- **React** - Frontend framework

---

## END OF REPORT

**Document Purpose:** AI reference for OorAI SIH project implementation. Contains exhaustive technical specifications, architecture decisions, team responsibilities, integration contracts, and 5-day development strategy.
