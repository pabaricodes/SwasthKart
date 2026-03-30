#!/usr/bin/env bash
set -euo pipefail

# Deploy frontend to S3 + CloudFront
# Usage: ./scripts/deploy-frontend.sh [env]
#   env: dev or prod (default: dev)

ENV="${1:-dev}"
BUCKET="swasthkart-${ENV}-frontend"
DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"

echo "=== Deploying Frontend (${ENV}) ==="

# Build
echo "Building frontend..."
cd "$(dirname "$0")/../frontend"
npm ci
npm run build

# Upload to S3
echo "Syncing to s3://${BUCKET}..."
aws s3 sync dist/ "s3://${BUCKET}" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "index.html" \
  --exclude "*.json"

# Upload index.html with no-cache
aws s3 cp dist/index.html "s3://${BUCKET}/index.html" \
  --cache-control "no-cache, no-store, must-revalidate"

# Invalidate CloudFront cache
if [ -n "$DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront distribution ${DISTRIBUTION_ID}..."
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text
  echo "Invalidation created."
else
  echo "CLOUDFRONT_DISTRIBUTION_ID not set, skipping cache invalidation."
fi

echo "=== Frontend deployed to ${ENV} ==="
