variable "project" { type = string }
variable "environment" { type = string }
variable "vpc_cidr" { type = string default = "10.0.0.0/16" }
variable "azs" { type = list(string) }

locals {
  name_prefix = "${var.project}-${var.environment}"
}

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${local.name_prefix}-vpc"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name      = "${local.name_prefix}-igw"
    Component = "networking"
  }
}

resource "aws_subnet" "public" {
  count                   = length(var.azs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name                                                = "${local.name_prefix}-public-${regex("[0-9][a-z]$", var.azs[count.index])}"
    Component                                           = "networking"
    Tier                                                = "public"
    "kubernetes.io/role/elb"                             = "1"
    "kubernetes.io/cluster/${local.name_prefix}-cluster" = "shared"
  }
}

resource "aws_subnet" "private" {
  count             = length(var.azs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone = var.azs[count.index]

  tags = {
    Name                                                = "${local.name_prefix}-private-${regex("[0-9][a-z]$", var.azs[count.index])}"
    Component                                           = "networking"
    Tier                                                = "private"
    "kubernetes.io/role/internal-elb"                    = "1"
    "kubernetes.io/cluster/${local.name_prefix}-cluster" = "shared"
  }
}

resource "aws_eip" "nat" {
  count  = length(var.azs)
  domain = "vpc"
  tags = {
    Name      = "${local.name_prefix}-nat-eip-${regex("[0-9][a-z]$", var.azs[count.index])}"
    Component = "networking"
  }
}

resource "aws_nat_gateway" "main" {
  count         = length(var.azs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  tags = {
    Name      = "${local.name_prefix}-nat-${regex("[0-9][a-z]$", var.azs[count.index])}"
    Component = "networking"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${local.name_prefix}-public-rt" }
}

resource "aws_route_table_association" "public" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  count  = length(var.azs)
  vpc_id = aws_vpc.main.id
  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }
  tags = { Name = "${local.name_prefix}-private-rt-${regex("[0-9][a-z]$", var.azs[count.index])}" }
}

resource "aws_route_table_association" "private" {
  count          = length(var.azs)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

output "vpc_id" { value = aws_vpc.main.id }
output "public_subnet_ids" { value = aws_subnet.public[*].id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
