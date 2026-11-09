#!/bin/bash

# Warehouse4u API Test Script
# Based on openapi.json specification

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print section headers
print_header() {
    echo ""
    echo "=========================================="
    echo -e "${YELLOW}$1${NC}"
    echo "=========================================="
}

# Helper function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
    else
        echo -e "${RED}✗ $2${NC}"
    fi
}

# Helper function to extract JSON field (simple, without jq dependency)
extract_field() {
    echo "$1" | grep -o "\"$2\":[^,}]*" | head -1 | sed 's/.*:[" ]*//' | tr -d '"'
}

# ==========================================
# HAPPY PATH TESTS
# ==========================================

print_header "HAPPY PATH TESTS"

# ------------------------------------------
# 1. Create new product
# ------------------------------------------
print_header "1. Create new product"

PRODUCT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/products" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Product",
        "category": "Электроника",
        "units": "штук, шт."
    }')

HTTP_CODE=$(echo "$PRODUCT_RESPONSE" | tail -1)
BODY=$(echo "$PRODUCT_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 201 ] && echo 0 || echo 1) "Create product (HTTP $HTTP_CODE)"
echo "Response: $BODY"

PRODUCT_ID=$(extract_field "$BODY" "id")
echo "Product ID: $PRODUCT_ID"

# ------------------------------------------
# 2. Create two new warehouses
# ------------------------------------------
print_header "2. Create two new warehouses"

WAREHOUSE1_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/warehouses" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Warehouse A",
        "address": "г. Москва, ул. Тестовая, 1"
    }')

HTTP_CODE1=$(echo "$WAREHOUSE1_RESPONSE" | tail -1)
BODY1=$(echo "$WAREHOUSE1_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE1" -eq 201 ] && echo 0 || echo 1) "Create warehouse A (HTTP $HTTP_CODE1)"
echo "Response: $BODY1"

WAREHOUSE1_ID=$(extract_field "$BODY1" "id")
echo "Warehouse A ID: $WAREHOUSE1_ID"

WAREHOUSE2_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/warehouses" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Warehouse B",
        "address": "г. Москва, ул. Тестовая, 2"
    }')

HTTP_CODE2=$(echo "$WAREHOUSE2_RESPONSE" | tail -1)
BODY2=$(echo "$WAREHOUSE2_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE2" -eq 201 ] && echo 0 || echo 1) "Create warehouse B (HTTP $HTTP_CODE2)"
echo "Response: $BODY2"

WAREHOUSE2_ID=$(extract_field "$BODY2" "id")
echo "Warehouse B ID: $WAREHOUSE2_ID"

# ------------------------------------------
# 3. Create a stock item on one warehouse
# ------------------------------------------
print_header "3. Create stock item on warehouse A"

STOCK_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/warehouses/$WAREHOUSE1_ID/stock" \
    -H "Content-Type: application/json" \
    -d "{
        \"product_id\": $PRODUCT_ID,
        \"quantity\": 100
    }")

HTTP_CODE=$(echo "$STOCK_RESPONSE" | tail -1)
BODY=$(echo "$STOCK_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 201 ] && echo 0 || echo 1) "Create stock item (HTTP $HTTP_CODE)"
echo "Response: $BODY"

STOCK_ID=$(extract_field "$BODY" "id")
echo "Stock Item ID: $STOCK_ID"

# ------------------------------------------
# 4. Create a movement of stock item to other warehouse
# ------------------------------------------
print_header "4. Create movement from warehouse A to warehouse B"

MOVEMENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/movements" \
    -H "Content-Type: application/json" \
    -d "{
        \"out_warehouse_id\": $WAREHOUSE1_ID,
        \"in_warehouse_id\": $WAREHOUSE2_ID,
        \"product_id\": $PRODUCT_ID,
        \"quantity\": 30,
        \"date\": \"2025-01-15T10:00:00Z\",
        \"operator\": \"Иванов И.И.\"
    }")

HTTP_CODE=$(echo "$MOVEMENT_RESPONSE" | tail -1)
BODY=$(echo "$MOVEMENT_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 201 ] && echo 0 || echo 1) "Create movement (HTTP $HTTP_CODE)"
echo "Response: $BODY"

MOVEMENT_ID=$(extract_field "$BODY" "id")
echo "Movement ID: $MOVEMENT_ID"

# ------------------------------------------
# 5. Create stock report across all warehouses and categories
# ------------------------------------------
print_header "5. Generate stock report (XLSX)"

REPORT_FILE="stock_report_$(date +%Y%m%d_%H%M%S).xlsx"
REPORT_HTTP_CODE=$(curl -s -o "$REPORT_FILE" -w "%{http_code}" -X POST "$BASE_URL/api/reports/stock" \
    -H "Content-Type: application/json" \
    -d "{
        \"warehouseIds\": [$WAREHOUSE1_ID, $WAREHOUSE2_ID],
        \"categories\": [\"Электроника\"]
    }")

print_result $([ "$REPORT_HTTP_CODE" -eq 200 ] && echo 0 || echo 1) "Generate report (HTTP $REPORT_HTTP_CODE)"

if [ "$REPORT_HTTP_CODE" -eq 200 ]; then
    if [ -s "$REPORT_FILE" ]; then
        FILE_SIZE=$(stat -c%s "$REPORT_FILE" 2>/dev/null || stat -f%z "$REPORT_FILE" 2>/dev/null)
        echo -e "${GREEN}Report saved: $REPORT_FILE (${FILE_SIZE} bytes)${NC}"
    else
        echo -e "${RED}Report file is empty${NC}"
    fi
fi

# ==========================================
# ERROR TESTS
# ==========================================

print_header "ERROR TESTS"

# ------------------------------------------
# Error 1: Create product without required name field
# ------------------------------------------
print_header "Error 1: Create product without name (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/products" \
    -H "Content-Type: application/json" \
    -d '{
        "category": "Электроника"
    }')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Missing name field (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 2: Create warehouse without required fields
# ------------------------------------------
print_header "Error 2: Create warehouse without address (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/warehouses" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Incomplete Warehouse"
    }')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Missing address field (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 3: Create stock item with non-existent product
