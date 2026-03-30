#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# SwasthKart Smoke Test
# ---------------------
# Walks through the full user journey via curl against the BFF gateway and
# individual micro-services.  Designed to run after `make up && make seed`.
#
# Usage:
#   ./scripts/smoke-test.sh                      # defaults to localhost:3000
#   BASE_URL=http://staging.example.com ./scripts/smoke-test.sh
###############################################################################

# ── Configuration ────────────────────────────────────────────────────────────

BASE_URL="${BASE_URL:-http://localhost:3000}"

IDENTITY_URL="${IDENTITY_URL:-http://localhost:3001}"
CATALOG_URL="${CATALOG_URL:-http://localhost:3002}"
INVENTORY_URL="${INVENTORY_URL:-http://localhost:3003}"
CART_URL="${CART_URL:-http://localhost:3004}"
PAYMENT_URL="${PAYMENT_URL:-http://localhost:3005}"
ORDER_URL="${ORDER_URL:-http://localhost:3006}"
DELIVERY_URL="${DELIVERY_URL:-http://localhost:3007}"

COOKIE_JAR="/tmp/swasthkart-smoke-cookies-$$.txt"
PHONE="+919999900001"

# ── Colours ──────────────────────────────────────────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Colour

# ── Counters ─────────────────────────────────────────────────────────────────

PASS=0
FAIL=0

# ── Helpers ──────────────────────────────────────────────────────────────────

pass() {
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}PASS${NC}  $1"
}

fail() {
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}FAIL${NC}  $1"
  if [[ -n "${2:-}" ]]; then
    echo -e "        ${RED}↳ $2${NC}"
  fi
}

section() {
  echo ""
  echo -e "${CYAN}${BOLD}━━━ $1 ━━━${NC}"
}

cleanup() {
  rm -f "$COOKIE_JAR"
}
trap cleanup EXIT

# json_extract KEY [INPUT]
# Reads stdin (or $2) and extracts a top-level key via python3.
json_extract() {
  local key="$1"
  python3 -c "
import sys, json
data = json.load(sys.stdin)
val = data
for k in '${key}'.split('.'):
    if isinstance(val, list):
        val = val[int(k)]
    else:
        val = val[k]
print(val)
"
}

# json_extract_safe KEY – like json_extract but returns empty string on failure
json_extract_safe() {
  local key="$1"
  python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    val = data
    for k in '${key}'.split('.'):
        if isinstance(val, list):
            val = val[int(k)]
        else:
            val = val[k]
    print(val)
except Exception:
    print('')
" 2>/dev/null || echo ""
}

###############################################################################
#                              TEST FUNCTIONS                                 #
###############################################################################

# ── 1. Health Checks (liveness) ──────────────────────────────────────────────

test_health_live() {
  local name="$1" url="$2"
  local body
  if body=$(curl -sf --max-time 5 "$url" 2>&1); then
    pass "$name liveness ($url)"
  else
    fail "$name liveness ($url)" "curl exited non-zero"
  fi
}

run_liveness_checks() {
  section "Liveness Health Checks"

  test_health_live "identity-service"  "${IDENTITY_URL}/health/live"
  test_health_live "catalog-service"   "${CATALOG_URL}/health/live"
  # inventory-service is Spring Boot; actuator exposes /actuator/health.
  # The seed script polls /health/live which may also be wired up; try both.
  if curl -sf --max-time 5 "${INVENTORY_URL}/health/live" >/dev/null 2>&1; then
    pass "inventory-service liveness (${INVENTORY_URL}/health/live)"
  elif curl -sf --max-time 5 "${INVENTORY_URL}/actuator/health" >/dev/null 2>&1; then
    pass "inventory-service liveness (${INVENTORY_URL}/actuator/health)"
  else
    fail "inventory-service liveness" "neither /health/live nor /actuator/health responded"
  fi
  test_health_live "cart-service"      "${CART_URL}/health/live"
  test_health_live "payment-service"   "${PAYMENT_URL}/health/live"
  test_health_live "order-service"     "${ORDER_URL}/health/live"
  test_health_live "delivery-service"  "${DELIVERY_URL}/health/live"
  test_health_live "bff-gateway"       "${BASE_URL}/health/live"
}

# ── 2. Readiness Checks ─────────────────────────────────────────────────────

