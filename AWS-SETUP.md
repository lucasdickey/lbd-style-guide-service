# AWS Setup Guide for LBD Style Guide Service

This guide walks you through setting up AWS resources (RDS, S3) for the LBD Style Guide Service.

## Quick Start

### 1. Create RDS PostgreSQL Instance (AWS Console)

1. Go to **AWS RDS Console** → **Databases** → **Create Database**
2. Choose **PostgreSQL** (version 15.x)
3. Select **Free tier eligible** or choose instance size:
   - Instance: **db.t3.micro** (free tier) or **db.t3.small**
   - Storage: **20 GB gp3**
4. Set credentials:
   - Master username: `postgres`
   - Master password: Generate or set your own (min 8 chars)
5. Network & Security:
   - Public accessibility: **Yes** (for development)
   - New VPC security group or existing
   - Security group name: `lbd-style-guide-sg`
6. Additional settings:
   - Database name: `lbd_style_guide`
   - Backup retention: `7` days
7. Click **Create Database** and wait 10-15 minutes

### 2. Configure Security Group

After RDS is created:

1. Go to **EC2 Console** → **Security Groups**
2. Find `lbd-style-guide-sg`
3. Click **Edit inbound rules**
4. Add rule:
   - Type: PostgreSQL
   - Port: 5432
   - Source: 0.0.0.0/0 (or your IP for security)
5. Click **Save rules**

### 3. Get RDS Endpoint

1. Go to **RDS Console** → **Databases** → click instance
2. Copy **Endpoint** (looks like: `lbd-style-guide-db.cxxx.us-east-1.rds.amazonaws.com`)
3. Note the **Port** (usually 5432)

### 4. Connect to RDS

Install PostgreSQL client (if not already installed):

**macOS:**
```bash
brew install postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql-client
```

**Windows:**
```bash
# Download PostgreSQL and select "command line tools"
```

Then connect:

```bash
psql -h <YOUR-ENDPOINT> \
  -U postgres \
  -d lbd_style_guide \
  -p 5432
```

When prompted, enter your master password.

### 5. Enable pgvector Extension

