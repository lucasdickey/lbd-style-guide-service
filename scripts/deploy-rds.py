#!/usr/bin/env python3
"""
LBD Style Guide Service - RDS PostgreSQL Deployment Script
Creates an RDS PostgreSQL instance with pgvector support
"""

import boto3
import json
import time
import sys
from typing import Dict, Optional
from datetime import datetime

# Configuration
REGION = 'us-east-1'
DB_ENGINE = 'postgres'
DB_ENGINE_VERSION = '15.3'
DEFAULT_INSTANCE_CLASS = 'db.t3.micro'
DEFAULT_STORAGE = 20

class RDSDeployer:
    def __init__(self, region: str = REGION):
        self.region = region
        self.rds_client = boto3.client('rds', region_name=region)
        self.cloudformation_client = boto3.client('cloudformation', region_name=region)

    def print_header(self, text: str):
        """Print formatted header"""
        print(f"\n{'='*70}")
        print(f"  {text}")
        print(f"{'='*70}\n")

    def print_success(self, text: str):
        """Print success message"""
        print(f"✓ {text}")

    def print_error(self, text: str):
        """Print error message"""
        print(f"✗ {text}", file=sys.stderr)

    def print_info(self, text: str):
        """Print info message"""
        print(f"→ {text}")

    def get_user_input(self, prompt: str, default: str = "") -> str:
        """Get user input with default"""
        if default:
            prompt = f"{prompt} [{default}]: "
        else:
            prompt = f"{prompt}: "

        value = input(prompt).strip()
        return value if value else default

    def validate_password(self, password: str) -> bool:
        """Validate password requirements"""
        if len(password) < 8:
            self.print_error("Password must be at least 8 characters")
            return False
        return True

    def check_aws_credentials(self) -> bool:
        """Check if AWS credentials are configured"""
        try:
            sts = boto3.client('sts')
            identity = sts.get_caller_identity()
            account = identity['Account']
            user = identity['Arn']
            self.print_success(f"AWS credentials valid")
            self.print_info(f"Account: {account}")
            self.print_info(f"User: {user}")
            return True
        except Exception as e:
            self.print_error(f"AWS credentials not configured: {e}")
            return False

    def create_db_instance(self, params: Dict) -> Optional[Dict]:
        """Create RDS instance"""
        try:
            self.print_info("Creating RDS PostgreSQL instance...")
            response = self.rds_client.create_db_instance(
                DBInstanceIdentifier=params['instance_id'],
                DBInstanceClass=params['instance_class'],
                Engine=DB_ENGINE,
                EngineVersion=DB_ENGINE_VERSION,
                MasterUsername=params['username'],
                MasterUserPassword=params['password'],
                AllocatedStorage=params['storage'],
                StorageType='gp3',
                StorageEncrypted=True,
                BackupRetentionPeriod=7,
                PubliclyAccessible=True,
                EnableCloudwatchLogsExports=['postgresql'],
                EnableIAMDatabaseAuthentication=True,
                DBName=params['db_name'],
                Tags=[
                    {'Key': 'Name', 'Value': params['instance_id']},
                    {'Key': 'Project', 'Value': 'LBD-Style-Guide'},
                    {'Key': 'CreatedAt', 'Value': datetime.now().isoformat()}
                ]
            )
            return response
        except self.rds_client.exceptions.DBInstanceAlreadyExistsFault:
            self.print_error(f"Instance {params['instance_id']} already exists")
            return None
        except Exception as e:
            self.print_error(f"Error creating instance: {e}")
            return None

    def wait_for_instance(self, instance_id: str, timeout: int = 1800) -> bool:
        """Wait for RDS instance to be available"""
        self.print_info("Waiting for instance to be available...")
        self.print_info("(This may take 10-15 minutes)")

        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = self.rds_client.describe_db_instances(
                    DBInstanceIdentifier=instance_id
                )
                instance = response['DBInstances'][0]
                status = instance['DBInstanceStatus']

                if status == 'available':
                    self.print_success(f"Instance {instance_id} is now available")
                    return True
                else:
                    self.print_info(f"Status: {status}... (waiting)")
                    time.sleep(30)
            except Exception as e:
                self.print_error(f"Error checking status: {e}")
                time.sleep(30)

        self.print_error("Timeout waiting for instance to be available")
        return False

    def get_instance_endpoint(self, instance_id: str) -> Optional[Dict]:
        """Get RDS instance endpoint information"""
        try:
            response = self.rds_client.describe_db_instances(
                DBInstanceIdentifier=instance_id
            )
            instance = response['DBInstances'][0]
            return {
                'endpoint': instance['Endpoint']['Address'],
                'port': instance['Endpoint']['Port'],
                'status': instance['DBInstanceStatus']
            }
        except Exception as e:
            self.print_error(f"Error getting endpoint: {e}")
            return None

    def deploy(self):
        """Main deployment workflow"""
        self.print_header("LBD Style Guide Service - RDS PostgreSQL Setup")

        # Check AWS credentials
        if not self.check_aws_credentials():
            sys.exit(1)

        print()

        # Get parameters from user
        instance_id = self.get_user_input("Enter RDS instance name", "lbd-style-guide-db")
        db_name = self.get_user_input("Enter database name", "lbd_style_guide")
        username = self.get_user_input("Enter master username", "postgres")

        # Get password
        import getpass
        password = getpass.getpass("Enter master password (minimum 8 characters): ")
        if not self.validate_password(password):
            sys.exit(1)

        instance_class = self.get_user_input("Enter instance type", DEFAULT_INSTANCE_CLASS)
        storage = int(self.get_user_input("Enter storage in GB", str(DEFAULT_STORAGE)))

        # Summary
        print()
        self.print_info("Deployment Configuration:")
        print(f"  Instance Name: {instance_id}")
        print(f"  Database: {db_name}")
        print(f"  Instance Type: {instance_class}")
        print(f"  Storage: {storage} GB")
        print(f"  Region: {self.region}")
        print()

        # Confirm
        confirm = input("Continue with deployment? (y/n): ").strip().lower()
        if confirm != 'y':
            self.print_info("Deployment cancelled")
            sys.exit(0)

        # Create instance
        params = {
            'instance_id': instance_id,
            'db_name': db_name,
            'username': username,
            'password': password,
            'instance_class': instance_class,
            'storage': storage
        }

        if not self.create_db_instance(params):
            sys.exit(1)

        self.print_success("RDS instance creation initiated")
        print()

        # Wait for instance
        if not self.wait_for_instance(instance_id):
            sys.exit(1)

        # Get endpoint
        endpoint_info = self.get_instance_endpoint(instance_id)
        if not endpoint_info:
            sys.exit(1)

        # Output connection details
        self.print_header("Deployment Complete!")
        print("Connection Details:")
        print(f"  Endpoint: {endpoint_info['endpoint']}")
        print(f"  Port: {endpoint_info['port']}")
        print(f"  Database: {db_name}")
        print(f"  Username: {username}")
        print()

        print("Connection String:")
        print(f"  postgresql://{username}:PASSWORD@{endpoint_info['endpoint']}:5432/{db_name}")
        print()

        print("Update your .env.local with:")
        print(f"  DATABASE_URL=postgresql://{username}:PASSWORD@{endpoint_info['endpoint']}:5432/{db_name}")
        print()

        print("Next Steps:")
        print("  1. Update DATABASE_URL in .env.local with your password")
        print("  2. Run: npm run db:init")
        print("  3. Run: npm run dev")
        print()

if __name__ == '__main__':
    deployer = RDSDeployer()
    deployer.deploy()
