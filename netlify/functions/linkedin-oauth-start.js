exports.handler = async function(event, context) {
  console.log('OAuth start called with:', event.queryStringParameters);
  
  const { type = 'basic' } = event.queryStringParameters || {};
  
  const baseUrl = 'https://www.linkedin.com/oauth/v2/authorization';
  
  let clientId, scope;
  if (type === 'dma') {
    clientId = process.env.LINKEDIN_DMA_CLIENT_ID;
    scope = 'r_dma_portability_3rd_party';
  } else {
    clientId = process.env.LINKEDIN_CLIENT_ID;
    scope = 'openid profile email w_member_social';
  }
  
  if (!clientId) {
    console.error('Missing client ID for type:', type);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing client configuration' })
    };
  }
  
  const redirectUri = `${process.env.URL}/.netlify/functions/linkedin-oauth-callback`;
  
  // For development, use localhost
  const actualRedirectUri = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8888/.netlify/functions/linkedin-oauth-callback'
    : redirectUri;
    
  console.log('Redirect URI:', actualRedirectUri);
  
  const authUrl = `${baseUrl}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(actualRedirectUri)}&scope=${encodeURIComponent(scope)}&state=${type}`;
  console.log('Generated auth URL:', authUrl);
  
  return {
    statusCode: 302,
    headers: {
      Location: authUrl,
      'Access-Control-Allow-Origin': '*'
    }
  };
}