terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }

  # Remote state in S3 — shows production-grade knowledge
  backend "s3" {
    bucket         = "weather-dashboard-tfstate-revanth"
    key            = "eks/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-lock"
    encrypt        = true
  }
}


provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "weather-dashboard"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ── VPC ──────────────────────────────────────────────────────────────────────
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = true  # Cost saving for dev/staging
  enable_dns_hostnames = true
  enable_dns_support   = true

  # Required tags for EKS ALB controller
  public_subnet_tags = {
    "kubernetes.io/role/elb" = 1
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = 1
  }
}

# ── EKS Cluster ──────────────────────────────────────────────────────────────
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.project_name}-${var.environment}"
  cluster_version = "1.29"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = true

  # Managed Node Group
  eks_managed_node_groups = {
    weather_nodes = {
      name           = "weather-node-group"
      instance_types = ["t3.small"]  # Cheapest that works
      capacity_type  = "SPOT"        # Save 70% with spot instances

      min_size     = 1
      max_size     = 4
      desired_size = 2

      labels = {
        Environment = var.environment
        Project     = var.project_name
      }
    }
  }

  # Allow cluster to manage nodes
  enable_cluster_creator_admin_permissions = true
}

# ── ALB Ingress Controller IAM ────────────────────────────────────────────────
module "alb_controller_irsa" {
  source  = "terraform-aws-modules/iam/aws//modules/iam-role-for-service-accounts-eks"
  version = "~> 5.0"

  role_name                              = "${var.project_name}-alb-controller"
  attach_load_balancer_controller_policy = true

  oidc_providers = {
    eks = {
      provider_arn               = module.eks.oidc_provider_arn
      namespace_service_accounts = ["kube-system:aws-load-balancer-controller"]
    }
  }
}