test_health_ready() {
  local name="$1" url="$2"
  if curl -sf --max-time 5 "$url" >/dev/null 2>&1; then
    pass "$name readiness ($url)"
  else
    fail "$name readiness ($url)" "curl exited non-zero"
  fi
}

run_readiness_checks() {
  section "Readiness Health Checks (DB connectivity)"

  test_health_ready "identity-service"  "${IDENTITY_URL}/health/ready"
  test_health_ready "catalog-service"   "${CATALOG_URL}/health/ready"
  # inventory: try /health/ready first, fall back to /actuator/health
  if curl -sf --max-time 5 "${INVENTORY_URL}/health/ready" >/dev/null 2>&1; then
    pass "inventory-service readiness (${INVENTORY_URL}/health/ready)"
  elif curl -sf --max-time 5 "${INVENTORY_URL}/actuator/health" >/dev/null 2>&1; then
    pass "inventory-service readiness (${INVENTORY_URL}/actuator/health)"
  else
    fail "inventory-service readiness" "neither /health/ready nor /actuator/health responded"
  fi
  test_health_ready "cart-service"      "${CART_URL}/health/ready"
  test_health_ready "payment-service"   "${PAYMENT_URL}/health/ready"
  test_health_ready "order-service"     "${ORDER_URL}/health/ready"
  test_health_ready "delivery-service"  "${DELIVERY_URL}/health/ready"
  test_health_ready "bff-gateway"       "${BASE_URL}/health/ready"
}

# ── 3. Auth Flow ─────────────────────────────────────────────────────────────

run_auth_flow() {
  section "Auth Flow (OTP)"

  # 3a. Send OTP
  local send_body
  send_body=$(curl -s --max-time 10 -w "\n%{http_code}" \
    -X POST "${BASE_URL}/api/v1/auth/otp/send" \
    -H "Content-Type: application/json" \
    -d "{\"phone\": \"${PHONE}\"}")

  local send_http_code
  send_http_code=$(echo "$send_body" | tail -n1)
  send_body=$(echo "$send_body" | sed '$d')

  if [[ "$send_http_code" == "200" ]]; then
    pass "POST /api/v1/auth/otp/send → 200"
  else
    fail "POST /api/v1/auth/otp/send → expected 200, got ${send_http_code}" "$send_body"
    echo -e "  ${YELLOW}⚠  Cannot continue auth flow without OTP send.${NC}"
    return
  fi

  # 3b. Verify OTP
  # The identity-service logs the OTP to stdout (mock mode).
  # In dev mode we try the fixed OTP "123456" first; if that fails the test
  # still continues but auth-dependent tests will be skipped.
  local verify_body
  verify_body=$(curl -s --max-time 10 -w "\n%{http_code}" \
    -X POST "${BASE_URL}/api/v1/auth/otp/verify" \
    -H "Content-Type: application/json" \
    -c "$COOKIE_JAR" \
    -d "{\"phone\": \"${PHONE}\", \"otp\": \"123456\"}")

  local verify_http_code
  verify_http_code=$(echo "$verify_body" | tail -n1)
  verify_body=$(echo "$verify_body" | sed '$d')

  if [[ "$verify_http_code" == "200" ]]; then
    pass "POST /api/v1/auth/otp/verify → 200 (cookie saved)"
  else
    fail "POST /api/v1/auth/otp/verify → expected 200, got ${verify_http_code}" \
         "OTP \"123456\" was rejected — the identity-service logs the real OTP to stdout"
    echo -e "  ${YELLOW}⚠  Auth-dependent tests (cart, profile) will be skipped.${NC}"
  fi
}

has_auth_cookie() {
  [[ -f "$COOKIE_JAR" ]] && grep -q "sk_token" "$COOKIE_JAR" 2>/dev/null
}

# ── 4. Browse Flow ───────────────────────────────────────────────────────────

CATEGORY_SLUG=""
PRODUCT_ID=""
PRODUCT_SKU=""

