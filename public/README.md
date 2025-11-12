# LBD Style Guide Service

A server-accessible digital twin endpoint for accessing stylistic patterns, tone descriptors, and writing samples for LLM conditioning and content generation "in Lucas's voice."

## Overview

The LBD Style Guide Service provides REST API and MCP (Model Context Protocol) endpoints to query and manage a personal digital twin—a collection of writing samples, audio clips, videos, and images that represent an individual's unique style, tone, and communication patterns.

## Features

- **Multimodal Sample Management**: Upload and manage text, audio, video, and image samples
- **Semantic Search**: Query samples by style/tone using embeddings
- **Style Analysis**: Get inferred style descriptors (brevity, humor, cadence, etc.)
- **REST API**: Full API endpoints for uploading, querying, and listing samples
- **MCP Integration**: Expose style guide via Model Context Protocol for Claude and other LLMs
- **PostgreSQL Storage**: Structured metadata with vector embeddings for similarity search
- **S3 Media Storage**: Scalable media file storage with CDN support

## Tech Stack

- **Backend**: Next.js 16 with TypeScript
- **Database**: PostgreSQL (AWS RDS) with pgvector extension
- **Storage**: AWS S3
- **Embeddings**: OpenAI's text-embedding-3-small
- **Deployment**: Vercel (API + Dashboard)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 12+ with pgvector extension
- AWS S3 bucket
- OpenAI API key

## Installation

1. **Clone the repository**
```bash
git clone https://github.com/lucasdickey/lbd-style-guide-service.git
cd lbd-style-guide-service
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your credentials:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/lbd_style_guide
OPENAI_API_KEY=sk-xxx
API_KEY_SECRET=your-secure-api-key
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=lbd-style-guide-samples
DEFAULT_USER_ID=your-user-uuid
```

4. **Initialize the database**
```bash
npm run db:init
```

5. **Start the development server**
```bash
npm run dev
```

Visit http://localhost:3000 to access the dashboard.

## API Endpoints

All API endpoints require the `x-api-key` header:
```bash
curl -H "x-api-key: YOUR_API_KEY" https://api.yourdomain.com/api/twin/...
```

### `POST /api/twin/upload`
Upload a new sample to the style guide.

**Request (JSON)**
```json
{
  "type": "text",
  "context": "Personal essay about tech trends",
  "content": "Lorem ipsum...",
  "tags": ["technology", "analysis"]
}
```

**Request (multipart/form-data)**
- `type`: text | audio | video | image
- `file`: Binary file (required for audio/video/image)
- `context`: Optional description
- `tags`: Comma-separated or JSON array

**Response**
```json
{
  "id": "uuid",
  "status": "success",
  "message": "Sample ingested and embedded",
  "sample": {
    "id": "uuid",
    "type": "text",
    "url": "s3://bucket/path",
    "tags": ["technology"]
  }
}
```

### `POST /api/twin/query`
Query for semantically similar samples.

**Request**
```json
{
  "prompt": "Write about AI startups in my style",
  "limit": 5,
  "type": "text",
  "tags": ["ai"]
}
```

**Response**
```json
{
  "query": "Write about AI startups in my style",
  "results": [
    {
      "id": "uuid",
      "type": "text",
      "url": "s3://bucket/path",
      "context": "...",
      "tags": ["ai", "startups"],
      "similarity": "0.856",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

### `GET /api/twin/style`
Get the inferred style descriptor.

**Response**
```json
{
  "persona": "lucas",
  "preferred_tone": "analytical, conversational",
  "persona_tags": ["analytical", "concise", "technical"],
  "style": {
    "brevity": 0.7,
    "humor": 0.4,
    "cadence": "mid-length sentences, varied rhythm"
  },
  "sample_statistics": {
    "total": 42,
    "by_type": {
      "text": 30,
      "audio": 8,
      "video": 4
    }
  },
  "examples": [...]
}
```

### `GET /api/twin/samples`
List all samples with pagination and filtering.

**Query Parameters**
- `type`: Filter by type (text, audio, video, image)
- `tags`: Comma-separated tags to filter
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Response**
```json
{
  "samples": [
    {
      "id": "uuid",
      "type": "text",
      "url": "s3://bucket/path",
      "context": "...",
      "tags": ["technology"],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### `GET /api/health`
Health check endpoint.

**Response**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "lbd-style-guide-service",
  "version": "1.0.0"
}
```

## Dashboard

Access the web dashboard at `/dashboard` to upload samples:

1. Select sample type (text, audio, video, image)
2. Upload content or file
3. Add context and tags
4. Submit to ingest and generate embeddings

## MCP Integration

The service exposes a Model Context Protocol endpoint at `/.well-known/ai-plugin.json` for integration with Claude and other LLM clients.

To use with Claude:
1. Add the `.well-known/ai-plugin.json` URL to your Claude configuration
2. Tools become available: `query_style_guide`, `get_profile`, `get_style_descriptor`, `sample_content`

## Database Schema

### `user_profile`
Stores user/persona information and settings.

### `samples`
Stores metadata for each sample (text, audio, video, image) with embeddings.

### `metadata`
Additional metadata for samples (source, license, language, mood, duration, file size).

## Development

### Build
```bash
npm run build
```

### Run Production
```bash
npm start
```

### Lint
```bash
npm run lint
```

## Deployment

### Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### AWS RDS Setup

1. Create PostgreSQL instance in RDS
2. Install pgvector extension:
```sql
CREATE EXTENSION vector;
```
3. Set `DATABASE_URL` environment variable

### S3 Setup

1. Create S3 bucket
2. Set bucket lifecycle rules for cost optimization
3. Configure CORS for dashboard access
4. Add credentials to environment variables

## Security Considerations

- API key authentication required for all endpoints
- Rate limiting recommended for production
- No PII stored (style data is anonymized)
- All media files stored in S3 (not in database)
- Environment variables for sensitive data
- HTTPS required in production

## Future Enhancements

- [ ] Fine-tuning on style guide samples for custom LLM models
- [ ] Multi-user support with separate style profiles
- [ ] Audio transcription via Whisper v3 Turbo
- [ ] Real-time collaboration on sample annotations
- [ ] Export style guide as JSON/YAML
- [ ] A/B testing for style variations
- [ ] Advanced analytics and usage metrics
- [ ] Versioning support (twin_v1, twin_v2, etc.)
- [ ] Synthetic style expansion (LLM-generated examples)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License

## Support

For issues or questions:
- Open a GitHub issue: https://github.com/lucasdickey/lbd-style-guide-service/issues
- Check the PLAN.md for architecture details
- Review API documentation above

## Roadmap

See [PLAN.md](./PLAN.md) for detailed project planning, architecture decisions, and future extensions.
