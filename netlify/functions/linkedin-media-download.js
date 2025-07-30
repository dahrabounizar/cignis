// netlify/functions/linkedin-media-download.js

exports.handler = async function(event) {
  // Handle CORS preflight
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

  // Handle CORS preflight
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

  try {
    const { assetId } = event.queryStringParameters || {};
    // In production, keep tokens server-side only
    const token = process.env.LINKEDIN_ACCESS_TOKEN 
      || (event.queryStringParameters || {}).token;

    console.log("LinkedIn Media Download - Asset ID:", assetId);
    console.log("LinkedIn Media Download - Token present:", !!token);

    if (!assetId) {
      return { 
        statusCode: 400, 
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: "Missing assetId" 
      };
    }
    if (!token) {
      return { 
        statusCode: 401, 
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: "Missing access token" 
      };
    }

    // Only the opaque asset id, NOT the full URN
    const cleanAssetId = assetId.replace("urn:li:digitalmediaAsset:", "");
    if (cleanAssetId.includes(":")) {
      return { 
        statusCode: 400, 
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: "Invalid assetId (does it still include a URN?)" 
      };
    }

    const url = `https://api.linkedin.com/mediaDownload/${encodeURIComponent(cleanAssetId)}`;
    
    console.log("LinkedIn Media Download - Calling URL:", url);
    console.log("LinkedIn Media Download - Using token:", token.substring(0, 20) + "...");
    console.log("LinkedIn Media Download - Clean asset ID:", cleanAssetId);
    
    console.log("LinkedIn Media Download - Calling URL:", url);
    console.log("LinkedIn Media Download - Using token:", token.substring(0, 20) + "...");

    const li = await fetch(url, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${token}`,
        "User-Agent": "LinkedInGrowth/1.0"
      },
      redirect: "follow"
    });

    console.log("LinkedIn Media Download - Response status:", li.status);
    console.log("LinkedIn Media Download - Response headers:", Object.fromEntries(li.headers.entries()));

    console.log("LinkedIn Media Download - Response status:", li.status);
    console.log("LinkedIn Media Download - Response headers:", Object.fromEntries(li.headers.entries()));

    if (!li.ok) {
      const text = await li.text().catch(() => "");
      console.log("LinkedIn Media Download - Error response body:", text);
      console.log("LinkedIn Media Download - Error response body:", text);
      // Relay LinkedIn's actual reason for 400/401/403/404
      return { 
        statusCode: li.status, 
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: `LinkedIn response ${li.status}: ${text || "No body"}` 
      };
    }

    const contentType = li.headers.get("content-type") || "application/octet-stream";
    const buf = Buffer.from(await li.arrayBuffer());
    
    console.log("LinkedIn Media Download - Success! Content type:", contentType);
    console.log("LinkedIn Media Download - Buffer size:", buf.length);
    
    
    console.log("LinkedIn Media Download - Success! Content type:", contentType);
    console.log("LinkedIn Media Download - Buffer size:", buf.length);

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600"
      },
      body: buf.toString("base64"),
      isBase64Encoded: true
    };
  } catch (err) {
    console.error("LinkedIn Media Download - Server error:", err);
    console.error("LinkedIn Media Download - Server error:", err);
    return { 
      statusCode: 500, 
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: `Server error: ${err.message}` 
    };
  }
}