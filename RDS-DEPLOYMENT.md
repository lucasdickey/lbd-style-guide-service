# RDS PostgreSQL Deployment Guide

This guide covers deploying the LBD Style Guide Service with AWS RDS PostgreSQL.

## Overview

The LBD Style Guide Service uses PostgreSQL with pgvector for semantic search. This guide walks you through setting up an RDS instance on AWS.

## Prerequisites

- AWS Account with appropriate IAM permissions
- AWS CLI configured with credentials
- Node.js 18+
- [Optional] Docker for local development

## Quick Start

### 1. Deploy RDS Instance

Run the automated deployment script:

```bash
bash scripts/deploy-rds-cli.sh
```

This script will:
- Create a security group for RDS access
- Launch a PostgreSQL 15.3 instance (db.t3.micro)
- Configure automatic backups (7-day retention)
- Generate a secure password
- Output connection details

**Expected time: 10-15 minutes**

### 2. Configure Environment

After deployment, update `.env.local`:

```bash
cp .env.example .env.local
```

Edit with RDS connection details from the deployment output:

```env
DATABASE_URL=postgresql://postgres:PASSWORD@ENDPOINT:5432/lbd_style_guide
OPENAI_API_KEY=sk-xxx
API_KEY_SECRET=your-secret-key
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=lbd-style-guide-samples
```

### 3. Initialize Database

Install pgvector extension and create tables:

```bash
npm run db:init
```

This command:
- Enables pgvector for vector embeddings
- Creates user_profile, samples, and metadata tables
- Sets up indexes for query optimization

### 4. Start Development Server

```bash
npm run dev
```

Access the application at `http://localhost:3000`

## RDS Configuration Details

### Instance Specifications

- **Engine**: PostgreSQL 15.3
- **Instance Type**: db.t3.micro (2 vCPU, 1 GB RAM)
- **Storage**: 20 GB gp3 (configurable)
- **Backup Retention**: 7 days
- **Encryption**: Enabled (AES-256)
- **Public Access**: Enabled (for development)
- **IAM Authentication**: Enabled
- **Multi-AZ**: Disabled (can be enabled for production)

### Security Group

The deployment creates a security group with:
- Inbound: PostgreSQL port 5432 from 0.0.0.0/0
- Outbound: All traffic allowed

**For production**, restrict CIDR ranges to your application servers.

### Costs

Example monthly costs (us-east-1):
- **db.t3.micro** (on-demand): ~$30/month
- **Storage** (20 GB gp3): ~$2/month
- **Backup storage**: ~$2/month
- **Data transfer**: Varies (usually $0 within AWS)

**Total: ~$34/month** (approximate)

## Manual Deployment (Alternative)

If you prefer using the AWS Console:

### 1. Create RDS Instance

1. Go to RDS Dashboard → Databases → Create Database
2. Select "PostgreSQL" and version 15.3
3. Choose "Easy create" or "Standard create"
4. Configuration:
   - Instance: db.t3.micro
   - Storage: 20 GB gp3
   - Backup: 7 days
5. Set Master username/password
6. Click "Create Database"

### 2. Enable Extensions

Once the instance is available, connect and run:

```bash
psql -h <RDS_ENDPOINT> -U postgres -d lbd_style_guide

# Inside psql:
CREATE EXTENSION vector;
\q
```

### 3. Get Connection String

From RDS Dashboard:
1. Click on your database instance
2. Copy the Endpoint (e.g., `myinstance.cxxx.us-east-1.rds.amazonaws.com`)
3. Connection string format:
```
postgresql://postgres:PASSWORD@ENDPOINT:5432/lbd_style_guide
```

## Connecting to RDS

### From Local Machine

```bash
psql -h <RDS_ENDPOINT> \
  -U postgres \
  -d lbd_style_guide \
  -p 5432
```

### From Application

The connection string is automatically used from `.env.local`:

```typescript
const connectionString = process.env.DATABASE_URL
// postgresql://user:password@endpoint:5432/database
```

## Monitoring & Management

### CloudWatch Logs

RDS sends PostgreSQL logs to CloudWatch. View them:

```bash
aws logs tail /aws/rds/instance/lbd-style-guide-db --follow
```

### Database Metrics

Monitor in AWS Console:
1. RDS Dashboard → Databases → lbd-style-guide-db
2. Monitoring tab shows:
   - CPU Utilization
   - Database Connections
   - Read/Write Latency
   - Storage Usage

### Backups

