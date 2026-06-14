# AWS Infrastructure Provisioning and Deployment Guide

This guide details the step-by-step instructions to deploy the production-grade, highly available containerized AWS infrastructure for the **Cloud Drive** project using Terraform and configure the independent GitHub Actions CI/CD pipelines.

---

## Step-by-Step Action Plan

Follow these steps in order to set up your repository, deploy the infrastructure, and configure automated deployments.

### Step 0: Set Up Your New GitHub Repository

Before launching your AWS infrastructure, you must link your local project folder to your new GitHub repository.

1. **Create the Repository on GitHub**:
   - Go to [GitHub.com](https://github.com) and create a new repository (e.g. `new-cloud-drive`).
   - Do **NOT** initialize it with a README, `.gitignore`, or license.

2. **Configure Terraform for Your Repository**:
   - Open [terraform/variables.tf](file:///c:/Users/aryan/Desktop/s/webdev-learnings/clouddrive/terraform/variables.tf) in your editor.
   - Update the `github_repo` variable to target your new repository (e.g., `AryanPatel2106/new-cloud-drive`):
     ```hcl
     variable "github_repo" {
       description = "GitHub repository for OIDC authentication role (format: owner/repo)"
       type        = string
       default     = "AryanPatel2106/new-cloud-drive" # Update this to your repo!
     }
     ```

3. **Initialize Git and Push Code**:
   - Open a terminal in the project root (`c:/Users/aryan/Desktop/s/webdev-learnings/clouddrive`).
   - Run the following commands to initialize Git, add your remote, and commit your changes:
     ```bash
     git init
     git remote remove origin 2>/dev/null || true
     git remote add origin https://github.com/AryanPatel2106/new-cloud-drive.git
     git branch -M main
     git add .
     git commit -m "chore: setup production AWS hosting and CI/CD workflows"
     git push -u origin main
     ```

---

### Step 1: Local Prerequisites

Ensure your local machine has the following tools installed and configured:
1. **AWS CLI**: Install it and run `aws configure` to log in with your AWS credentials (IAM User with administrative permissions for resource deployment).
2. **Terraform**: Install Terraform CLI (version >= 1.5.0).
3. **Docker**: Ensure Docker is installed and running if you want to perform local tests.

---

### Step 2: Deploy AWS Infrastructure with Terraform

1. Open your terminal and change directory to the `terraform` folder:
   ```bash
   cd terraform
   ```
2. Initialize the working directory (downloads providers and setup):
   ```bash
   terraform init
   ```
3. Run a validation check to make sure code has no syntax issues:
   ```bash
   terraform validate
   ```
4. Generate an execution plan to preview what will be deployed:
   ```bash
   terraform plan -out=tfplan
   ```
   *Note: If you have an SSH Key Pair created in your AWS EC2 Console, you can pass it to the variables to enable direct Bastion access: `terraform plan -var="key_name=your-aws-key-name" -out=tfplan`. If not, leave it empty to use secure, keyless SSM Session Manager.*
5. Apply the plan to build the AWS infrastructure:
   ```bash
   terraform apply tfplan
   ```
6. **Save the output values** printed at the end of the deployment:
   - `github_actions_role_arn` (The OIDC Role ARN to copy to GitHub)
   - `public_alb_dns_name` (The public URL of your app)
   - `frontend_ecr_repository_url`
   - `backend_ecr_repository_url`

---

### Step 3: Populate Secrets Manager

Terraform creates a database configuration template in AWS Secrets Manager, but you must populate it with your actual MongoDB Atlas cluster credentials and token secrets.

1. Open the **AWS Console** and search for **Secrets Manager**.
2. Locate the secret named `clouddrive/backend/secrets`.
3. Click **Retrieve secret value** $\rightarrow$ **Edit**.
4. Update the JSON template with your actual configuration keys:
   - `MONGO_URI`: Set to your MongoDB Atlas connection string:
     `mongodb+srv://clouddrive:Manvadind8962@cluster0.pdtpgzv.mongodb.net/clouddrive`
   - `ACCESS_TOKEN_SECRET`: Set to a secure, long random string for JWT signatures.
   - `SES_FROM_EMAIL`: Set to your verified AWS SES email address (`aryanpatel8082@gmail.com`).
5. Save the secret. Any EC2 instances launched by the ASG will fetch these values on boot.

---

### Step 4: Configure GitHub Actions Secrets

To authorize GitHub Actions to build and push container images to your ECR registries, set up the OIDC configurations.

1. Open your new GitHub Repository on your web browser.
2. Go to **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
3. Click **New repository secret** and add the following two secrets:
   - **Name**: `AWS_ROLE_ARN`
   - **Value**: Use the `github_actions_role_arn` value copied from your Terraform outputs (e.g. `arn:aws:iam::260543925645:role/clouddrive-github-deploy-role`).
   - **Name**: `AWS_REGION`
   - **Value**: `ap-south-1`

---

### Step 5: Trigger Your First Deployments

Now that GitHub is authorized, you can trigger the automated pipelines to compile your Docker containers and deploy them to the EC2 instances.

1. Navigate to the **Actions** tab in your GitHub repository.
2. You will see two independent workflows: **Deploy Frontend** and **Deploy Backend**.
3. The pipelines are configured to trigger automatically on git push:
   - Pushing files inside `auth-frontend/` triggers **Deploy Frontend**.
   - Pushing root or backend files triggers **Deploy Backend**.
4. For the first setup, you can manually trigger them or push a small dummy commit (like editing a comment) to trigger both pipelines and populate your ECR repositories.
5. Once ECR repositories have at least one image version tagged with your git commit SHA, the Auto Scaling Groups will successfully fetch and launch the Docker containers during their rolling refresh.

---

### Step 6: Verifying and Testing the Application

1. **Accessing the App**: Copy the `public_alb_dns_name` output from your Terraform deployment (e.g., `clouddrive-public-alb-12345.ap-south-1.elb.amazonaws.com`) and paste it in a browser.
2. **Checking Logs**: To view live container stdout/stderr streams, go to **AWS CloudWatch Console** $\rightarrow$ **Log Groups**:
   - Frontend container logs: `/aws/ec2/clouddrive-frontend/app`
   - Backend container logs: `/aws/ec2/clouddrive-backend/app`
   - Instance boot messages: `/aws/ec2/clouddrive-backend/system-messages`
3. **SSH Access (via Bastion)**: If you need console terminal access to any instance:
   - Standard SSH: `ssh -i your-key.pem -J ec2-user@<bastion_public_ip> ec2-user@<private_instance_ip>`
   - Keyless SSM Session Manager (Recommended): Go to **AWS Systems Manager** $\rightarrow$ **Session Manager** and select any instance to start a secure terminal session directly from your browser.
