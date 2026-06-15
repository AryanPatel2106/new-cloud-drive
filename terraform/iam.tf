# IAM Role for EC2 Instances (Frontend and Backend)
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for EC2 Instances (ECR, SSM, Secrets Manager, CloudWatch Logs)
resource "aws_iam_policy" "ec2_policy" {
  name        = "${var.project_name}-ec2-policy"
  description = "Permissions for ECR, SSM Parameter Store, Secrets Manager, and CloudWatch"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # ECR Access
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ]
        Resource = "*"
      },
      # SSM Parameter Store Access (to read image tags)
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/${var.project_name}/*"
      },
      # Secrets Manager Access (to read DB credentials)
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:*:*:secret:${var.project_name}/*"
      },
      # S3 Access (for file storage)
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject"
        ]
        Resource = [
          aws_s3_bucket.storage.arn,
          "${aws_s3_bucket.storage.arn}/*"
        ]
      },
      # CloudWatch Logs & Metrics
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "cloudwatch:PutMetricData"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach Policy to EC2 Role
resource "aws_iam_role_policy_attachment" "ec2_attach" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ec2_policy.arn
}

# SSM Managed Instance Core policy (to allow SSM Session Manager for secure CLI access)
resource "aws_iam_role_policy_attachment" "ec2_ssm_core" {
  role       = aws_iam_role.ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# -----------------------------------------------------------------------------
# GitHub Actions IAM OIDC Federation
# -----------------------------------------------------------------------------

# Try to look up existing OIDC provider, if it fails, we define it.
# Github standard OIDC Thumbprints
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1", "1c58a3a8518e8759bf075b76b750d4f2df264fcd"]
}

# IAM Role for GitHub Actions CI/CD Pipeline
resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-github-deploy-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_repo}:*"
          }
        }
      }
    ]
  })
}

# IAM Policy for GitHub Actions (Push images to ECR, update SSM parameters, update Launch Templates, trigger ASG Refresh)
resource "aws_iam_policy" "github_actions_policy" {
  name        = "${var.project_name}-github-deploy-policy"
  description = "Permissions for GitHub Actions to push containers and trigger ASG rolling deployments"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # ECR Push Access
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage"
        ]
        Resource = "arn:aws:ecr:*:*:repository/${var.project_name}-*"
      },
      # SSM Parameter Store Access (to write updated tags)
      {
        Effect = "Allow"
        Action = [
          "ssm:PutParameter",
          "ssm:GetParameter"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/${var.project_name}/*"
      },
      # Launch Template - Describe actions MUST use wildcard resource (AWS limitation)
      {
        Effect = "Allow"
        Action = [
          "ec2:DescribeLaunchTemplates",
          "ec2:DescribeLaunchTemplateVersions"
        ]
        Resource = "*"
      },
      # Launch Template - Write actions can be scoped to project resources
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateLaunchTemplateVersion"
        ]
        Resource = "arn:aws:ec2:*:*:launch-template/*"
      },
      # ASG - Describe actions MUST use wildcard resource (AWS limitation)
      {
        Effect = "Allow"
        Action = [
          "autoscaling:DescribeInstanceRefreshes",
          "autoscaling:DescribeAutoScalingGroups"
        ]
        Resource = "*"
      },
      # ASG - Write actions can be scoped to project resources
      {
        Effect = "Allow"
        Action = [
          "autoscaling:StartInstanceRefresh"
        ]
        Resource = "arn:aws:autoscaling:*:*:autoScalingGroup:*:autoScalingGroupName/${var.project_name}-*"
      }
    ]
  })
}

# Attach GitHub Actions Policy to GitHub Actions Role
resource "aws_iam_role_policy_attachment" "github_actions_attach" {
  role       = aws_iam_role.github_actions.name
  policy_arn = aws_iam_policy.github_actions_policy.arn
}
