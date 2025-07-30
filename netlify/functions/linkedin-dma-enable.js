export async function handler(event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { authorization } = event.headers;

  if (!authorization) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "No authorization token" }),
    };
  }

  const token = authorization.replace('Bearer ', '');

  try {
    console.log("LinkedIn DMA Enable: Attempting to enable archiving");

    // First check if already enabled
    const checkResponse = await fetch("https://api.linkedin.com/rest/memberAuthorizations?q=memberAndApplication", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (checkResponse.ok) {
      const checkData = await checkResponse.json();
      const enabled = Array.isArray(checkData.elements) && checkData.elements.length > 0;
      
      if (enabled) {
        const hasRegulatedAt = checkData.elements.some(auth => auth.regulatedAt);
        if (hasRegulatedAt) {
          return {
            statusCode: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ 
              success: true, 
              message: "DMA archiving already enabled",
              alreadyEnabled: true
            }),
          };
        }
      }
    }

    // Enable archiving by POSTing empty JSON object
    const enableResponse = await fetch("https://api.linkedin.com/rest/memberAuthorizations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}" // Empty JSON body as specified in PDF
    });

    if (!enableResponse.ok) {
      const errorText = await enableResponse.text();
      console.error("LinkedIn DMA Enable failed:", enableResponse.status, errorText);
      
      return {
        statusCode: enableResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "Failed to enable DMA archiving",
          details: errorText,
          status: enableResponse.status
        }),
      };
    }

    console.log("LinkedIn DMA Enable: Successfully enabled archiving");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        success: true, 
        message: "DMA archiving enabled successfully",
        alreadyEnabled: false
      }),
    };

  } catch (error) {
    console.error("LinkedIn DMA Enable Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to enable DMA archiving",
        details: error.message,
      }),
    };
  }
}