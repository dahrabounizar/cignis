#!/bin/bash

# LinkedIn DMA Testing Script
# Usage: ./test-linkedin-dma.sh <TOKEN>

if [ -z "$1" ]; then
    echo "Usage: $0 <LINKEDIN_TOKEN>"
    echo "Example: $0 your_linkedin_token_here"
    exit 1
fi

TOKEN="$1"
BASE_URL="https://api.linkedin.com/rest"

echo "=== LinkedIn DMA Testing Script ==="
echo "Testing token: ${TOKEN:0:10}..."
echo ""

# Test 1: Verify DMA enablement
echo "1. Checking DMA enablement..."
echo "curl -H \"Authorization: Bearer \$TOKEN\" \"$BASE_URL/memberAuthorizations?q=memberAndApplication\""
response=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/memberAuthorizations?q=memberAndApplication")
echo "Response: $response"

# Check if regulatedAt is present
if echo "$response" | grep -q "regulatedAt"; then
    echo "✅ DMA consent found (regulatedAt present)"
else
    echo "❌ DMA consent missing. Attempting to enable..."
    
    # Test 2: Enable DMA if needed
    echo ""
    echo "2. Enabling DMA archiving..."
    echo "curl -X POST -H \"Authorization: Bearer \$TOKEN\" -H \"Content-Type: application/json\" -d '{}' \"$BASE_URL/memberAuthorizations\""
    enable_response=$(curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}' "$BASE_URL/memberAuthorizations")
    echo "Enable response: $enable_response"
fi

echo ""

# Test 3: Fetch events with proper headers (28d window)
echo "3. Fetching changelog events (28-day window)..."
echo "curl -H \"Authorization: Bearer \$TOKEN\" -H \"LinkedIn-Version: 202312\" \"$BASE_URL/memberChangeLogs?q=memberAndApplication&count=10\""
changelog_response=$(curl -s -H "Authorization: Bearer $TOKEN" -H "LinkedIn-Version: 202312" "$BASE_URL/memberChangeLogs?q=memberAndApplication&count=10")
echo "Changelog response: $changelog_response"

# Parse and show resource names
echo ""
echo "4. Analyzing resource names..."
resource_names=$(echo "$changelog_response" | grep -o '"resourceName":"[^"]*"' | sort | uniq)
if [ -n "$resource_names" ]; then
    echo "Found resource names:"
    echo "$resource_names"
    
    # Check for expected resource names from PDF
    expected_resources=("ugcPosts" "socialActions/comments" "socialActions/likes" "invitations" "messages")
    for resource in "${expected_resources[@]}"; do
        if echo "$changelog_response" | grep -q "\"resourceName\":\"$resource\""; then
            echo "✅ Found $resource"
        else
            echo "❌ Missing $resource"
        fi
    done
else
    echo "❌ No resource names found - possible empty response"
fi

echo ""

# Test 4: Test with startTime parameter (last 28 days)
twenty_eight_days_ago=$(($(date +%s) * 1000 - 28 * 24 * 3600 * 1000))
echo "5. Testing with 28-day startTime filter..."
echo "curl -H \"Authorization: Bearer \$TOKEN\" -H \"LinkedIn-Version: 202312\" \"$BASE_URL/memberChangeLogs?q=memberAndApplication&count=10&startTime=$twenty_eight_days_ago\""
filtered_response=$(curl -s -H "Authorization: Bearer $TOKEN" -H "LinkedIn-Version: 202312" "$BASE_URL/memberChangeLogs?q=memberAndApplication&count=10&startTime=$twenty_eight_days_ago")
echo "Filtered response: $filtered_response"

echo ""

# Test 5: Test count parameter boundaries
echo "6. Testing count parameter boundaries..."
echo "Testing count=1 (minimum)..."
count1_response=$(curl -s -H "Authorization: Bearer $TOKEN" -H "LinkedIn-Version: 202312" "$BASE_URL/memberChangeLogs?q=memberAndApplication&count=1")
echo "Count=1 response length: ${#count1_response}"

echo "Testing count=50 (maximum)..."
count50_response=$(curl -s -H "Authorization: Bearer $TOKEN" -H "LinkedIn-Version: 202312" "$BASE_URL/memberChangeLogs?q=memberAndApplication&count=50")
echo "Count=50 response length: ${#count50_response}"

echo "Testing count=51 (should return 400)..."
count51_response=$(curl -s -w "HTTP_STATUS:%{http_code}" -H "Authorization: Bearer $TOKEN" -H "LinkedIn-Version: 202312" "$BASE_URL/memberChangeLogs?q=memberAndApplication&count=51")
echo "Count=51 response: $count51_response"

echo ""

# Test 6: Test without LinkedIn-Version header (should fail)
echo "7. Testing without LinkedIn-Version header (should fail)..."
no_version_response=$(curl -s -w "HTTP_STATUS:%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL/memberChangeLogs?q=memberAndApplication&count=10")
echo "No version header response: $no_version_response"

echo ""

# Test 7: Test Member Snapshot API for fallbacks
echo "8. Testing Member Snapshot API for fallbacks..."
echo "curl -H \"Authorization: Bearer \$TOKEN\" \"$BASE_URL/memberSnapshotData?q=criteria&domain=PROFILE\""
profile_snapshot=$(curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/memberSnapshotData?q=criteria&domain=PROFILE")
echo "Profile snapshot response: $profile_snapshot"

echo ""
echo "=== Testing Complete ==="
echo ""
echo "Summary:"
echo "- Verify DMA consent is enabled (regulatedAt present)"
echo "- Ensure LinkedIn-Version: 202312 header is always included for changelog"
echo "- Count parameter must be 1-50 (outside range returns 400)"
echo "- 28-day window is enforced (older events won't appear)"
echo "- Expected resourceNames: ugcPosts, socialActions/comments, socialActions/likes, invitations, messages"
echo "- Use Member Snapshot API for profile/connections data when changelog is empty"