# Netlify Functions - CommonJS Migration

## Overview

All Netlify functions have been converted from ESM to CommonJS format to fix the "Unexpected token 'export'" runtime error.

## Changes Made

1. **Removed ESM Syntax**: All functions now use `exports.handler` instead of `export async function handler`
2. **Package Configuration**: Removed `"type": "module"` from root package.json
3. **Netlify Configuration**: Added `node_bundler = "esbuild"` to netlify.toml
4. **Node Version**: Set minimum Node version to 18+ in package.json

## Dashboard Data Function

The `dashboard-data.js` function has been completely rewritten to:

- Use LinkedIn DMA Changelog API with proper versioning (LinkedIn-Version: 202312)
- Implement 28-day data window for analytics
- Check DMA authorization before fetching data
- Return proper error messages with status codes
- Use server-side environment variables for security

### Environment Variables Required

```bash
LINKEDIN_DMA_TOKEN=<your-dma-token>  # Token with r_dma_portability_3rd_party scope
# or
LINKEDIN_TOKEN=<your-token>          # Fallback token variable
```

### Response Format

```json
{
  "scores": {
    "postingActivity": 0-10,
    "engagementQuality": 0-10,
    "contentDiversity": 0-10,
    "networkGrowth": 0-10
  },
  "summary": {
    "posts30d": number,
    "totalEngagements": number,
    "engagementRatePct": number,
    "newConnections28d": number
  },
  "trends": {
    "weeklyPosts": { "2024-W01": count, ... },
    "weeklyEngagements": { "2024-W01": count, ... }
  },
  "debugCounts": {
    "posts": number,
    "comments": number,
    "likes": number,
    "invitations": number,
    "messages": number
  }
}
```

### Error Responses

- **428**: DMA not enabled for member/app pair
- **500**: Missing LinkedIn token in environment
- **401/403**: LinkedIn API authentication errors

## Testing Locally

1. Set environment variables:
   ```bash
   export LINKEDIN_DMA_TOKEN="your-token-here"
   ```

2. Run Netlify dev:
   ```bash
   npm run dev:netlify
   ```

3. Test the endpoint:
   ```bash
   curl http://localhost:8888/.netlify/functions/dashboard-data
   ```

## CommonJS Pattern

All functions now follow this pattern:

```javascript
// CommonJS style
exports.handler = async function(event, context) {
  // Handle OPTIONS for CORS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: ""
    };
  }

  // Function logic here
  
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(data)
  };
};
```

## Node.js Compatibility

The functions are compatible with Node.js 18+ which includes native fetch support. The dashboard-data function includes a fallback for older Node versions but it's recommended to use Node 18+.