# ------------------------------------------
print_header "Error 3: Create stock with non-existent product (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/warehouses/$WAREHOUSE1_ID/stock" \
    -H "Content-Type: application/json" \
    -d '{
        "product_id": 999999,
        "quantity": 10
    }')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Non-existent product (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 4: Create stock item with negative quantity
# ------------------------------------------
print_header "Error 4: Create stock with negative quantity (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/warehouses/$WAREHOUSE1_ID/stock" \
    -H "Content-Type: application/json" \
    -d "{
        \"product_id\": $PRODUCT_ID,
        \"quantity\": -5
    }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Negative quantity (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 5: Create stock item on non-existent warehouse
# ------------------------------------------
print_header "Error 5: Create stock on non-existent warehouse (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/warehouses/999999/stock" \
    -H "Content-Type: application/json" \
    -d "{
        \"product_id\": $PRODUCT_ID,
        \"quantity\": 10
    }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Non-existent warehouse (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 6: Create movement with quantity exceeding stock
# ------------------------------------------
print_header "Error 6: Movement with quantity exceeding stock (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/movements" \
    -H "Content-Type: application/json" \
    -d "{
        \"out_warehouse_id\": $WAREHOUSE1_ID,
        \"in_warehouse_id\": $WAREHOUSE2_ID,
        \"product_id\": $PRODUCT_ID,
        \"quantity\": 999999,
        \"date\": \"2025-01-15T10:00:00Z\",
        \"operator\": \"Иванов И.И.\"
    }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Exceeding stock quantity (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 7: Create movement with non-existent product
# ------------------------------------------
print_header "Error 7: Movement with non-existent product (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/movements" \
    -H "Content-Type: application/json" \
    -d "{
        \"out_warehouse_id\": $WAREHOUSE1_ID,
        \"in_warehouse_id\": $WAREHOUSE2_ID,
        \"product_id\": 999999,
        \"quantity\": 1,
        \"date\": \"2025-01-15T10:00:00Z\",
        \"operator\": \"Иванов И.И.\"
    }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Movement with bad product (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 8: Create movement with non-existent source warehouse
# ------------------------------------------
print_header "Error 8: Movement from non-existent warehouse (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/movements" \
    -H "Content-Type: application/json" \
    -d "{
        \"out_warehouse_id\": 999999,
        \"in_warehouse_id\": $WAREHOUSE2_ID,
        \"product_id\": $PRODUCT_ID,
        \"quantity\": 1,
        \"date\": \"2025-01-15T10:00:00Z\",
        \"operator\": \"Иванов И.И.\"
    }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Movement from bad warehouse (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 9: Create movement with missing required fields
# ------------------------------------------
print_header "Error 9: Movement with missing required fields (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/movements" \
    -H "Content-Type: application/json" \
    -d "{
        \"out_warehouse_id\": $WAREHOUSE1_ID,
        \"in_warehouse_id\": $WAREHOUSE2_ID,
        \"product_id\": $PRODUCT_ID
    }")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Missing required fields (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 10: Update non-existent product
