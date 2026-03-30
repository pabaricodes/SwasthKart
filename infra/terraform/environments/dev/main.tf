provider "aws" {
  region = "ap-south-1"

  default_tags {
    tags = {
      Project     = "swasthkart"
      Environment = "dev"
      ManagedBy   = "terraform"
    }
  }
}

locals {
  project     = "swasthkart"
  environment = "dev"
  azs         = ["ap-south-1a", "ap-south-1b"]
}

module "vpc" {
  source      = "../../modules/vpc"
  project     = local.project
  environment = local.environment
  azs         = local.azs
}

module "eks" {
  source              = "../../modules/eks"
  project             = local.project
  environment         = local.environment
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  node_instance_types = ["t3.medium"]
  node_desired_size   = 2
  node_min_size       = 2
  node_max_size       = 5
}

module "ecr" {
  source  = "../../modules/ecr"
  project = local.project
}

module "frontend" {
  source      = "../../modules/s3-cloudfront"
  project     = local.project
  environment = local.environment
}

output "cluster_name" { value = module.eks.cluster_name }
output "cluster_endpoint" { value = module.eks.cluster_endpoint }
output "ecr_repos" { value = module.ecr.repository_urls }
output "frontend_bucket" { value = module.frontend.bucket_name }
output "frontend_cdn_domain" { value = module.frontend.distribution_domain }
