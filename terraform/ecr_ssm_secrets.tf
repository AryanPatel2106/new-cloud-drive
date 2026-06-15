# ECR Repository for Frontend Docker image
resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-frontend-ecr"
  }
}

# ECR Repository for Backend Docker image
resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${var.project_name}-backend-ecr"
  }
}

# ECR Lifecycle Policy to clean up old untagged images (saves disk costs)
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged images older than 14 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 14
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged images older than 14 days"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 14
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

# -----------------------------------------------------------------------------
# SSM Parameter Store to Track Latest Deployed Container Tags
# -----------------------------------------------------------------------------

resource "aws_ssm_parameter" "frontend_image_tag" {
  name        = "/${var.project_name}/frontend/image_tag"
  type        = "String"
  value       = "latest" # Initial fallback value
  description = "The image tag currently deployed for the frontend"

  lifecycle {
    ignore_changes = [value] # Prevent Terraform from resetting tag on subsequent applies
  }
}

resource "aws_ssm_parameter" "backend_image_tag" {
  name        = "/${var.project_name}/backend/image_tag"
  type        = "String"
  value       = "latest" # Initial fallback value
  description = "The image tag currently deployed for the backend"

  lifecycle {
    ignore_changes = [value] # Prevent Terraform from resetting tag on subsequent applies
  }
}

# -----------------------------------------------------------------------------
# AWS Secrets Manager for Production Credentials
# -----------------------------------------------------------------------------

resource "aws_secretsmanager_secret" "backend_secrets" {
  name                    = "${var.project_name}/backend/secrets"
  description             = "Production environment variables and credentials for Backend"
  recovery_window_in_days = 0 # Forces deletion immediately if destroyed (student project helper)

  tags = {
    Name = "${var.project_name}-backend-secrets"
  }
}

# Initial placeholder structure for secrets so the user can easily update values in Console
resource "aws_secretsmanager_secret_version" "backend_placeholder" {
  secret_id = aws_secretsmanager_secret.backend_secrets.id
  secret_string = jsonencode({
    MONGO_URI            = "mongodb+srv://clouddrive:Manvadind8962@cluster0.pdtpgzv.mongodb.net/clouddrive"
    ACCESS_TOKEN_SECRET  = "placeholder_long_jwt_secret_value_for_production"
    ACCESS_TOKEN_EXPIRY  = "1d"
    CORS_ORIGIN          = "http://localhost:5173" # Or your production domains
    SES_FROM_EMAIL       = "aryanpatel8082@gmail.com"
    AWS_S3_BUCKET        = "${var.project_name}-s3-bucket-${data.aws_caller_identity.current.account_id}"
    AWS_REGION           = "ap-south-1"
  })

  lifecycle {
    ignore_changes = [secret_string] # Prevent Terraform from resetting edited secrets in subsequent applies
  }
}
