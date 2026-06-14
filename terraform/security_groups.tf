# Bastion Host Security Group
resource "aws_security_group" "bastion" {
  name        = "${var.project_name}-bastion-sg"
  description = "Allow SSH access to Bastion host"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "SSH from allowed IP ranges"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_bastion_ssh_cidr]
  }

  egress {
    description = "SSH outbound to Frontend and Backend EC2s"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.private_app_subnet_cidrs
  }

  tags = {
    Name = "${var.project_name}-bastion-sg"
  }
}

# Public ALB Security Group
resource "aws_security_group" "public_alb" {
  name        = "${var.project_name}-public-alb-sg"
  description = "Security group for Internet-facing Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Allow outbound HTTP traffic to Frontend EC2 instances"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.private_app_subnet_cidrs
  }

  tags = {
    Name = "${var.project_name}-public-alb-sg"
  }
}

# Frontend EC2 Security Group
resource "aws_security_group" "frontend_ec2" {
  name        = "${var.project_name}-frontend-ec2-sg"
  description = "Security group for Frontend EC2 Instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTP from Public ALB only"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.public_alb.id]
  }

  ingress {
    description     = "SSH from Bastion Host only"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    description = "Allow all outbound traffic (ECR, CloudWatch, Systems Manager, Internal ALB)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-frontend-ec2-sg"
  }
}

# Internal ALB Security Group (Private)
resource "aws_security_group" "internal_alb" {
  name        = "${var.project_name}-internal-alb-sg"
  description = "Security group for Internal Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "HTTP from Frontend EC2 instances only"
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.frontend_ec2.id]
  }

  egress {
    description = "Allow outbound to Backend EC2 instances on port 3000"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = var.private_app_subnet_cidrs
  }

  tags = {
    Name = "${var.project_name}-internal-alb-sg"
  }
}

# Backend EC2 Security Group
resource "aws_security_group" "backend_ec2" {
  name        = "${var.project_name}-backend-ec2-sg"
  description = "Security group for Backend EC2 Instances"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Port 3000 from Internal ALB only"
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.internal_alb.id]
  }

  ingress {
    description     = "SSH from Bastion Host only"
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    description = "Allow all outbound traffic (ECR, MongoDB Atlas, SES, S3, Secrets Manager)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-backend-ec2-sg"
  }
}

# Private Database Subnet Security Group (VPC DB layer fallback)
resource "aws_security_group" "database" {
  name        = "${var.project_name}-database-sg"
  description = "Security group for private database layer"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "Allow database connections from Backend EC2 instances only"
    from_port       = 27017 # MongoDB default port
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.backend_ec2.id]
  }

  egress {
    description = "Restrict outbound database traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Egress can be restricted if desired
  }

  tags = {
    Name = "${var.project_name}-database-sg"
  }
}