Once connected (you'll see `lbd_style_guide=>`), run:

```sql
CREATE EXTENSION vector;
```

Then exit:
```sql
\q
```

### 6. Update .env.local

Edit `.env.local` in your project:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@YOUR_ENDPOINT:5432/lbd_style_guide
```

Example:
```env
DATABASE_URL=postgresql://postgres:MySecurePassword123@lbd-style-guide-db.cxxx.us-east-1.rds.amazonaws.com:5432/lbd_style_guide
```

### 7. Initialize Database Schema

```bash
npm run db:init
```

This creates the necessary tables.

### 8. Create S3 Bucket

1. Go to **S3 Console** → **Create Bucket**
2. Name: `lbd-style-guide-samples` (or any unique name)
3. Region: `us-east-1` (match your RDS region)
4. Block public access: Leave as default
5. Click **Create Bucket**

### 9. Create IAM User for S3 Access

1. Go to **IAM Console** → **Users** → **Create User**
2. Name: `lbd-style-guide-app`
3. Skip optional settings
4. Click **Create User**

Then:
1. Click on the new user
2. Go to **Access Keys** → **Create Access Key**
3. Choose **Other** use case
4. Copy:
   - Access Key ID
   - Secret Access Key
5. Add to `.env.local`:
   ```env
   AWS_ACCESS_KEY_ID=YOUR_KEY_ID
   AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
   S3_BUCKET_NAME=lbd-style-guide-samples
   AWS_REGION=us-east-1
   ```

### 10. Add S3 Permissions

1. Go to **IAM Console** → **Users** → select your user
2. Click **Add permissions** → **Attach policies directly**
3. Search for "AmazonS3FullAccess"
4. Select it and click **Next**

(For production, use a more restrictive policy)

### 11. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Copy key
4. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

### 12. Set API Key for Application

Generate a secure key:

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}) -join '')
```

Add to `.env.local`:
```env
API_KEY_SECRET=YOUR_GENERATED_KEY
NEXT_PUBLIC_API_KEY=YOUR_GENERATED_KEY
```

## Complete .env.local Example

```env
# Database
DATABASE_URL=postgresql://postgres:MyPassword@lbd-style-guide-db.cxxx.us-east-1.rds.amazonaws.com:5432/lbd_style_guide

# API Keys
OPENAI_API_KEY=sk-your-openai-key
API_KEY_SECRET=your-secure-key

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=lbd-style-guide-samples

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=your-secure-key
DEFAULT_USER_ID=00000000-0000-0000-0000-000000000000
```

## Verify Setup

### Test Database Connection

```bash
psql $DATABASE_URL -c "SELECT version();"
```

### Test S3 Access

```bash
aws s3 ls
```

Should list your buckets if AWS credentials are correct.

## Start Development Server

Once everything is configured:

```bash
npm install   # Install dependencies
npm run dev   # Start dev server
```

Visit http://localhost:3000 in your browser.

## Deployment to Vercel

### 1. Create Vercel Account

Go to https://vercel.com and sign up.

### 2. Connect GitHub

Link your GitHub account to Vercel.

### 3. Import Project

1. Click **New Project**
2. Select your `lbd-style-guide-service` repository
3. Click **Import**

### 4. Add Environment Variables

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add all variables from `.env.local`:
   - DATABASE_URL
   - OPENAI_API_KEY
   - API_KEY_SECRET
   - AWS_REGION
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - S3_BUCKET_NAME
   - NEXT_PUBLIC_API_KEY
3. Click **Save**

### 5. Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Your app will be live at `https://your-project.vercel.app`

## Costs Estimation

### AWS Resources

| Service | Resource | Monthly Cost |
|---------|----------|--------------|
| RDS | db.t3.micro (Free tier: 750 hrs/month) | $0-30 |
| RDS | Storage (20 GB) | $2 |
| RDS | Backup | $2 |
| S3 | Storage (100 GB) | $2.30 |
| S3 | Requests | Minimal |
| **Total (first year)** | Free tier + small usage | ~$35 |

### Vercel

- **Hobby plan**: $0 (limited)
- **Pro plan**: $20/month

## Monitoring

### AWS CloudWatch

View RDS logs:
```bash
aws logs tail /aws/rds/instance/lbd-style-guide-db --follow
```

### RDS Metrics

1. Go to **RDS Console** → **Databases**
2. Click your instance
3. Go to **Monitoring** tab
4. View:
   - CPU Utilization
   - Database Connections
   - Read/Write Latency
   - Free Storage Space

### Application Logs

Vercel logs:
1. Go to **Deployments** tab
2. Click a deployment
3. View logs in **Function Logs**

Local logs:
```bash
npm run dev
```

Watch server terminal for logs.

## Troubleshooting

### Can't Connect to RDS

1. Check security group allows port 5432
2. Verify endpoint is correct
3. Ensure RDS instance is "available"
4. Try: `psql -h <endpoint> -U postgres -d postgres`

### S3 Upload Fails

1. Check AWS credentials in `.env.local`
2. Verify bucket exists and is accessible
3. Check IAM permissions for user
4. Try: `aws s3 ls`

### Database Initialization Fails

1. Check pgvector extension is installed:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'vector';
   ```
2. If not found, run in psql:
   ```sql
   CREATE EXTENSION vector;
   ```

### Application Won't Start

1. Check all required env vars are set
2. Verify DATABASE_URL format
3. Check port 3000 is available
4. Try: `npm run dev` and check error messages

## Next Steps

- [ ] Create RDS PostgreSQL instance
- [ ] Enable pgvector extension
- [ ] Create S3 bucket
- [ ] Create IAM user and keys
- [ ] Get OpenAI API key
- [ ] Update .env.local
- [ ] Run `npm run db:init`
- [ ] Start dev server: `npm run dev`
- [ ] Test upload at localhost:3000/dashboard
- [ ] Deploy to Vercel

## Support

- AWS Documentation: https://docs.aws.amazon.com/
- PostgreSQL Docs: https://www.postgresql.org/docs/
- pgvector Docs: https://github.com/pgvector/pgvector
- OpenAI Docs: https://platform.openai.com/docs/