run_browse_flow() {
  section "Browse Flow (public)"

  # 4a. Home page
  local home_body
  home_body=$(curl -sf --max-time 10 "${BASE_URL}/api/v1/ui/home" 2>&1) || true

  if [[ -z "$home_body" ]]; then
    fail "GET /api/v1/ui/home" "empty or failed response"
    return
  fi

  # Check for categories in response
  local has_categories
  has_categories=$(echo "$home_body" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    cats = d.get('categories', [])
    print('yes' if len(cats) > 0 else 'no')
except:
    print('no')
" 2>/dev/null || echo "no")

  if [[ "$has_categories" == "yes" ]]; then
    pass "GET /api/v1/ui/home → has categories"
  else
    fail "GET /api/v1/ui/home → no categories found" "ensure seed data exists"
  fi

  # Extract first category slug
  CATEGORY_SLUG=$(echo "$home_body" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    cats = d.get('categories', [])
    print(cats[0].get('slug', ''))
except:
    print('')
" 2>/dev/null || echo "")

  if [[ -z "$CATEGORY_SLUG" ]]; then
    fail "Extract category slug from /home" "could not parse slug"
    return
  fi
  pass "Extracted category slug: ${CATEGORY_SLUG}"

  # 4b. Category page
  local cat_body
  cat_body=$(curl -sf --max-time 10 "${BASE_URL}/api/v1/ui/category/${CATEGORY_SLUG}" 2>&1) || true

  if [[ -z "$cat_body" ]]; then
    fail "GET /api/v1/ui/category/${CATEGORY_SLUG}" "empty or failed response"
    return
  fi

  local product_count
  product_count=$(echo "$cat_body" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    prods = d.get('products', {}).get('data', [])
    print(len(prods))
except:
    print(0)
" 2>/dev/null || echo "0")

  if [[ "$product_count" -gt 0 ]]; then
    pass "GET /api/v1/ui/category/${CATEGORY_SLUG} → ${product_count} products"
  else
    fail "GET /api/v1/ui/category/${CATEGORY_SLUG} → no products" ""
  fi

  # Extract product_id and sku from first product
  read -r PRODUCT_ID PRODUCT_SKU < <(echo "$cat_body" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    p = d['products']['data'][0]
    pid = p.get('id', '')
    sku = p.get('slug', p.get('sku', ''))  # slug doubles as sku identifier
    print(pid, sku)
except:
    print('', '')
" 2>/dev/null || echo "")

  if [[ -z "$PRODUCT_ID" ]]; then
    fail "Extract product_id from category page" ""
    return
  fi
  pass "Extracted product_id: ${PRODUCT_ID}"

  # 4c. Product detail page
  local pdp_body
  pdp_body=$(curl -sf --max-time 10 "${BASE_URL}/api/v1/ui/pdp/${PRODUCT_ID}" 2>&1) || true

  if [[ -z "$pdp_body" ]]; then
    fail "GET /api/v1/ui/pdp/${PRODUCT_ID}" "empty or failed response"
    return
  fi

  local pdp_name
  pdp_name=$(echo "$pdp_body" | json_extract_safe "name")

  if [[ -n "$pdp_name" ]]; then
    pass "GET /api/v1/ui/pdp/${PRODUCT_ID} → ${pdp_name}"
  else
    fail "GET /api/v1/ui/pdp/${PRODUCT_ID} → could not parse product name" ""
  fi

  # Try to get a proper SKU from inventory/stock info in PDP response
  local pdp_sku
  pdp_sku=$(echo "$pdp_body" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    s = d.get('stock', {})
    if s:
        print(s.get('sku', ''))
    else:
        print('')
except:
    print('')
" 2>/dev/null || echo "")

  if [[ -n "$pdp_sku" ]]; then
    PRODUCT_SKU="$pdp_sku"
    pass "Extracted SKU from PDP: ${PRODUCT_SKU}"
  fi
}

# ── 5. Cart Flow ─────────────────────────────────────────────────────────────

run_cart_flow() {
  section "Cart Flow (authenticated)"

  if ! has_auth_cookie; then
    echo -e "  ${YELLOW}SKIP${NC}  No auth cookie — skipping cart tests"
    return
  fi

  if [[ -z "$PRODUCT_ID" ]]; then
    echo -e "  ${YELLOW}SKIP${NC}  No product_id — skipping cart tests"
    return
  fi

  # Use slug as SKU fallback if we don't have a proper SKU
  local sku="${PRODUCT_SKU:-SKU-ALM-500}"

  # 5a. Add item to cart
  local add_body add_http
  add_body=$(curl -s --max-time 10 -w "\n%{http_code}" \
    -X POST "${BASE_URL}/api/v1/ui/cart/items" \
    -H "Content-Type: application/json" \
    -H "Idempotency-Key: smoke-test-$$" \
    -b "$COOKIE_JAR" \
    -d "{\"product_id\": \"${PRODUCT_ID}\", \"sku\": \"${sku}\", \"quantity\": 1}")

  add_http=$(echo "$add_body" | tail -n1)
  add_body=$(echo "$add_body" | sed '$d')

  if [[ "$add_http" == "200" || "$add_http" == "201" ]]; then
    pass "POST /api/v1/ui/cart/items → ${add_http}"
  else
    fail "POST /api/v1/ui/cart/items → expected 200/201, got ${add_http}" "$add_body"
  fi

  # 5b. Get cart
  local cart_body cart_http
  cart_body=$(curl -s --max-time 10 -w "\n%{http_code}" \
    -b "$COOKIE_JAR" \
    "${BASE_URL}/api/v1/ui/cart")

  cart_http=$(echo "$cart_body" | tail -n1)
  cart_body=$(echo "$cart_body" | sed '$d')

  if [[ "$cart_http" == "200" ]]; then
    pass "GET /api/v1/ui/cart → 200"
  else
    fail "GET /api/v1/ui/cart → expected 200, got ${cart_http}" "$cart_body"
  fi
}

# ── 6. Profile & Address Flow ───────────────────────────────────────────────

run_profile_flow() {
  section "Profile & Address Flow (authenticated)"

  if ! has_auth_cookie; then
    echo -e "  ${YELLOW}SKIP${NC}  No auth cookie — skipping profile tests"
    return
  fi

  # 6a. Get profile
  local profile_body profile_http
  profile_body=$(curl -s --max-time 10 -w "\n%{http_code}" \
    -b "$COOKIE_JAR" \
    "${BASE_URL}/api/v1/ui/profile")

  profile_http=$(echo "$profile_body" | tail -n1)
  profile_body=$(echo "$profile_body" | sed '$d')

  if [[ "$profile_http" == "200" ]]; then
    pass "GET /api/v1/ui/profile → 200"
  else
    fail "GET /api/v1/ui/profile → expected 200, got ${profile_http}" "$profile_body"
  fi

  # 6b. Add address
  local addr_body addr_http
  addr_body=$(curl -s --max-time 10 -w "\n%{http_code}" \
    -X POST "${BASE_URL}/api/v1/ui/addresses" \
    -H "Content-Type: application/json" \
    -b "$COOKIE_JAR" \
    -d '{
      "label": "Home",
      "line1": "42 Health Street",
      "line2": "Apt 7B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "is_default": true
    }')

  addr_http=$(echo "$addr_body" | tail -n1)
  addr_body=$(echo "$addr_body" | sed '$d')

  if [[ "$addr_http" == "200" || "$addr_http" == "201" ]]; then
    pass "POST /api/v1/ui/addresses → ${addr_http}"
  else
    fail "POST /api/v1/ui/addresses → expected 200/201, got ${addr_http}" "$addr_body"
  fi

  # 6c. List addresses
  local list_body list_http
  list_body=$(curl -s --max-time 10 -w "\n%{http_code}" \
    -b "$COOKIE_JAR" \
    "${BASE_URL}/api/v1/ui/addresses")

  list_http=$(echo "$list_body" | tail -n1)
  list_body=$(echo "$list_body" | sed '$d')

  if [[ "$list_http" == "200" ]]; then
    pass "GET /api/v1/ui/addresses → 200"
  else
    fail "GET /api/v1/ui/addresses → expected 200, got ${list_http}" "$list_body"
  fi
}

###############################################################################
#                                  MAIN                                       #
###############################################################################

echo ""
echo -e "${BOLD}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}║         SwasthKart Smoke Test Suite               ║${NC}"
echo -e "${BOLD}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  BFF Gateway:  ${CYAN}${BASE_URL}${NC}"
echo -e "  Cookie jar:   ${COOKIE_JAR}"
echo -e "  Test phone:   ${PHONE}"

run_liveness_checks
run_readiness_checks
run_auth_flow
run_browse_flow
run_cart_flow
run_profile_flow

# ── Summary ──────────────────────────────────────────────────────────────────

TOTAL=$((PASS + FAIL))

echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}PASSED: ${PASS}${NC}  ${RED}FAILED: ${FAIL}${NC}  TOTAL: ${TOTAL}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi
