#!/bin/bash

# LBD Style Guide Service - RDS Deployment Script (Non-interactive)
# Usage: ./scripts/deploy-rds-cli.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
INSTANCE_ID="lbd-style-guide-db"
DB_NAME="lbd_style_guide"
DB_USER="postgres"
INSTANCE_CLASS="db.t3.micro"
STORAGE="20"
REGION="us-east-1"

# Generate random password
DB_PASSWORD=$(openssl rand -base64 12)

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}LBD Style Guide Service - RDS PostgreSQL Deployment${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verify AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI found${NC}"

# Verify credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    exit 1
fi

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS credentials valid (Account: ${ACCOUNT})${NC}"
echo ""

echo "Configuration:"
echo "  Instance ID: ${INSTANCE_ID}"
echo "  Database: ${DB_NAME}"
echo "  Instance Class: ${INSTANCE_CLASS}"
echo "  Storage: ${STORAGE} GB"
echo "  Region: ${REGION}"
echo ""

echo -e "${YELLOW}Creating RDS PostgreSQL instance...${NC}"
echo ""

# Create security group
echo "Creating security group..."
SG_ID=$(aws ec2 create-security-group \
  --group-name "${INSTANCE_ID}-sg" \
  --description "Security group for LBD Style Guide RDS" \
  --region "${REGION}" \
  --query 'GroupId' \
  --output text 2>/dev/null || echo "")

if [ -z "$SG_ID" ]; then
  # SG may already exist
  SG_ID=$(aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=${INSTANCE_ID}-sg" \
    --region "${REGION}" \
    --query 'SecurityGroups[0].GroupId' \
    --output text 2>/dev/null || echo "")
fi

if [ ! -z "$SG_ID" ] && [ "$SG_ID" != "None" ]; then
  echo -e "${GREEN}✓ Security group: ${SG_ID}${NC}"

  # Add ingress rule for PostgreSQL
  aws ec2 authorize-security-group-ingress \
    --group-id "${SG_ID}" \
    --protocol tcp \
    --port 5432 \
    --cidr 0.0.0.0/0 \
    --region "${REGION}" 2>/dev/null || true
else
  echo -e "${YELLOW}→ Using default VPC security group${NC}"
fi

echo ""

# Create RDS instance
echo "Creating RDS PostgreSQL instance..."

aws rds create-db-instance \
  --db-instance-identifier "${INSTANCE_ID}" \
  --db-instance-class "${INSTANCE_CLASS}" \
  --engine postgres \
  --engine-version 15.3 \
  --master-username "${DB_USER}" \
  --master-user-password "${DB_PASSWORD}" \
  --allocated-storage "${STORAGE}" \
  --storage-type gp3 \
  --storage-encrypted \
  --backup-retention-period 7 \
  --publicly-accessible \
  --enable-cloudwatch-logs-exports postgresql \
  --enable-iam-database-authentication \
  --db-name "${DB_NAME}" \
  --region "${REGION}" \
  --tags "Key=Name,Value=${INSTANCE_ID}" "Key=Project,Value=LBD-Style-Guide" \
  --no-deletion-protection \
  2>&1 | grep -i "DBInstanceIdentifier\|AllocatedStorage" || true

echo -e "${GREEN}✓ RDS instance creation initiated${NC}"
echo ""
echo -e "${YELLOW}Waiting for instance to be available...${NC}"
echo "(This may take 10-15 minutes)"
echo ""

# Wait for instance
aws rds wait db-instance-available \
  --db-instance-identifier "${INSTANCE_ID}" \
  --region "${REGION}"

echo -e "${GREEN}✓ RDS instance is now available${NC}"
echo ""

# Get endpoint
ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier "${INSTANCE_ID}" \
  --region "${REGION}" \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

PORT=$(aws rds describe-db-instances \
  --db-instance-identifier "${INSTANCE_ID}" \
  --region "${REGION}" \
  --query 'DBInstances[0].Endpoint.Port' \
  --output text)

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Deployment Complete!${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "Connection Details:"
echo "  Endpoint: ${ENDPOINT}"
echo "  Port: ${PORT}"
echo "  Database: ${DB_NAME}"
echo "  Username: ${DB_USER}"
echo "  Password: ${DB_PASSWORD}"
echo ""

# Create .env.local entry
echo "Add this to your .env.local:"
echo ""
echo "# Database"
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${ENDPOINT}:${PORT}/${DB_NAME}"
echo ""

# Save to a temp file for convenience
ENV_FILE=".env.rds"
cat > "$ENV_FILE" <<EOF
# Database
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${ENDPOINT}:${PORT}/${DB_NAME}

# API Keys
OPENAI_API_KEY=sk-xxx
API_KEY_SECRET=your-api-key-secret

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
S3_BUCKET_NAME=lbd-style-guide-samples

# Server
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_KEY=your-api-key-secret
EOF

echo -e "${GREEN}✓ Saved connection details to ${ENV_FILE}${NC}"
echo ""
echo "Next Steps:"
echo "  1. Update DATABASE_URL in .env.local with your credentials"
echo "  2. Run: npm run db:init"
echo "  3. Run: npm run dev"
echo ""
