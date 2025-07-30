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

  const { authorization } = event.headers;

  if (!authorization) {
    console.log("DMA Enable: No authorization header");
    return {
      statusCode: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "No authorization token" }),
    };
  }

  try {
    console.log("DMA Enable: Starting DMA enable process");

    // First, check if DMA is already enabled by checking member status
    // Use the correct DMA compliance API endpoint
    const memberCheckUrl = "https://api.linkedin.com/rest/members?q=finder&projection=(elements*(memberComplianceScopes))";
    
    const memberResponse = await fetch(memberCheckUrl, {
      method: "GET",
      headers: {
        "Authorization": authorization,
        "LinkedIn-Version": "202312",
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
    });

    if (!memberResponse.ok) {
      const errorText = await memberResponse.text();
      console.error("DMA Enable: Member check failed:", memberResponse.status, errorText);
      return {
        statusCode: memberResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          status: memberResponse.status,
          code: "MEMBER_CHECK_FAILED",
          message: `Failed to check member DMA status: ${errorText}`,
        }),
      };
    }

    const memberData = await memberResponse.json();
    console.log("DMA Enable: Member data:", JSON.stringify(memberData, null, 2));

    // Check if DMA is already enabled
    const member = memberData?.elements?.[0];
    const complianceScopes = member?.memberComplianceScopes || [];
    const isDMAEnabled = complianceScopes.includes("DMA");

    if (isDMAEnabled) {
      console.log("DMA Enable: DMA already enabled for member");
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          status: "success",
          message: "DMA is already enabled for this member",
          enabled: true,
        }),
      };
    }

    // If DMA is not enabled, we need to trigger the DMA consent flow
    // This typically requires redirecting the user to LinkedIn's DMA consent page
    // Since this is a server-side function, we'll return instructions for the client
    console.log("DMA Enable: DMA not enabled, consent required");
    
    return {
      statusCode: 428, // Precondition Required
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        status: 428,
        code: "DMA_CONSENT_REQUIRED",
        message: "DMA consent is required. Please complete the LinkedIn DMA authorization flow.",
        consentRequired: true,
        redirectUrl: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_DMA_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_DMA_REDIRECT_URI)}&scope=r_dma_portability_3rd_party`,
      }),
    };

  } catch (error) {
    console.error("DMA Enable Error:", error);
    console.error("DMA Enable Error Stack:", error.stack);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        status: 500,
        code: "INTERNAL_ERROR",
        message: "Failed to process DMA enable request",
        details: error.message,
      }),
    };
  }
}