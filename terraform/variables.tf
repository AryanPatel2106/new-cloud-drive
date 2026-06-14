variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "clouddrive"
}

variable "environment" {
  description = "Deployment environment (e.g. production, staging)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_app_subnet_cidrs" {
  description = "CIDR blocks for private application subnets"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "private_db_subnet_cidrs" {
  description = "CIDR blocks for private database subnets"
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24"]
}

variable "frontend_instance_type" {
  description = "EC2 instance type for the frontend"
  type        = string
  default     = "t3.micro"
}

variable "backend_instance_type" {
  description = "EC2 instance type for the backend"
  type        = string
  default     = "t3.micro"
}

variable "bastion_instance_type" {
  description = "EC2 instance type for the Bastion Host"
  type        = string
  default     = "t3.micro"
}

variable "enable_cost_optimized_nat" {
  description = "If true, deploys a single cost-effective NAT instance. If false, deploys AWS NAT Gateways in each AZ."
  type        = bool
  default     = true
}

variable "allowed_bastion_ssh_cidr" {
  description = "Allowed CIDR block to SSH into the Bastion Host"
  type        = string
  default     = "0.0.0.0/0" # In production, restrict to user's public IP
}

variable "github_repo" {
  description = "GitHub repository for OIDC authentication role (format: owner/repo)"
  type        = string
  default     = "AryanPatel2106/new-cloud-drive"
}

variable "key_name" {
  description = "Name of the AWS key pair for SSH access (optional, leave null to use keyless SSM)"
  type        = string
  default     = null
}
