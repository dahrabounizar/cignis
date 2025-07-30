const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const LI_REST = "https://api.linkedin.com/rest";

async function liPost(path, token, body, opts = {}) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...opts.headers
  };
  
  const res = await fetch(`${LI_REST}${path}`, { 
    ...opts, 
    method: "POST",
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
  
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`LinkedIn POST ${res.status}: ${t || "No body"}`);
  }
  
  // Some LinkedIn endpoints return empty responses
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return null;
}

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
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const { authorization } = event.headers;

  if (!authorization) {
    return {
      statusCode: 401,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "No authorization token" }),
    };
  }

  // Extract token from Bearer header
  const token = authorization.replace('Bearer ', '');

  try {
    console.log("Enabling DMA for member");
    
    // Enable archiving for the user (empty JSON body as per LinkedIn API)
    await liPost("/memberAuthorizations", token, {});
    
    console.log("DMA enabled successfully");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({ 
        success: true,
        message: "DMA authorization enabled successfully" 
      }),
    };
  } catch (error) {
    console.error("Enable DMA Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to enable DMA authorization",
        details: error.message,
      }),
    };
  }
}