# -----------------------------------------------------------------------------
# SNS Topic for Alarms and Notifications
# -----------------------------------------------------------------------------

resource "aws_sns_topic" "alerts" {
  name = "${var.project_name}-alerts-topic"

  tags = {
    Name = "${var.project_name}-alerts-topic"
  }
}

# -----------------------------------------------------------------------------
# CloudWatch Metric Alarms
# -----------------------------------------------------------------------------

# Frontend ASG CPU Utilization High Alarm
resource "aws_cloudwatch_metric_alarm" "frontend_cpu_high" {
  alarm_name          = "${var.project_name}-frontend-cpu-high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors Frontend ASG CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.frontend.name
  }
}

# Backend ASG CPU Utilization High Alarm
resource "aws_cloudwatch_metric_alarm" "backend_cpu_high" {
  alarm_name          = "${var.project_name}-backend-cpu-high"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This alarm monitors Backend ASG CPU utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    AutoScalingGroupName = aws_autoscaling_group.backend.name
  }
}

# Frontend Target Group Unhealthy Host Alarm
resource "aws_cloudwatch_metric_alarm" "frontend_unhealthy_hosts" {
  alarm_name          = "${var.project_name}-frontend-unhealthy-hosts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 0
  alarm_description   = "Unhealthy hosts count in Frontend Target Group is greater than 0"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    TargetGroup  = aws_lb_target_group.frontend.arn_suffix
    LoadBalancer = aws_lb.public.arn_suffix
  }
}

# Backend Target Group Unhealthy Host Alarm
resource "aws_cloudwatch_metric_alarm" "backend_unhealthy_hosts" {
  alarm_name          = "${var.project_name}-backend-unhealthy-hosts"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UnHealthyHostCount"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Average"
  threshold           = 0
  alarm_description   = "Unhealthy hosts count in Backend Target Group is greater than 0"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    TargetGroup  = aws_lb_target_group.backend.arn_suffix
    LoadBalancer = aws_lb.internal.arn_suffix
  }
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------

output "vpc_id" {
  description = "The VPC ID"
  value       = aws_vpc.main.id
}

output "public_alb_dns_name" {
  description = "The DNS name of the Public Load Balancer"
  value       = aws_lb.public.dns_name
}

output "internal_alb_dns_name" {
  description = "The DNS name of the Internal Load Balancer"
  value       = aws_lb.internal.dns_name
}

output "bastion_public_ip" {
  description = "The public IP of the Bastion Jump Box"
  value       = aws_instance.bastion.public_ip
}

output "frontend_ecr_repository_url" {
  description = "The URL of the Frontend ECR Repository"
  value       = aws_ecr_repository.frontend.repository_url
}

output "backend_ecr_repository_url" {
  description = "The URL of the Backend ECR Repository"
  value       = aws_ecr_repository.backend.repository_url
}

output "github_actions_role_arn" {
  description = "ARN of the IAM role to configure in GitHub Actions workflow"
  value       = aws_iam_role.github_actions.arn
}
