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
  const { domain } = event.queryStringParameters || {};

  console.log("LinkedIn Snapshot Function - Domain:", domain);
  console.log(
    "LinkedIn Snapshot Function - Authorization header present:",
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

  // Validate domain parameter
  const validDomains = [
    "PROFILE",
    "CONNECTIONS", 
    "MEMBER_SHARE_INFO",
    "ALL_COMMENTS",
    "ALL_LIKES",
    "SKILLS",
    "POSITIONS",
    "EDUCATION"
  ];

  if (domain && !validDomains.includes(domain)) {
    console.warn("LinkedIn Snapshot Function - Invalid domain:", domain);
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        error: "Invalid domain parameter",
        validDomains: validDomains
      }),
    };
  }

  try {
    let url = "https://api.linkedin.com/rest/memberSnapshotData?q=criteria";
    if (domain) {
      url += `&domain=${domain}`;
    }

    console.log("LinkedIn Snapshot Function - Calling URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: authorization,
        "LinkedIn-Version": "202312",
        "Content-Type": "application/json",
      },
    });

    console.log(
      "LinkedIn Snapshot Function - Response status:",
      response.status
    );
    console.log(
      "LinkedIn Snapshot Function - Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    // Enhanced error handling for token expiry and other issues
    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkedIn Snapshot Function - API Error:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        domain: domain
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
            domain: domain,
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
          error: "Failed to fetch LinkedIn snapshot data",
          details: errorText,
          domain: domain,
          statusCode: response.status
        }),
      };
    }

    const data = await response.json();
    
    // Enhanced logging for debugging
    console.log("LinkedIn Snapshot Function - Response data structure:", {
      domain: domain,
      hasElements: !!data.elements,
      elementsLength: data.elements?.length || 0,
      hasSnapshotData: !!data.elements?.[0]?.snapshotData,
      snapshotDataLength: data.elements?.[0]?.snapshotData?.length || 0,
      firstElementKeys: data.elements?.[0] ? Object.keys(data.elements[0]) : [],
      firstSnapshotDataKeys: data.elements?.[0]?.snapshotData?.[0]
        ? Object.keys(data.elements[0].snapshotData[0])
        : [],
      isEmpty: !data.elements || data.elements.length === 0 || 
               !data.elements[0]?.snapshotData || 
               data.elements[0].snapshotData.length === 0
    });

    // Log if no data is returned
    if (!data.elements || data.elements.length === 0 || 
        !data.elements[0]?.snapshotData || 
        data.elements[0].snapshotData.length === 0) {
      console.warn("LinkedIn Snapshot Function - No data returned for domain:", domain);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=600", // 10 minute cache
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("LinkedIn Snapshot Function - Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to fetch LinkedIn snapshot data",
        details: error.message,
        domain: domain
      }),
    };
  }
}
