# VPC definition
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
  }
}

# Private Application Subnets
resource "aws_subnet" "private_app" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_app_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-app-subnet-${count.index + 1}"
  }
}

# Private Database Subnets
resource "aws_subnet" "private_db" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_db_subnet_cidrs[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-db-subnet-${count.index + 1}"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# -----------------------------------------------------------------------------
# NAT Gateway / NAT Instance Configuration (Cost Optimization)
# -----------------------------------------------------------------------------

# Find a standard community/Amazon NAT AMI
data "aws_ami" "nat_ami" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn-ami-vpc-nat-hvm-*-x86_64-ebs"]
  }
}

# Security Group for NAT Instance (if used)
resource "aws_security_group" "nat" {
  count       = var.enable_cost_optimized_nat ? 1 : 0
  name        = "${var.project_name}-nat-sg"
  description = "Security Group for NAT Instance"
  vpc_id      = aws_vpc.main.id

  # Allow all traffic from private subnets
  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = concat(var.private_app_subnet_cidrs, var.private_db_subnet_cidrs)
  }

  # Allow outbound traffic to anywhere
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-nat-sg"
  }
}

# Deploy a single NAT Instance (Cost Optimized)
resource "aws_instance" "nat_instance" {
  count                  = var.enable_cost_optimized_nat ? 1 : 0
  ami                    = data.aws_ami.nat_ami.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.nat[0].id]
  source_dest_check      = false # Required for NAT function

  tags = {
    Name = "${var.project_name}-nat-instance"
  }
}

# Deploy Elastic IPs for standard AWS NAT Gateways
resource "aws_eip" "nat" {
  count  = var.enable_cost_optimized_nat ? 0 : 2
  domain = "vpc"

  tags = {
    Name = "${var.project_name}-nat-eip-${count.index + 1}"
  }
}

# Deploy AWS NAT Gateways in each AZ
resource "aws_nat_gateway" "nat" {
  count         = var.enable_cost_optimized_nat ? 0 : 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${var.project_name}-nat-gw-${count.index + 1}"
  }
}

# -----------------------------------------------------------------------------
# Route Tables for Private Subnets
# -----------------------------------------------------------------------------

# We need separate route tables for each AZ if we run multi-AZ NAT gateways.
# If we run a single NAT instance, we route all private subnets to that instance.
resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-private-rt-${count.index + 1}"
  }
}

# Routes for Private Subnets
resource "aws_route" "private_nat" {
  count                  = 2
  route_table_id         = aws_route_table.private[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  
  # Point to NAT Instance or NAT Gateway depending on configuration
  instance_id    = var.enable_cost_optimized_nat ? aws_instance.nat_instance[0].id : null
  nat_gateway_id = var.enable_cost_optimized_nat ? null : aws_nat_gateway.nat[count.index].id
}

resource "aws_route_table_association" "private_app" {
  count          = 2
  subnet_id      = aws_subnet.private_app[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Database Route Table (Usually does not route to NAT unless DB needs internet outbound)
# Since the MongoDB is hosted on Atlas, backend instances connect via private NAT route.
# If DB subnets need private-only communication (no internet), we do not add a default route.
resource "aws_route_table" "db" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-db-rt"
  }
}

resource "aws_route_table_association" "private_db" {
  count          = 2
  subnet_id      = aws_subnet.private_db[count.index].id
  route_table_id = aws_route_table.db.id
}
