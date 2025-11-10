# LBD Style Guide Service - Setup Guide

## Quick Start

Follow these steps to get the LBD Style Guide Service running locally.

### 1. Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **OpenAI API Key** - [Get one](https://platform.openai.com/api-keys)
- **AWS Account** (for production, optional for local testing)

### 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/lucasdickey/lbd-style-guide-service.git
cd lbd-style-guide-service

# Install dependencies
npm install
```

### 3. Create Database

```bash
# Create PostgreSQL database
createdb lbd_style_guide

# Connect to database and enable pgvector
psql lbd_style_guide
```

Then in psql:
```sql
CREATE EXTENSION vector;
\q
```

### 4. Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Database (local PostgreSQL)
DATABASE_URL=postgresql://localhost:5432/lbd_style_guide

# OpenAI API
OPENAI_API_KEY=sk-your-key-here

# API Security
API_KEY_SECRET=your-secure-random-key

# AWS (optional, required for production)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=lbd-style-guide-samples

# Default user (for testing)
DEFAULT_USER_ID=00000000-0000-0000-0000-000000000000

# Server
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=your-secure-random-key
```

### 5. Initialize Database Schema

```bash
npm run db:init
```

This will create the `user_profile`, `samples`, and `metadata` tables.

### 6. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 7. Access the Dashboard

Open browser and visit:
- **Home**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Health Check**: http://localhost:3000/api/health

## Testing the API

### Test Health Check

```bash
curl http://localhost:3000/api/health
```

### Upload a Text Sample

```bash
curl -X POST http://localhost:3000/api/twin/upload \
  -H "x-api-key: your-secure-random-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "context": "Test essay about technology",
    "content": "AI is transforming how we work. Machine learning enables new possibilities...",
    "tags": ["technology", "ai"]
  }'
```

### Query Samples

```bash
curl -X POST http://localhost:3000/api/twin/query \
  -H "x-api-key: your-secure-random-key" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write about artificial intelligence",
    "limit": 5
  }'
```

### Get Style Descriptor

```bash
curl http://localhost:3000/api/twin/style \
  -H "x-api-key: your-secure-random-key"
```

### List Samples

```bash
curl "http://localhost:3000/api/twin/samples?limit=10&offset=0" \
  -H "x-api-key: your-secure-random-key"
```

## Common Issues

### PostgreSQL Connection Error

**Problem**: `error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL if stopped
brew services start postgresql  # macOS
# or
sudo systemctl start postgresql  # Linux
```

### pgvector Extension Not Found

**Problem**: `ERROR: extension "vector" does not exist`

**Solution**:
```bash
# Install pgvector
brew install pgvector  # macOS
# or follow https://github.com/pgvector/pgvector#installation

# Then in psql:
CREATE EXTENSION vector;
```

### OpenAI API Key Error

**Problem**: `OpenAI API error: 401 Unauthorized`

**Solution**:
- Verify your API key is correct in `.env.local`
- Check key is active at https://platform.openai.com/account/api-keys
- Ensure you have credits/subscription

### S3 Upload Fails

**Problem**: `NoCredentialsError` or `AccessDenied`

**Solution**:
- Verify AWS credentials in `.env.local`
- Check IAM user has S3 permissions
- Verify bucket exists and is accessible

## Next Steps

1. **Upload Samples**: Visit dashboard to upload your first samples
2. **Test Queries**: Use the API endpoints to search for similar samples
3. **Check Style**: View your inferred style descriptor
4. **Deploy**: See DEPLOYMENT.md for production setup

## Production Deployment

For deploying to production, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## Architecture

- **Frontend**: Next.js React components at `/app`
- **API Routes**: RESTful endpoints in `/app/api`
- **Utilities**: Database, embeddings, S3 functions in `/lib`
- **Database**: PostgreSQL with pgvector for semantic search
- **Storage**: AWS S3 for media files
- **Embeddings**: OpenAI's text-embedding-3-small

## File Structure

```
lbd-style-guide-service/
├── app/
│   ├── api/
│   │   ├── health/          # Health check endpoint
│   │   └── twin/            # Style guide API routes
│   │       ├── upload/      # Upload samples
│   │       ├── query/       # Query by style
│   │       ├── style/       # Get style descriptor
│   │       └── samples/     # List samples
│   ├── dashboard/           # Upload dashboard UI
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── lib/
│   ├── auth.ts             # API key validation
│   ├── db.ts               # PostgreSQL utilities
│   ├── embeddings.ts       # OpenAI embeddings
│   ├── s3.ts               # AWS S3 utilities
│   └── types.ts            # TypeScript types
├── public/
│   └── .well-known/
│       └── ai-plugin.json  # MCP manifest
├── scripts/
│   └── init-db.ts          # Database initialization
├── PLAN.md                 # Project planning
├── README.md               # Full documentation
└── package.json            # Dependencies
```

## Support

- Check [README.md](./README.md) for API documentation
- Review [PLAN.md](./PLAN.md) for architecture details
- Open GitHub issues for bugs
