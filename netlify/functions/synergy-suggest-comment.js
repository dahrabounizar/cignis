exports.handler = async function(event, context) {
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

  try {
    const { 
      fromUserId, 
      toUserId, 
      postUrn, 
      postPreview = "", 
      tone = "supportive",
      maxTokens = 100 
    } = JSON.parse(event.body || "{}");

    if (!fromUserId || !toUserId || !postUrn) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: "fromUserId, toUserId, and postUrn are required" 
        }),
      };
    }

    const userId = await getUserIdFromToken(authorization);
    
    if (!userId || userId !== fromUserId) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Not authorized" }),
      };
    }

    // Verify partnership exists
    const isPartner = await verifyPartnership(fromUserId, toUserId);
    if (!isPartner) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Not authorized to suggest comments for this user" }),
      };
    }

    // Get user names for context
    const fromUserName = await getUserName(fromUserId);
    const toUserName = await getUserName(toUserId);

    // Generate AI suggestions
    const suggestions = await generateCommentSuggestions({
      postPreview,
      fromUserName,
      toUserName,
      tone,
      maxTokens
    });

    // Save suggestions to database
    await saveSuggestedComments(fromUserId, toUserId, postUrn, suggestions);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ 
        suggestions,
        postUrn,
        createdAt: new Date().toISOString()
      }),
    };
  } catch (error) {
    console.error("Synergy suggest comment error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Internal server error",
        details: error.message 
      }),
    };
  }
}

async function getUserIdFromToken(authorization) {
  // Placeholder - implement based on your auth system
  return "user-123";
}

async function verifyPartnership(userId, partnerId) {
  // In a real implementation, query Supabase to verify the partnership exists
  return true;
}

async function getUserName(userId) {
  // In a real implementation, query Supabase to get the user's name
  const names = {
    "user-123": "John Doe",
    "partner-1": "Sarah Johnson",
    "partner-2": "Michael Chen"
  };
  return names[userId] || "User";
}

async function generateCommentSuggestions({ postPreview, fromUserName, toUserName, tone, maxTokens }) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    console.warn("OpenAI API key not configured, returning fallback suggestions");
    return [
      "Great insights! This really resonates with my experience. What's been your biggest learning from this?",
      "Excellent point about this topic. Thanks for sharing your perspective - it's given me a lot to think about!"
    ];
  }

  try {
    const systemPrompt = `You draft short, supportive LinkedIn comments. 35–60 words, friendly and specific, no fluff, optional 1 emoji max, no hashtags, avoid generic praise. Include one concrete point from the post preview and one light question or call-to-action.`;

    const userPrompt = `Partner ${fromUserName} wants to comment on ${toUserName}'s post.
- Post title/preview: "${postPreview}"
- Relationship context: "${fromUserName} and ${toUserName} are synergy partners."
- Goal: Encourage engagement and add value.

Write 2 alternative comments, each on a single paragraph.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Parse the response to extract the two suggestions
    const suggestions = content
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering
      .filter(line => line.length > 20) // Filter out short lines
      .slice(0, 2); // Take first 2 suggestions

    // Ensure we have at least 2 suggestions
    if (suggestions.length < 2) {
      suggestions.push(
        "Thanks for sharing this valuable insight! It really adds to the conversation. What's your take on the future implications?",
        "This is exactly what I've been thinking about lately. Your perspective is spot on - how do you see this evolving?"
      );
    }

    // Clean and validate suggestions
    return suggestions.map(suggestion => 
      cleanSuggestion(suggestion)
    ).slice(0, 2);

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback suggestions
    return [
      "Great insights! This really resonates with my experience. What's been your biggest learning from this?",
      "Excellent point about this topic. Thanks for sharing your perspective - it's given me a lot to think about!"
    ];
  }
}

function cleanSuggestion(suggestion) {
  // Remove URLs, limit length, ensure no PII leakage
  return suggestion
    .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
    .replace(/[^\w\s.,!?'"()-]/g, '') // Remove special characters except basic punctuation
    .trim()
    .substring(0, 200); // Limit length
}

async function saveSuggestedComments(fromUserId, toUserId, postUrn, suggestions) {
  // In a real implementation, save to suggested_comments table in Supabase
  console.log(`Saving ${suggestions.length} suggestions for ${fromUserId} -> ${toUserId} on ${postUrn}`);
}