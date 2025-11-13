#!/bin/bash

# LBD Style Guide Service - RDS Deployment Script
# This script deploys a PostgreSQL RDS instance using CloudFormation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
STACK_NAME="lbd-style-guide-rds"
REGION="us-east-1"
TEMPLATE_PATH="infrastructure/rds-template.yaml"

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}LBD Style Guide Service - RDS PostgreSQL Deployment${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AWS CLI found${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}✗ AWS credentials not configured${NC}"
    exit 1
fi

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS credentials valid (Account: ${ACCOUNT})${NC}"

# Check if template file exists
if [ ! -f "$TEMPLATE_PATH" ]; then
    echo -e "${RED}✗ Template file not found: ${TEMPLATE_PATH}${NC}"
    exit 1
fi

echo -e "${GREEN}✓ CloudFormation template found${NC}"
echo ""

# Get parameters
read -p "Enter RDS instance name [lbd-style-guide-db]: " DB_INSTANCE
DB_INSTANCE=${DB_INSTANCE:-lbd-style-guide-db}

read -p "Enter database name [lbd_style_guide]: " DB_NAME
DB_NAME=${DB_NAME:-lbd_style_guide}

read -p "Enter master username [postgres]: " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter master password (minimum 8 characters): " DB_PASSWORD
echo ""

# Validate password
if [ ${#DB_PASSWORD} -lt 8 ]; then
    echo -e "${RED}✗ Password must be at least 8 characters${NC}"
    exit 1
fi

read -p "Enter instance type [db.t3.micro]: " DB_INSTANCE_CLASS
DB_INSTANCE_CLASS=${DB_INSTANCE_CLASS:-db.t3.micro}

read -p "Enter allocated storage in GB [20]: " STORAGE
STORAGE=${STORAGE:-20}

echo ""
echo -e "${YELLOW}Deploying with parameters:${NC}"
echo "  Stack Name: ${STACK_NAME}"
echo "  Region: ${REGION}"
echo "  DB Instance: ${DB_INSTANCE}"
echo "  Database: ${DB_NAME}"
echo "  Instance Class: ${DB_INSTANCE_CLASS}"
echo "  Storage: ${STORAGE} GB"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Deploying CloudFormation stack...${NC}"

aws cloudformation create-stack \
  --stack-name "$STACK_NAME" \
  --template-body "file://${TEMPLATE_PATH}" \
  --region "$REGION" \
  --parameters \
    ParameterKey=DBInstanceIdentifier,ParameterValue="$DB_INSTANCE" \
    ParameterKey=DBName,ParameterValue="$DB_NAME" \
    ParameterKey=DBUser,ParameterValue="$DB_USER" \
    ParameterKey=DBPassword,ParameterValue="$DB_PASSWORD" \
    ParameterKey=DBInstanceClass,ParameterValue="$DB_INSTANCE_CLASS" \
    ParameterKey=AllocatedStorage,ParameterValue="$STORAGE" \
  --capabilities CAPABILITY_IAM 2>&1 | grep -v "User:" || true

echo -e "${GREEN}✓ Stack creation initiated${NC}"
echo ""
echo -e "${YELLOW}Waiting for stack creation to complete...${NC}"
echo "(This may take 10-15 minutes)"
echo ""

aws cloudformation wait stack-create-complete \
  --stack-name "$STACK_NAME" \
  --region "$REGION"

echo -e "${GREEN}✓ Stack created successfully${NC}"
echo ""

# Get stack outputs
echo -e "${YELLOW}Stack Outputs:${NC}"
aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs' \
  --output table

echo ""
echo -e "${YELLOW}To connect to your database:${NC}"

ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`DatabaseEndpoint`].OutputValue' \
  --output text)

echo "psql -h ${ENDPOINT} -U ${DB_USER} -d ${DB_NAME}"
echo ""

echo -e "${YELLOW}Update your .env.local with:${NC}"
echo "DATABASE_URL=postgresql://${DB_USER}:PASSWORD@${ENDPOINT}:5432/${DB_NAME}"
echo ""

echo -e "${GREEN}✓ RDS deployment complete!${NC}"