# ------------------------------------------
print_header "Error 10: Update non-existent product (404)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/products/999999" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Updated Name"
    }')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 404 ] && echo 0 || echo 1) "Update non-existent product (HTTP $HTTP_CODE, expected 404)"
echo "Response: $BODY"

# ------------------------------------------
# Error 11: Update non-existent warehouse
# ------------------------------------------
print_header "Error 11: Update non-existent warehouse (404)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/warehouses/999999" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Updated Name",
        "address": "Updated Address"
    }')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 404 ] && echo 0 || echo 1) "Update non-existent warehouse (HTTP $HTTP_CODE, expected 404)"
echo "Response: $BODY"

# ------------------------------------------
# Error 12: Get stock for non-existent warehouse
# ------------------------------------------
print_header "Error 12: Get stock for non-existent warehouse (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/warehouses/999999/stock")

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Stock of non-existent warehouse (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ------------------------------------------
# Error 13: Invalid JSON body
# ------------------------------------------
print_header "Error 13: Invalid JSON body (400)"

ERROR_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/products" \
    -H "Content-Type: application/json" \
    -d '{invalid json}')

HTTP_CODE=$(echo "$ERROR_RESPONSE" | tail -1)
BODY=$(echo "$ERROR_RESPONSE" | sed '$d')

print_result $([ "$HTTP_CODE" -eq 400 ] && echo 0 || echo 1) "Invalid JSON (HTTP $HTTP_CODE, expected 400)"
echo "Response: $BODY"

# ==========================================
# VERIFICATION TESTS (verify state after operations)
# ==========================================

print_header "VERIFICATION TESTS"

# ------------------------------------------
# Verify final stock levels
# ------------------------------------------
print_header "Verify stock on warehouse A (should be 70)"

STOCK_A=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/warehouses/$WAREHOUSE1_ID/stock")
HTTP_CODE=$(echo "$STOCK_A" | tail -1)
BODY=$(echo "$STOCK_A" | sed '$d')
print_result $([ "$HTTP_CODE" -eq 200 ] && echo 0 || echo 1) "Get stock warehouse A (HTTP $HTTP_CODE)"
echo "Response: $BODY"

print_header "Verify stock on warehouse B (should be 30)"

STOCK_B=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/warehouses/$WAREHOUSE2_ID/stock")
HTTP_CODE=$(echo "$STOCK_B" | tail -1)
BODY=$(echo "$STOCK_B" | sed '$d')
print_result $([ "$HTTP_CODE" -eq 200 ] && echo 0 || echo 1) "Get stock warehouse B (HTTP $HTTP_CODE)"
echo "Response: $BODY"

# ------------------------------------------
# Verify movements history
# ------------------------------------------
print_header "Verify movements on warehouse A"

MOVEMENTS_A=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/warehouses/$WAREHOUSE1_ID/movements")
HTTP_CODE=$(echo "$MOVEMENTS_A" | tail -1)
BODY=$(echo "$MOVEMENTS_A" | sed '$d')
print_result $([ "$HTTP_CODE" -eq 200 ] && echo 0 || echo 1) "Get movements warehouse A (HTTP $HTTP_CODE)"
echo "Response: $BODY"

# ------------------------------------------
# Get product categories
# ------------------------------------------
print_header "Get product categories"

CATEGORIES=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/products/categories")
HTTP_CODE=$(echo "$CATEGORIES" | tail -1)
BODY=$(echo "$CATEGORIES" | sed '$d')
print_result $([ "$HTTP_CODE" -eq 200 ] && echo 0 || echo 1) "Get categories (HTTP $HTTP_CODE)"
echo "Response: $BODY"

# ------------------------------------------
# Get product units
# ------------------------------------------
print_header "Get product units"

UNITS=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/products/units")
HTTP_CODE=$(echo "$UNITS" | tail -1)
BODY=$(echo "$UNITS" | sed '$d')
print_result $([ "$HTTP_CODE" -eq 200 ] && echo 0 || echo 1) "Get units (HTTP $HTTP_CODE)"
echo "Response: $BODY"

# ==========================================
# SUMMARY
# ==========================================

print_header "TEST SUMMARY"

echo "Created entities:"
echo "  - Product ID: $PRODUCT_ID"
echo "  - Warehouse A ID: $WAREHOUSE1_ID"
echo "  - Warehouse B ID: $WAREHOUSE2_ID"
echo "  - Stock Item ID: $STOCK_ID"
echo "  - Movement ID: $MOVEMENT_ID"
echo ""
echo "Report file: $REPORT_FILE"
echo ""
echo "All tests completed."