Automated backups are retained for 7 days:
1. RDS Dashboard → Databases → lbd-style-guide-db
2. Backups tab shows available snapshots
3. Can restore from any snapshot point-in-time

## Scaling

### Vertical Scaling (Instance Type)

To upgrade instance type:

```bash
aws rds modify-db-instance \
  --db-instance-identifier lbd-style-guide-db \
  --db-instance-class db.t3.small \
  --apply-immediately
```

Available options:
- `db.t3.micro` - 2 vCPU, 1 GB RAM
- `db.t3.small` - 2 vCPU, 2 GB RAM
- `db.t3.medium` - 2 vCPU, 4 GB RAM

### Storage Scaling

PostgreSQL supports autoscaling storage:

```bash
aws rds modify-db-instance \
  --db-instance-identifier lbd-style-guide-db \
  --storage-type gp3 \
  --max-allocated-storage 100
```

## Deletion

To delete the RDS instance:

```bash
aws rds delete-db-instance \
  --db-instance-identifier lbd-style-guide-db \
  --no-skip-final-snapshot \
  --final-db-snapshot-identifier lbd-style-guide-final-snapshot
```

**Important**: This creates a final snapshot before deletion. Set `--skip-final-snapshot` if you don't want a backup.

## Production Considerations

For production deployment:

1. **Multi-AZ**: Enable for high availability
   ```bash
   aws rds modify-db-instance \
     --db-instance-identifier lbd-style-guide-db \
     --multi-az
   ```

2. **Enhanced Monitoring**: Enable detailed CloudWatch metrics
   ```bash
   aws rds modify-db-instance \
     --db-instance-identifier lbd-style-guide-db \
     --monitoring-interval 60 \
     --monitoring-role-arn arn:aws:iam::ACCOUNT:role/rds-monitoring
   ```

3. **Security**:
   - Restrict security group to application VPC
   - Use strong passwords
   - Enable encryption in transit (SSL)
   - Consider private subnet (non-public access)

4. **Backup Strategy**:
   - Increase retention to 30+ days
   - Enable automated minor version upgrades
   - Regular restore testing

5. **Performance**:
   - Monitor slow queries
   - Tune shared_buffers and other parameters
   - Use Read Replicas if needed

## Troubleshooting

### Connection Refused

```
psql: could not connect to server: Connection refused
```

**Solution**:
- Check security group allows port 5432
- Verify endpoint is correct
- Check RDS instance status is "available"

### Database Does Not Exist

```
psql: FATAL: database "lbd_style_guide" does not exist
```

**Solution**:
```bash
psql -h ENDPOINT -U postgres -c "CREATE DATABASE lbd_style_guide;"
```

### pgvector Not Available

```
ERROR: extension "vector" does not exist
```

**Solution**:
```bash
psql -h ENDPOINT -U postgres -d lbd_style_guide -c "CREATE EXTENSION vector;"
```

### High CPU Usage

1. Check active queries:
   ```sql
   SELECT pid, usename, state, query FROM pg_stat_activity;
   ```

2. Kill long-running queries:
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid();
   ```

3. Upgrade instance type if sustained high usage

## Useful Commands

```bash
# List all RDS instances
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus]'

# Get specific instance details
aws rds describe-db-instances \
  --db-instance-identifier lbd-style-guide-db \
  --query 'DBInstances[0].[Endpoint.Address,Engine,DBInstanceClass]'

# Modify instance (apply immediately)
aws rds modify-db-instance \
  --db-instance-identifier lbd-style-guide-db \
  --apply-immediately

# Create a snapshot
aws rds create-db-snapshot \
  --db-instance-identifier lbd-style-guide-db \
  --db-snapshot-identifier lbd-style-guide-backup-$(date +%Y%m%d)

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier lbd-style-guide-db

# Reboot instance
aws rds reboot-db-instance \
  --db-instance-identifier lbd-style-guide-db
```

## Next Steps

- [x] Deploy RDS PostgreSQL
- [ ] Configure application environment
- [ ] Initialize database schema
- [ ] Test connections
- [ ] Set up monitoring
- [ ] Deploy to Vercel
- [ ] Configure CI/CD
- [ ] Set up backups & disaster recovery

## Support

For RDS issues:
- AWS RDS Documentation: https://docs.aws.amazon.com/rds/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- pgvector Documentation: https://github.com/pgvector/pgvector

For application issues:
- Check logs: `npm run dev`
- Verify DATABASE_URL in .env.local
- Test connection: `psql $DATABASE_URL`
