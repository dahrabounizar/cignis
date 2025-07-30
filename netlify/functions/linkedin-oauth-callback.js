exports.handler = async function(event, context) {
  console.log('OAuth callback called with:', event.queryStringParameters);
  
  const { code, state } = event.queryStringParameters || {};
  
  if (!code) {
    console.error('No authorization code provided');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No authorization code provided' })
    };
  }
  
  try {
    // Determine which client credentials to use based on state
    const clientId = state === 'dma' ? process.env.LINKEDIN_DMA_CLIENT_ID : process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = state === 'dma' ? process.env.LINKEDIN_DMA_CLIENT_SECRET : process.env.LINKEDIN_CLIENT_SECRET;
    
    console.log('Using client ID:', clientId, 'for state:', state);
    
    if (!clientId || !clientSecret) {
      console.error('Missing client credentials for state:', state);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing client credentials' })
      };
    }
    
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.URL}/.netlify/functions/linkedin-oauth-callback`,
        client_id: clientId,
        client_secret: clientSecret
      })
    });
    
    const tokens = await tokenResponse.json();
    console.log('Token response:', tokens);
    
    if (tokens.error) {
      console.error('Token error:', tokens);
      throw new Error(tokens.error_description || tokens.error);
    }
    
    // Store token type based on state
    const tokenType = state === 'dma' ? 'dma_token' : 'access_token';
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:5173' 
      : (process.env.URL || 'https://localhost:5173');
    const redirectUrl = `${baseUrl}/?${tokenType}=${tokens.access_token}`;
    console.log('Redirecting to:', redirectUrl);
    
    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
}