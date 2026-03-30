variable "project" { type = string }
variable "services" {
  type    = list(string)
  default = ["identity-svc", "catalog-svc", "inventory-svc", "cart-svc", "payment-svc", "order-svc", "delivery-svc", "bff-gateway", "admin-svc"]
}

resource "aws_ecr_repository" "services" {
  for_each = toset(var.services)

  name                 = "sk/${each.value}"
  image_tag_mutability = "IMMUTABLE"
  force_delete         = false

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Component          = "registry"
    DataClassification = "internal"
  }
}

resource "aws_ecr_lifecycle_policy" "cleanup" {
  for_each   = toset(var.services)
  repository = aws_ecr_repository.services[each.key].name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 20 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 20
      }
      action = { type = "expire" }
    }]
  })
}

output "repository_urls" {
  value = { for k, v in aws_ecr_repository.services : k => v.repository_url }
}
