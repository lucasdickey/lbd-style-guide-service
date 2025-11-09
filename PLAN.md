# PLAN.md: LBD Style Guide Service

## Project: LBD Style Guide Service Endpoint
**Purpose:** Create a server-accessible representation of Lucas's writing, speaking, and stylistic patterns for LLM conditioning and contextual use via REST and MCP endpoints.

**PII Policy:** No personally identifiable information will be stored; all data are stylistic and anonymized.

---

## 1. Goal Overview
This project establishes a **Style Guide Service Endpoint** that stores and serves multimodal data—text, audio, video, and image samples—reflecting a single individual's expressive style.

The service provides both REST and MCP interfaces so LLMs can generate or complete content "in Lucas's voice" for writing, speaking, or coding tasks.

---

## 2. High-Level Architecture

### Core Components
- **Backend:** Next.js API routes (deployed via Vercel) or lightweight FastAPI service.
- **Database:** PostgreSQL (AWS RDS) for structured metadata and asset references.
- **Storage:** S3 for binary media (audio, video, image) and optionally GitHub for text-only samples.
- **Access:** REST API + MCP endpoint with optional API-key auth.
- **Embeddings Layer:** Optional Pinecone or pgvector for stylistic semantic search.

### Stack Summary
| Layer | Tool / Platform | Notes |
|-------|------------------|-------|
| API / MCP | Next.js | Zero-config serverless API routes |
| Database | AWS RDS (Postgres) | Stores structured metadata |
| Storage | AWS S3 | Raw media and derived embeddings |
| Semantic Layer | Pinecone / pgvector | Enables search by tone or topic |
| Front-End | Next.js dashboard | Upload interface for samples |

---

## 3. Data Schema

### Table: `user_profile`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Alias (non-PII identifier) |
| `persona_tags` | TEXT[] | Labels like "analytical", "humorous" |
| `default_tone` | TEXT | Default tone descriptor |
| `default_length` | INTEGER | Typical sentence length or brevity score |

### Table: `samples`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `type` | ENUM(`text`, `audio`, `video`, `image`) | Content modality |
| `url` | TEXT | S3 or GitHub asset link |
| `context` | TEXT | Origin or short description |
| `tags` | TEXT[] | Topic or stylistic labels |
| `embedding_vector` | VECTOR | Optional semantic embedding |
| `created_at` | TIMESTAMP | Creation timestamp |

### Table: `metadata`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `source` | TEXT | "podcast", "essay", etc. |
| `license` | TEXT | Usage rights or license type |
| `language` | TEXT | Language code |
| `mood` | TEXT | Optional affective state |

---

## 4. Data Input & Processing

1. **Upload Dashboard**
   - Built in Next.js with optional Supabase Auth.
   - Fields: `type`, `context`, `tags`, and privacy flag.

2. **Preprocessing**
   - Audio/Video → Transcribe via **Whisper v3 Turbo (Cloudflare Workers)**.
   - Text → Direct ingestion, normalized.
   - Images → Store metadata and optionally create CLIP embedding.

3. **Embedding Generation**
   - Use `text-embedding-3-small` or similar.
   - Store embedding vectors in Postgres column `samples.embedding_vector`.

---

## 5. API Endpoints

### `POST /api/twin/query`
Retrieve stylistically or semantically similar examples.

**Request**
```json
{
  "prompt": "Write about AI startups in my style",
  "limit": 5
}
```

**Response**
```json
{
  "results": [
    {"type": "text", "url": "/samples/ai-reflections.md", "tags": ["ai","startups"]},
    {"type": "audio", "url": "/samples/podcast-snippet.mp3"}
  ]
}
```

### `POST /api/twin/upload`
Upload a new sample to the style guide.

**Request**
```json
{
  "type": "text",
  "context": "Personal essay about tech trends",
  "content": "...",
  "tags": ["technology", "analysis"]
}
```

**Response**
```json
{
  "id": "uuid",
  "status": "success",
  "message": "Sample ingested and embedded"
}
```

### `GET /api/twin/samples`
List all samples with optional filtering.

**Query Parameters**
- `type`: Filter by content type (text, audio, video, image)
- `tags`: Comma-separated tags to filter
- `limit`: Number of results (default: 20)

**Response**
```json
{
  "samples": [
    {"id": "uuid", "type": "text", "tags": ["ai", "startups"], "created_at": "..."}
  ],
  "total": 42
}
```

### `GET /api/twin/profile`
Retrieve the style guide profile and persona information.

**Response**
```json
{
  "name": "lbd",
  "persona_tags": ["analytical", "concise", "technical"],
  "default_tone": "professional-casual",
  "default_length": "medium"
}
```

### `GET /api/twin/style`
Return a JSON descriptor of the style inferred from samples.

**Response**
```json
{
  "persona": "lucas",
  "preferred_tone": "analytical, conversational",
  "style": {
    "brevity": 0.7,
    "humor": 0.4,
    "cadence": "mid-length sentences, varied rhythm"
  },
  "examples": [
    {"type": "text", "url": "/samples/writing/ai-editorial.md"},
    {"type": "audio", "url": "/samples/audio/interview-clip.mp3"}
  ]
}
```

---

## 6. MCP Endpoint

### Overview
Expose the style guide via **Model Context Protocol (MCP)**, allowing Claude and other LLMs to access style information programmatically.

The MCP manifest is served at: `https://yourdomain.com/.well-known/ai-plugin.json`

### Example MCP Manifest
```json
{
  "schema_version": "v1",
  "name_for_human": "Lucas Digital Twin",
  "name_for_model": "digital_twin",
  "description_for_model": "Provides examples and stylistic context for content generation in the user's voice",
  "api": { "url": "https://yourdomain.com/api/twin" },
  "auth": { "type": "none" }
}
```

