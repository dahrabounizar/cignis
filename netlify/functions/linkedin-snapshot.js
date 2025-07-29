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
      body: JSON.stringify({ error: "No authorization token" }),
    };
  }

  // Validate domain parameter according to DMA API documentation
  const validDomains = [
    'PROFILE', 'CONNECTIONS', 'MEMBER_SHARE_INFO', 
    'ALL_COMMENTS', 'ALL_LIKES', 'SKILLS', 'POSITIONS', 'EDUCATION'
  ];
  
  if (domain && !validDomains.includes(domain)) {
    console.warn(`LinkedIn Snapshot Function - Invalid domain: ${domain}`);
    return {
      statusCode: 400,
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

    const data = await response.json();
    console.log("LinkedIn Snapshot Function - Response data structure:", {
      hasElements: !!data.elements,
      elementsLength: data.elements?.length || 0,
      hasSnapshotData: !!data.elements?.[0]?.snapshotData,
      snapshotDataLength: data.elements?.[0]?.snapshotData?.length || 0,
      firstElementKeys: data.elements?.[0] ? Object.keys(data.elements[0]) : [],
      firstSnapshotDataKeys: data.elements?.[0]?.snapshotData?.[0]
        ? Object.keys(data.elements[0].snapshotData[0])
        : [],
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
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
      }),
    };
  }
}
