# LinkedIn DMA Integration Fixes

This document outlines the fixes implemented to resolve zero values in the LinkedIn analytics dashboard by properly implementing DMA (Digital Markets Act) compliance and correct API usage.

## Problem Analysis

The original implementation was returning zeros because it was missing:

1. **DMA consent verification** - Not checking if archiving was enabled for the member
2. **Required LinkedIn-Version header** - Missing `LinkedIn-Version: 202312` for versioned REST APIs
3. **Incorrect 28-day window semantics** - Not properly handling the changelog time window
4. **Wrong resourceName mappings** - Not using the exact resourceNames from the LinkedIn PDF

## Solution Overview

### 1. DMA Consent Management

**Files Created:**
- `src/lib/dma.ts` - DMA authorization functions
- `netlify/functions/linkedin-dma-enable.js` - DMA enablement endpoint

**Key Functions:**
```typescript
// Check if DMA is enabled for the member
export async function ensureDmaEnabled(token: string): Promise<boolean>

// Enable DMA archiving (POST empty JSON body)
export async function enableDma(token: string): Promise<boolean>
```

**API Calls:**
```bash
# Check DMA status
GET https://api.linkedin.com/rest/memberAuthorizations?q=memberAndApplication

# Enable DMA (empty JSON body)
POST https://api.linkedin.com/rest/memberAuthorizations
Body: {}
```

### 2. Improved LinkedIn Client

**File Created:** `src/lib/linkedin.ts`

**Key Features:**
- Automatic `LinkedIn-Version: 202312` header for changelog endpoints
- Proper error handling with detailed messages
- Safe parameter validation

```typescript
export async function liGet(path: string, token: string, opts: RequestInit = {})
export async function liPost(path: string, token: string, body: any, opts: RequestInit = {})
```

### 3. Changelog API Fixes

**File Created:** `src/lib/changelog.ts`

**Key Improvements:**
- Safe count parameter (1-50 range, outside returns 400)
- Proper 28-day window calculation
- Required `LinkedIn-Version: 202312` header
- Event grouping by resourceName

```typescript
export async function fetchChangelogWindow(
  token: string,
  sinceMs?: number,
  count = 10
): Promise<Event[]>

export async function fetchLast28DaysChangelog(token: string): Promise<Event[]>
```

### 4. Fixed Dashboard Data Function

**File Created:** `netlify/functions/dashboard-data-fixed.js`

**Key Features:**
- DMA consent precheck (returns 428 if not enabled)
- Correct resourceName filtering based on PDF:
  - `ugcPosts` (CREATE/UPDATE) → Posting Activity
  - `socialActions/comments` (CREATE) → Engagement Quality
  - `socialActions/likes` (CREATE) → Engagement Quality
  - `invitations` → Network Growth
  - `messages` → Messaging activity
- Content diversity from `shareMediaCategory`
- Weekly trend calculations
- Snapshot API fallbacks for inactive users

### 5. Service Layer Updates

**File Updated:** `src/services/linkedin.ts`

**New Functions:**
```typescript
export const fetchDashboardDataFixed = async (token: string)
export const enableDmaArchiving = async (token: string)
export const checkDmaStatus = async (token: string)
```

### 6. Hook Updates

**File Updated:** `src/hooks/useDashboardData.ts`

**Key Changes:**
- Uses new `dashboard-data-fixed` endpoint
- Automatic DMA enablement on 428 response
- Better error handling and retry logic

## Resource Name Mappings (From PDF)

| Dashboard Metric | LinkedIn resourceName | Method | Notes |
|------------------|----------------------|--------|-------|
| Posting Activity | `ugcPosts` | CREATE, UPDATE | Last 28 days |
| Engagement Quality | `socialActions/comments` | CREATE | Comments received |
| Engagement Quality | `socialActions/likes` | CREATE | Likes received |
| Content Diversity | `ugcPosts` | CREATE | Check `shareMediaCategory` |
| Network Growth | `invitations` | Various | Invitation activity |
| Mutual Interactions | `socialActions/*` | CREATE | User's own activity |
| Messages | `messages` | Various | Messaging volume |

## Content Diversity Categories

