export async function handler(event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
    };
  }

  const { authorization } = event.headers;
  const { startTime, count = "50" } = event.queryStringParameters || {};

  console.log(
    "LinkedIn Changelog Function - Count:",
    count,
    "StartTime:",
    startTime
  );
  console.log(
    "LinkedIn Changelog Function - Authorization header present:",
    !!authorization
  );

  if (!authorization) {
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "No authorization token" }),
    };
  }

  // Validate count parameter
  const countNum = parseInt(count);
  if (isNaN(countNum) || countNum < 1 || countNum > 1000) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        error: "Invalid count parameter",
        details: "Count must be between 1 and 1000"
      }),
    };
  }

  try {
    let url = `https://api.linkedin.com/rest/memberChangeLogs?q=memberAndApplication&count=${count}`;
    if (startTime) {
      // Validate startTime format if provided
      const startTimeNum = parseInt(startTime);
      if (isNaN(startTimeNum)) {
        return {
          statusCode: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ 
            error: "Invalid startTime parameter",
            details: "startTime must be a valid timestamp"
          }),
        };
      }
      url += `&startTime=${startTime}`;
    }

    console.log("LinkedIn Changelog Function - Calling URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: authorization,
        "LinkedIn-Version": "202312",
        "Content-Type": "application/json",
      },
    });

    console.log(
      "LinkedIn Changelog Function - Response status:",
      response.status
    );
    console.log(
      "LinkedIn Changelog Function - Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // Enhanced error handling for token expiry and other issues
    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkedIn Changelog Function - API Error:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        count: count,
        startTime: startTime
      });

      // Check for token expiry (401) or forbidden (403)
      if (response.status === 401) {
        return {
          statusCode: 401,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            error: "DMA token expired or invalid",
            details: "Please re-authenticate to get a new DMA token",
            statusCode: response.status
          }),
        };
      }

      // Check for insufficient permissions
      if (response.status === 403) {
        return {
          statusCode: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            error: "Insufficient permissions for DMA data access",
            details: "Ensure your application has r_dma_portability_3rd_party scope",
            statusCode: response.status
          }),
        };
      }

      // Generic error for other status codes
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Failed to fetch LinkedIn changelog data",
          details: errorText,
          statusCode: response.status
        }),
      };
    }

    const data = await response.json();
    
    // Enhanced logging for debugging
    const resourceNameCounts = {};
    const methodCounts = {};
    
    if (data.elements) {
      data.elements.forEach(element => {
        const resourceName = element.resourceName || 'unknown';
        const method = element.method || 'unknown';
        
        resourceNameCounts[resourceName] = (resourceNameCounts[resourceName] || 0) + 1;
        methodCounts[method] = (methodCounts[method] || 0) + 1;
      });
    }
    
    console.log("LinkedIn Changelog Function - Response data structure:", {
      hasElements: !!data.elements,
      elementsLength: data.elements?.length || 0,
      firstElementKeys: data.elements?.[0] ? Object.keys(data.elements[0]) : [],
      resourceNames: Object.keys(resourceNameCounts),
      resourceNameCounts: resourceNameCounts,
      methodCounts: methodCounts,
      isEmpty: !data.elements || data.elements.length === 0,
      hasUgcPosts: resourceNameCounts['ugcPosts'] || 0,
      hasLikes: resourceNameCounts['socialActions/likes'] || 0,
      hasComments: resourceNameCounts['socialActions/comments'] || 0,
      hasInvitations: resourceNameCounts['invitations'] || 0,
      hasMessages: resourceNameCounts['messages'] || 0
    });

    // Log if no data is returned
    if (!data.elements || data.elements.length === 0) {
      console.warn("LinkedIn Changelog Function - No changelog data returned. This may indicate no recent activity in the last 28 days.");
    }

    // Log specific resource types for better debugging
    if (data.elements && data.elements.length > 0) {
      const sampleElements = {};
      Object.keys(resourceNameCounts).forEach(resourceName => {
        const element = data.elements.find(el => el.resourceName === resourceName);
        if (element) {
          sampleElements[resourceName] = {
            method: element.method,
            capturedAt: element.capturedAt,
            hasActivity: !!element.activity,
            hasResourceId: !!element.resourceId
          };
        }
      });
      console.log("LinkedIn Changelog Function - Sample elements by type:", sampleElements);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=300", // 5 minute cache for changelog
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("LinkedIn Changelog Function - Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to fetch LinkedIn changelog data",
        details: error.message,
        count: count,
        startTime: startTime
      }),
    };
  }
}
