#!/bin/bash
set -e

# Update and install Docker & AWS CLI
yum update -y
amazon-linux-extras install docker -y
yum install -y aws-cli jq

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Add ec2-user to docker group
usermod -aG docker ec2-user

# Variables injected by Terraform
REGION="${aws_region}"
PROJECT="${project_name}"
ECR_REPO="${ecr_repo_url}"
SSM_PARAM="${ssm_param_image_tag}"
SECRET_ID="${secrets_manager_id}"

# Fetch instance metadata for unique log streaming (IMDSv2)
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
INSTANCE_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id)

# Create a secure directory for application secrets
mkdir -p /opt/clouddrive
chmod 700 /opt/clouddrive

# Retrieve production secrets from AWS Secrets Manager
# Secrets are stored as a JSON object; we parse them into an environment file
aws secretsmanager get-secret-value --secret-id $SECRET_ID --region $REGION --query SecretString --output text | jq -r 'to_entries|map("\(.key)=\(.value)")|.[]' > /opt/clouddrive/backend.env
chmod 600 /opt/clouddrive/backend.env

# Append internal load balancer variables or extra configuration if needed
echo "PORT=3000" >> /opt/clouddrive/backend.env

# Authenticate with AWS ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REPO

# Get current container tag from SSM Parameter Store
IMAGE_TAG=$(aws ssm get-parameter --name $SSM_PARAM --region $REGION --query "Parameter.Value" --output text)

# Stop and remove existing container if running
docker stop backend || true
docker rm backend || true

# Run the backend container
# Using the awslogs log driver redirects container stdout/stderr directly to CloudWatch Logs
docker run -d \
  --name backend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file /opt/clouddrive/backend.env \
  --log-driver=awslogs \
  --log-opt awslogs-group=/aws/ec2/$PROJECT-backend/app \
  --log-opt awslogs-region=$REGION \
  --log-opt awslogs-stream=instance-$INSTANCE_ID \
  --log-opt awslogs-create-group=true \
  $ECR_REPO:$IMAGE_TAG

# -----------------------------------------------------------------------------
# CloudWatch Agent Configuration for Memory and Disk Monitoring
# -----------------------------------------------------------------------------
yum install amazon-cloudwatch-agent -y

cat <<EOF > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "cwagent"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/messages",
            "log_group_name": "/aws/ec2/$PROJECT-backend/system-messages",
            "log_stream_name": "{instance_id}",
            "retention_in_days": 7
          }
        ]
      }
    }
  },
  "metrics": {
    "metrics_collected": {
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          "disk_used_percent"
        ],
        "resources": [
          "/"
        ],
        "metrics_collection_interval": 60
      }
    }
  }
}
EOF

# Start CloudWatch Agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
