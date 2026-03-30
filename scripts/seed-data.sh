#!/usr/bin/env bash
set -euo pipefail

echo "=== SwasthKart Seed Script ==="
echo "Seeding catalog and inventory data..."

CATALOG_URL="${CATALOG_URL:-http://localhost:3002}"
INVENTORY_URL="${INVENTORY_URL:-http://localhost:3003}"

# Wait for services to be ready
echo "Waiting for catalog-service..."
for i in $(seq 1 30); do
  if curl -sf "${CATALOG_URL}/health/live" > /dev/null 2>&1; then break; fi
  sleep 2
done

echo "Waiting for inventory-service..."
for i in $(seq 1 30); do
  if curl -sf "${INVENTORY_URL}/health/live" > /dev/null 2>&1; then break; fi
  sleep 2
done

echo ""
echo "--- Creating Categories ---"

# Categories
NUTS_ID=$(curl -sf -X POST "${CATALOG_URL}/v1/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuts & Seeds","slug":"nuts-seeds","image_url":"","sort_order":1,"is_active":true}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created: Nuts & Seeds ($NUTS_ID)"

GRAINS_ID=$(curl -sf -X POST "${CATALOG_URL}/v1/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"Whole Grains","slug":"whole-grains","image_url":"","sort_order":2,"is_active":true}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created: Whole Grains ($GRAINS_ID)"

OILS_ID=$(curl -sf -X POST "${CATALOG_URL}/v1/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"Healthy Oils","slug":"healthy-oils","image_url":"","sort_order":3,"is_active":true}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created: Healthy Oils ($OILS_ID)"

SNACKS_ID=$(curl -sf -X POST "${CATALOG_URL}/v1/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"Healthy Snacks","slug":"healthy-snacks","image_url":"","sort_order":4,"is_active":true}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created: Healthy Snacks ($SNACKS_ID)"

SUPER_ID=$(curl -sf -X POST "${CATALOG_URL}/v1/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"Superfoods","slug":"superfoods","image_url":"","sort_order":5,"is_active":true}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created: Superfoods ($SUPER_ID)"

DAIRY_ID=$(curl -sf -X POST "${CATALOG_URL}/v1/admin/categories" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dairy Alternatives","slug":"dairy-alternatives","image_url":"","sort_order":6,"is_active":true}' | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created: Dairy Alternatives ($DAIRY_ID)"

echo ""
echo "--- Creating Products ---"

create_product() {
  local name="$1" slug="$2" brand="$3" desc="$4" cat_id="$5"
  local mrp="$6" price="$7" unit="$8" unit_val="$9" sku="${10}"
  local nutrition="${11}" allergens="${12}"

  PRODUCT_ID=$(curl -sf -X POST "${CATALOG_URL}/v1/admin/products" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\":\"${name}\",
      \"slug\":\"${slug}\",
      \"description\":\"${desc}\",
      \"brand\":\"${brand}\",
      \"image_urls\":[],
      \"category_id\":\"${cat_id}\",
      \"mrp_paise\":${mrp},
      \"selling_price_paise\":${price},
      \"unit\":\"${unit}\",
      \"unit_value\":${unit_val},
      \"nutrition_info\":${nutrition},
      \"allergens\":${allergens},
      \"is_active\":true
    }" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

  echo "  Product: ${name} ($PRODUCT_ID)"

  # Seed inventory
  curl -sf -X POST "${INVENTORY_URL}/v1/admin/inventory" \
    -H "Content-Type: application/json" \
    -d "{\"sku\":\"${sku}\",\"product_id\":\"${PRODUCT_ID}\",\"total_qty\":100,\"available_qty\":100}" > /dev/null 2>&1 || true
}

# Nuts & Seeds
create_product "Premium California Almonds" "premium-california-almonds" "NutriPure" \
  "Raw, unsalted California almonds packed with protein and healthy fats" \
  "$NUTS_ID" 79900 64900 "g" 500 "SKU-ALM-500" \
  '{"calories":579,"protein_g":21.2,"carbs_g":21.6,"fat_g":49.9,"fiber_g":12.5,"serving_size":"30","serving_unit":"g"}' \
  '["tree_nuts"]'

create_product "Organic Chia Seeds" "organic-chia-seeds" "SuperSeed" \
  "Omega-3 rich organic chia seeds, perfect for smoothies and puddings" \
  "$NUTS_ID" 44900 34900 "g" 250 "SKU-CHIA-250" \
  '{"calories":486,"protein_g":16.5,"carbs_g":42.1,"fat_g":30.7,"fiber_g":34.4,"serving_size":"15","serving_unit":"g"}' \
  '[]'

create_product "Roasted Flax Seeds" "roasted-flax-seeds" "NutriPure" \
  "Lightly roasted flax seeds, a great source of fiber and omega-3" \
  "$NUTS_ID" 29900 24900 "g" 400 "SKU-FLAX-400" \
  '{"calories":534,"protein_g":18.3,"carbs_g":28.9,"fat_g":42.2,"fiber_g":27.3,"serving_size":"15","serving_unit":"g"}' \
  '[]'

create_product "Raw Cashews" "raw-cashews" "FarmFresh" \
  "W320 grade whole raw cashews, perfect for snacking and cooking" \
  "$NUTS_ID" 99900 84900 "g" 500 "SKU-CASH-500" \
  '{"calories":553,"protein_g":18.2,"carbs_g":30.2,"fat_g":43.9,"fiber_g":3.3,"serving_size":"30","serving_unit":"g"}' \
  '["tree_nuts"]'

# Whole Grains
create_product "Organic Brown Rice" "organic-brown-rice" "GrainMasters" \
  "Unpolished brown rice with the bran layer intact, rich in fiber" \
  "$GRAINS_ID" 24900 19900 "kg" 1 "SKU-BRICE-1KG" \
  '{"calories":362,"protein_g":7.5,"carbs_g":76.2,"fat_g":2.7,"fiber_g":3.4,"serving_size":"100","serving_unit":"g"}' \
  '[]'

create_product "Steel Cut Oats" "steel-cut-oats" "OatWell" \
  "Minimally processed steel cut oats for a hearty, nutritious breakfast" \
  "$GRAINS_ID" 34900 27900 "g" 750 "SKU-OATS-750" \
  '{"calories":389,"protein_g":16.9,"carbs_g":66.3,"fat_g":6.9,"fiber_g":10.6,"serving_size":"40","serving_unit":"g"}' \
  '["gluten"]'

create_product "Organic Quinoa" "organic-quinoa" "SuperSeed" \
  "Complete protein quinoa, gluten-free and rich in essential amino acids" \
  "$GRAINS_ID" 54900 44900 "g" 500 "SKU-QUIN-500" \
  '{"calories":368,"protein_g":14.1,"carbs_g":64.2,"fat_g":6.1,"fiber_g":7.0,"serving_size":"50","serving_unit":"g"}' \
  '[]'

# Healthy Oils
create_product "Cold Pressed Coconut Oil" "cold-pressed-coconut-oil" "PurePress" \
  "Virgin cold-pressed coconut oil, ideal for cooking and skincare" \
  "$OILS_ID" 49900 39900 "ml" 500 "SKU-COCOIL-500" \
  '{"calories":862,"protein_g":0,"carbs_g":0,"fat_g":100,"fiber_g":0,"serving_size":"15","serving_unit":"ml"}' \
  '[]'

create_product "Extra Virgin Olive Oil" "extra-virgin-olive-oil" "MediFresh" \
  "First cold press extra virgin olive oil, imported from Mediterranean" \
  "$OILS_ID" 89900 74900 "ml" 500 "SKU-OLIVE-500" \
  '{"calories":884,"protein_g":0,"carbs_g":0,"fat_g":100,"fiber_g":0,"serving_size":"15","serving_unit":"ml"}' \
  '[]'

# Healthy Snacks
create_product "Multigrain Protein Bars" "multigrain-protein-bars" "FitBite" \
  "Pack of 6 high-protein bars with dates, nuts, and seeds" \
  "$SNACKS_ID" 44900 37900 "g" 360 "SKU-PBAR-6PK" \
  '{"calories":180,"protein_g":12,"carbs_g":22,"fat_g":7,"fiber_g":3,"serving_size":"60","serving_unit":"g"}' \
  '["tree_nuts","gluten","soy"]'

create_product "Baked Vegetable Chips" "baked-vegetable-chips" "CrunchWell" \
  "Assorted baked veggie chips — beetroot, sweet potato, and spinach" \
  "$SNACKS_ID" 19900 16900 "g" 150 "SKU-VCHIP-150" \
  '{"calories":420,"protein_g":5,"carbs_g":58,"fat_g":18,"fiber_g":6,"serving_size":"30","serving_unit":"g"}' \
  '[]'

# Superfoods
create_product "Organic Spirulina Powder" "organic-spirulina-powder" "GreenVitality" \
  "Pure organic spirulina powder, rich in iron and B-vitamins" \
  "$SUPER_ID" 64900 54900 "g" 200 "SKU-SPIRU-200" \
  '{"calories":290,"protein_g":57.5,"carbs_g":23.9,"fat_g":7.7,"fiber_g":3.6,"serving_size":"5","serving_unit":"g"}' \
  '[]'

create_product "Raw Cacao Nibs" "raw-cacao-nibs" "SuperSeed" \
  "Unprocessed cacao nibs, a natural source of antioxidants and magnesium" \
  "$SUPER_ID" 49900 39900 "g" 250 "SKU-CACAO-250" \
  '{"calories":228,"protein_g":13.9,"carbs_g":34.7,"fat_g":13.7,"fiber_g":33.2,"serving_size":"20","serving_unit":"g"}' \
  '[]'

# Dairy Alternatives
create_product "Oat Milk" "oat-milk-original" "PlantPour" \
  "Creamy oat milk, fortified with calcium and vitamin D" \
  "$DAIRY_ID" 24900 19900 "ml" 1000 "SKU-OATMILK-1L" \
  '{"calories":46,"protein_g":1,"carbs_g":7.5,"fat_g":1.5,"fiber_g":0.8,"serving_size":"200","serving_unit":"ml"}' \
  '["gluten"]'

create_product "Almond Milk Unsweetened" "almond-milk-unsweetened" "PlantPour" \
  "Pure unsweetened almond milk, low calorie dairy alternative" \
  "$DAIRY_ID" 29900 24900 "ml" 1000 "SKU-ALMILK-1L" \
  '{"calories":15,"protein_g":0.5,"carbs_g":0.3,"fat_g":1.2,"fiber_g":0,"serving_size":"200","serving_unit":"ml"}' \
  '["tree_nuts"]'

echo ""
echo "=== Seed complete! ==="
echo "Created 6 categories and 15 products with inventory."
