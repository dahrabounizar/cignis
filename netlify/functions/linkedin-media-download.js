// netlify/functions/linkedin-media-download.js

export async function handler(event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    };
  }

  const { authorization } = event.headers;
  const { mediaUrn } = event.queryStringParameters || {};

  console.log("LinkedIn Media Download Function - Media URN:", mediaUrn);
  console.log(
    "LinkedIn Media Download Function - Authorization header present:",
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

  if (!mediaUrn) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        error: "Media URN is required",
        details: "Provide a digitalmediaAsset URN to download"
      }),
    };
  }

  // Validate media URN format
  if (!mediaUrn.includes("digitalmediaAsset")) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        error: "Invalid media URN format",
        details: "URN must be a digitalmediaAsset URN"
      }),
    };
  }

  try {
    // First, call the media download API to get the download URL
    const downloadUrl = `https://api.linkedin.com/rest/mediaDownload?mediaUrn=${encodeURIComponent(mediaUrn)}`;
    
    console.log("LinkedIn Media Download Function - Calling URL:", downloadUrl);

    const response = await fetch(downloadUrl, {
      headers: {
        Authorization: authorization,
        "LinkedIn-Version": "202312",
        "Content-Type": "application/json",
      },
    });

    console.log(
      "LinkedIn Media Download Function - Response status:",
      response.status
    );

    // Enhanced error handling
    if (!response.ok) {
      const errorText = await response.text();
      console.error("LinkedIn Media Download Function - API Error:", {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        mediaUrn: mediaUrn
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

      if (response.status === 403) {
        return {
          statusCode: 403,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            error: "Insufficient permissions for media download",
            details: "Ensure your application has r_dma_portability_3rd_party scope",
            statusCode: response.status
          }),
        };
      }

      if (response.status === 404) {
        return {
          statusCode: 404,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            error: "Media not found",
            details: "The specified media URN was not found or is not accessible",
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
          error: "Failed to download LinkedIn media",
          details: errorText,
          statusCode: response.status
        }),
      };
    }

    const data = await response.json();
    
    console.log("LinkedIn Media Download Function - Response data:", {
      hasDownloadUrl: !!data.downloadUrl,
      hasMetadata: !!data.metadata,
      mediaType: data.metadata?.mediaType,
      fileSize: data.metadata?.fileSize
    });

    // The response should contain a downloadUrl that can be used to fetch the actual media
    if (!data.downloadUrl) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "No download URL provided",
          details: "LinkedIn API did not return a valid download URL"
        }),
      };
    }

    // Return the media download information
    // Note: For security and bandwidth reasons, we return the download URL rather than proxying the media
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Cache-Control": "public, max-age=3600", // 1 hour cache for media URLs
      },
      body: JSON.stringify({
        downloadUrl: data.downloadUrl,
        metadata: data.metadata || {},
        mediaUrn: mediaUrn,
        expiresAt: new Date(Date.now() + 3600000).toISOString() // URL typically expires in 1 hour
      }),
    };
  } catch (error) {
    console.error("LinkedIn Media Download Function - Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to download LinkedIn media",
        details: error.message,
        mediaUrn: mediaUrn
      }),
    };
  }
}