### Tools Exposed via MCP
1. `query_style_guide` - Search for samples matching a style/tone query
2. `get_profile` - Retrieve persona and tone information
3. `get_style_descriptor` - Fetch inferred style metrics and examples
4. `sample_content` - Fetch raw content from a specific sample

---

## 7. Deployment Workflow

1. **Deploy API routes + dashboard on Vercel**
   - Serverless Next.js deployment with automatic scaling
   - Environment variable configuration for API keys and database URLs

2. **Connect AWS RDS (Postgres) via environment variables**
   - Use connection pooling for optimal performance
   - Store connection string securely in Vercel environment

3. **Use S3 for storage with lifecycle rules to minimize cost**
   - Set expiration policies for old media files
   - Enable CDN caching for static assets

4. **Optional GitHub Action: sync markdown/text → S3 + metadata table**
   - Automated pipeline for text sample ingestion
   - Updates sample metadata in Postgres automatically

5. **Generate embeddings in background jobs or Vercel Edge Functions**
   - Use Vercel Edge Functions for real-time embedding generation
   - Or schedule background jobs via cron for batch processing

6. **Host MCP manifest in `.well-known/` directory**
   - Serve at `https://yourdomain.com/.well-known/ai-plugin.json`
   - Makes the service discoverable to Claude and other MCP clients

---

## 8. Example Directory Structure

```
lbd-style-guide-service/
├── pages/
│   ├── api/
│   │   ├── twin/
│   │   │   ├── query.ts
│   │   │   ├── style.ts
│   │   │   └── mcp.ts
│   │   └── index.tsx
│   └── (dashboard routes)
├── lib/
│   ├── db.ts
│   ├── embeddings.ts
│   └── s3.ts
├── components/
│   ├── UploadForm.tsx
│   └── SampleList.tsx
├── scripts/
│   └── syncMetadata.js
├── public/
│   └── .well-known/
│       └── ai-plugin.json
├── package.json
└── README.md
```

---

## 9. Example Data Pipeline

1. **Upload:** Audio → Whisper transcription → embedding generated → store metadata + file path in Postgres

2. **Query:** Client sends request → API retrieves nearest samples + metadata → returns JSON payload

3. **Consume:** External agent (IDE, chat, productivity app) uses response to adapt output tone and diction

---

## 10. Future Extensions

- **Retrieval Integration:** LangChain / LlamaIndex for contextual queries
- **Versioning:** `twin_v1`, `twin_v2`, etc. for evolution tracking
- **Synthetic Style Expansion:** LLM creates new examples in style for training
- **Auth Layer:** API key or JWT headers for secure external calls
- **Analytics:** Log queries for style usage metrics and insights

---

## 11. Development Phases

### Phase 1: Foundation (Week 1-2)
- Set up Next.js project structure
- Create PostgreSQL schema and migrations
- Implement basic authentication (API keys)
- Build sample upload endpoint
- Deploy database to AWS RDS

### Phase 2: Core API (Week 2-3)
- Implement `/api/twin/query` endpoint
- Integrate OpenAI embeddings
- Build sample retrieval and filtering
- Create `/api/twin/upload` endpoint
- Set up S3 integration for media storage

### Phase 3: Dashboard (Week 3-4)
- Build Next.js UI for uploading samples
- Create sample management interface
- Implement profile configuration page
- Add basic analytics (sample count, usage stats)

### Phase 4: MCP & Advanced Features (Week 4-5)
- Develop MCP server implementation
- Integrate with Claude via MCP
- Add semantic search refinements
- Implement caching layer (Redis)
- Add rate limiting and monitoring

### Phase 5: Polish & Deployment (Week 5-6)
- End-to-end testing
- Performance optimization
- Documentation and examples
- Deploy to production (Vercel for API, RDS for DB)
- Set up CI/CD pipeline

---

## 12. Key Implementation Decisions

### Tech Stack Rationale
- **Next.js**: Serverless deployment, built-in API routes, easy Vercel integration
- **PostgreSQL**: Structured data with vector support (pgvector extension)
- **S3**: Scalable media storage with CDN capabilities
- **OpenAI Embeddings**: Industry-standard semantic search

### Security Considerations
- API key authentication for all endpoints
- Rate limiting to prevent abuse
- Input validation on all uploads
- No PII storage (anonymous tagging only)
- CORS configuration for dashboard access

### Performance Optimization
- Embeddings pre-computed and cached
- Pagination on list endpoints
- Optional Redis caching for frequent queries
- CDN-served media assets

---

## 13. Success Criteria

- [x] PLAN.md created and documented
- [ ] Next.js project initialized with proper structure
- [ ] PostgreSQL schema implemented
- [ ] Upload endpoint functional (text, audio, video, image)
- [ ] Query endpoint with semantic search working
- [ ] Dashboard UI for sample management
- [ ] MCP server implementation complete
- [ ] API key authentication working
- [ ] Deployed to production
- [ ] Documentation complete

---

## 14. Notes & Additional Considerations

### Potential Enhancements Beyond MVP
- Fine-tuning on style guide samples for custom LLM models
- Multi-user support with separate style profiles
- Audio/video streaming optimization
- Real-time collaboration on sample annotations
- Export style guide as JSON/YAML for version control
- A/B testing for style variations
- Integration with more LLM providers (Claude, Anthropic, etc.)

### Open Questions for Future Iterations
- Should we support versioning of samples?
- Do we need approval workflows for new samples?
- Should samples have expiration dates?
- How do we handle style evolution over time?

---

## 15. Getting Started

Clone and set up the project:

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run migrations
npm run migrate

# Start development server
npm run dev
```

Access the dashboard at `http://localhost:3000` and API at `http://localhost:3000/api`.