From `activity.specificContent["com.linkedin.ugc.ShareContent"].shareMediaCategory`:
- `NONE` - Text posts
- `ARTICLE` - Article shares
- `VIDEO` - Video content
- `IMAGE` - Image posts
- `URN_REFERENCE` - Reference posts
- `OTHER` - Other content types

## Testing

### Automated Testing Script

Run the comprehensive test script:

```bash
./test-linkedin-dma.sh YOUR_LINKEDIN_TOKEN
```

This script tests:
1. DMA consent verification
2. DMA enablement (if needed)
3. Changelog API with proper headers
4. Resource name analysis
5. 28-day window filtering
6. Count parameter boundaries (1-50)
7. LinkedIn-Version header requirement
8. Member Snapshot API fallbacks

### Manual Testing Commands

```bash
# 1. Verify DMA enablement
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.linkedin.com/rest/memberAuthorizations?q=memberAndApplication"

# 2. Enable DMA if needed
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  "https://api.linkedin.com/rest/memberAuthorizations"

# 3. Fetch changelog events (28d)
curl -H "Authorization: Bearer $TOKEN" \
  -H "LinkedIn-Version: 202312" \
  "https://api.linkedin.com/rest/memberChangeLogs?q=memberAndApplication&count=10"

# 4. Test Member Snapshot API
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.linkedin.com/rest/memberSnapshotData?q=criteria&domain=PROFILE"
```

## API Requirements Summary

### Required Headers
- `Authorization: Bearer <token>` - Always required
- `LinkedIn-Version: 202312` - Required for changelog API
- `Content-Type: application/json` - For POST requests

### Parameter Constraints
- `count`: Must be 1-50 (outside range returns 400)
- `startTime`: Epoch milliseconds for filtering
- `q`: Must be "memberAndApplication" for changelog

### Time Windows
- **Changelog API**: 28-day hard limit (older events not returned)
- **Snapshot API**: Point-in-time data for baseline metrics

## Error Handling

### Common Issues and Solutions

1. **Empty Responses (Status 200, no elements)**
   - Check DMA consent with memberAuthorizations
   - Verify LinkedIn-Version header is present
   - Ensure count parameter is 1-50

2. **400 Bad Request**
   - Count parameter outside 1-50 range
   - Invalid startTime format
   - Missing query parameter

3. **428 Precondition Required**
   - DMA not enabled, call enablement endpoint

4. **EEA Users Only**
   - Only EEA members can consent under DMA
   - Non-EEA members won't produce data for 3rd-party DMA apps

## Deployment Notes

1. **New Endpoints**: Deploy the new `dashboard-data-fixed.js` and `linkedin-dma-enable.js` functions
2. **Frontend Updates**: The dashboard hook now uses the fixed endpoint automatically
3. **Backward Compatibility**: Old endpoints remain functional but should be deprecated
4. **Environment**: No additional environment variables required

## Performance Optimizations

1. **Parallel Requests**: Snapshot data fetched in parallel with changelog
2. **Caching**: 10-minute stale time for dashboard data
3. **Safe Defaults**: Fallback scores when data is unavailable
4. **Error Recovery**: Automatic DMA enablement on first failure

## Monitoring and Debugging

The fixed implementation includes comprehensive logging:

```javascript
console.log("Dashboard Data Fixed: Fetched events", {
  totalEvents: events.length,
  resourceNames: [...new Set(events.map(e => e.resourceName))]
});
```

Debug information is included in the response:

```json
{
  "_debug": {
    "dmaEnabled": true,
    "eventsProcessed": 42,
    "counts": {
      "posts": 5,
      "comments": 12,
      "likes": 18,
      "invitations": 3,
      "messages": 4
    },
    "contentTypes": {
      "NONE": 3,
      "IMAGE": 2,
      "VIDEO": 0,
      "ARTICLE": 0,
      "URN_REFERENCE": 0,
      "OTHER": 0
    }
  }
}
```

## Next Steps

1. **Monitor Results**: Check that dashboard tiles now show non-zero values
2. **User Feedback**: Gather feedback on metric accuracy
3. **Optimization**: Fine-tune scoring algorithms based on actual data patterns
4. **Documentation**: Update user-facing help text to reflect new capabilities

This implementation should immediately resolve the zero values issue by properly implementing all LinkedIn DMA requirements and using correct API patterns as specified in the LinkedIn PDF documentation.