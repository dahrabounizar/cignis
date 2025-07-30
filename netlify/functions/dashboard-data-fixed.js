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

  if (!authorization) {
    console.log("Dashboard Data Fixed: No authorization header");
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "No authorization token" }),
    };
  }

  try {
    console.log("Dashboard Data Fixed: Starting analysis with DMA check");

    // First, check if DMA is enabled
    const dmaCheckResponse = await fetch(`${process.env.URL || 'https://localhost:8888'}/.netlify/functions/linkedin-dma-enable`, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    const dmaCheckResult = await dmaCheckResponse.json();
    console.log("Dashboard Data Fixed: DMA check result:", dmaCheckResult);

    // If DMA is not enabled and consent is required, return 428
    if (dmaCheckResponse.status === 428) {
      console.log("Dashboard Data Fixed: DMA consent required");
      return {
        statusCode: 428,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "DMA_CONSENT_REQUIRED",
          message: "LinkedIn DMA consent is required to access dashboard data",
          consentRequired: true,
          redirectUrl: dmaCheckResult.redirectUrl,
        }),
      };
    }

    // If DMA check failed for other reasons, return the error
    if (!dmaCheckResponse.ok && dmaCheckResponse.status !== 200) {
      console.error("Dashboard Data Fixed: DMA check failed:", dmaCheckResult);
      return {
        statusCode: dmaCheckResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "DMA_CHECK_FAILED",
          message: "Failed to verify DMA status",
          details: dmaCheckResult,
        }),
      };
    }

    // DMA is enabled, proceed with dashboard data fetch
    console.log("Dashboard Data Fixed: DMA enabled, fetching dashboard data");

    // Call the original dashboard-data function
    const dashboardResponse = await fetch(`${process.env.URL || 'https://localhost:8888'}/.netlify/functions/dashboard-data`, {
      method: 'GET',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json',
      },
    });

    if (!dashboardResponse.ok) {
      const errorText = await dashboardResponse.text();
      console.error("Dashboard Data Fixed: Dashboard data fetch failed:", dashboardResponse.status, errorText);
      
      // If it's still a 428, it means there's a deeper DMA issue
      if (dashboardResponse.status === 428) {
        return {
          statusCode: 428,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            error: "DMA_NOT_ENABLED",
            message: "DMA is not properly enabled for this member",
            requiresReauth: true,
          }),
        };
      }

      return {
        statusCode: dashboardResponse.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          error: "DASHBOARD_FETCH_FAILED",
          message: "Failed to fetch dashboard data",
          details: errorText,
        }),
      };
    }

    const dashboardData = await dashboardResponse.json();
    console.log("Dashboard Data Fixed: Successfully fetched dashboard data");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify(dashboardData),
    };

  } catch (error) {
    console.error("Dashboard Data Fixed Error:", error);
    console.error("Dashboard Data Fixed Error Stack:", error.stack);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to fetch dashboard data",
        details: error.message,
      }),
    };
  }
}