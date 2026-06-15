data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "storage" {
  bucket        = "${var.project_name}-s3-bucket-${data.aws_caller_identity.current.account_id}"
  force_destroy = true

  tags = {
    Name = "${var.project_name}-s3-bucket"
  }
}
