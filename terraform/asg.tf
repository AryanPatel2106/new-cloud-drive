# -----------------------------------------------------------------------------
# Bastion Host (Jump Box)
# -----------------------------------------------------------------------------

resource "aws_instance" "bastion" {
  ami                         = data.aws_ami.amazon_linux_2.id
  instance_type               = var.bastion_instance_type
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.bastion.id]
  associate_public_ip_address = true
  key_name                    = var.key_name

  tags = {
    Name = "${var.project_name}-bastion"
  }
}

# -----------------------------------------------------------------------------
# Frontend Launch Template & Auto Scaling Group
# -----------------------------------------------------------------------------

resource "aws_launch_template" "frontend" {
  name          = "${var.project_name}-frontend"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = var.frontend_instance_type
  key_name      = var.key_name

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.frontend_ec2.id]
  }

  user_data = base64encode(templatefile("${path.module}/templates/user-data-frontend.sh", {
    aws_region          = var.aws_region
    project_name        = var.project_name
    ecr_repo_url        = aws_ecr_repository.frontend.repository_url
    ssm_param_image_tag = aws_ssm_parameter.frontend_image_tag.name
    internal_alb_dns    = aws_lb.internal.dns_name
  }))

  lifecycle {
    ignore_changes = [name]
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-frontend-instance"
    }
  }

  tags = {
    Name = "${var.project_name}-frontend-lt"
  }
}

resource "aws_autoscaling_group" "frontend" {
  name_prefix         = "${var.project_name}-frontend-asg-"
  vpc_zone_identifier = [aws_subnet.private_app[0].id, aws_subnet.private_app[1].id]
  target_group_arns   = [aws_lb_target_group.frontend.arn]

  min_size             = 1
  max_size             = 4
  desired_capacity     = 2
  health_check_type    = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.frontend.id
    version = "$Latest"
  }

  # Near-Zero Downtime Rolling Deployments
  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
    triggers = ["tag"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-frontend-asg-instance"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }
}

# Frontend Target Tracking Scaling Policy (CPU based)
resource "aws_autoscaling_policy" "frontend_cpu" {
  name                   = "${var.project_name}-frontend-cpu-policy"
  policy_type            = "TargetTrackingScaling"
  autoscaling_group_name = aws_autoscaling_group.frontend.name

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

# -----------------------------------------------------------------------------
# Backend Launch Template & Auto Scaling Group
# -----------------------------------------------------------------------------

resource "aws_launch_template" "backend" {
  name          = "${var.project_name}-backend"
  image_id      = data.aws_ami.amazon_linux_2.id
  instance_type = var.backend_instance_type
  key_name      = var.key_name

  iam_instance_profile {
    name = aws_iam_instance_profile.ec2_profile.name
  }

  network_interfaces {
    associate_public_ip_address = false
    security_groups             = [aws_security_group.backend_ec2.id]
  }

  user_data = base64encode(templatefile("${path.module}/templates/user-data-backend.sh", {
    aws_region          = var.aws_region
    project_name        = var.project_name
    ecr_repo_url        = aws_ecr_repository.backend.repository_url
    ssm_param_image_tag = aws_ssm_parameter.backend_image_tag.name
    secrets_manager_id  = aws_secretsmanager_secret.backend_secrets.id
  }))

  lifecycle {
    ignore_changes = [name]
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.project_name}-backend-instance"
    }
  }

  tags = {
    Name = "${var.project_name}-backend-lt"
  }
}

resource "aws_autoscaling_group" "backend" {
  name_prefix         = "${var.project_name}-backend-asg-"
  vpc_zone_identifier = [aws_subnet.private_app[0].id, aws_subnet.private_app[1].id]
  target_group_arns   = [aws_lb_target_group.backend.arn]

  min_size             = 1
  max_size             = 4
  desired_capacity     = 2
  health_check_type    = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.backend.id
    version = "$Latest"
  }

  # Near-Zero Downtime Rolling Deployments
  instance_refresh {
    strategy = "Rolling"
    preferences {
      min_healthy_percentage = 50
    }
    triggers = ["tag"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tag {
    key                 = "Name"
    value               = "${var.project_name}-backend-asg-instance"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }
}

# Backend Target Tracking Scaling Policy (CPU based)
resource "aws_autoscaling_policy" "backend_cpu" {
  name                   = "${var.project_name}-backend-cpu-policy"
  policy_type            = "TargetTrackingScaling"
  autoscaling_group_name = aws_autoscaling_group.backend.name

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 70.0
  }
}
