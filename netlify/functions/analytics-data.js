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
  const { timeRange = "30d" } = event.queryStringParameters || {};

  if (!authorization) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "No authorization token" }),
    };
  }

  try {
    console.log("Analytics Data: Starting detailed analysis");

    // Fetch all required data
    const [
      profileData,
      connectionsData,
      postsData,
      changelogData,
      skillsData,
      positionsData
    ] = await Promise.all([
      fetchLinkedInData(authorization, "linkedin-snapshot", "PROFILE"),
      fetchLinkedInData(authorization, "linkedin-snapshot", "CONNECTIONS"),
      fetchLinkedInData(authorization, "linkedin-snapshot", "MEMBER_SHARE_INFO"),
      fetchLinkedInData(authorization, "linkedin-changelog", null, "count=200"),
      fetchLinkedInData(authorization, "linkedin-snapshot", "SKILLS"),
      fetchLinkedInData(authorization, "linkedin-snapshot", "POSITIONS")
    ]);

    console.log("Analytics Data: All data fetched successfully");

    // Calculate detailed analytics
    const analytics = {
      postsEngagementsTrend: calculatePostsEngagementsTrend(changelogData, timeRange),
      connectionsGrowth: calculateConnectionsGrowth(connectionsData, timeRange),
      postTypesBreakdown: calculatePostTypesBreakdown(changelogData),
      topHashtags: calculateTopHashtags(postsData, changelogData),
      engagementPerPost: calculateEngagementPerPost(changelogData),
      messagesSentReceived: calculateMessagesSentReceived(changelogData),
      audienceDistribution: calculateAudienceDistribution(connectionsData),
      scoreImpacts: getScoreImpacts(),
      timeRange,
      lastUpdated: new Date().toISOString()
    };

    console.log("Analytics Data: Analysis complete");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify(analytics),
    };
  } catch (error) {
    console.error("Analytics Data Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Failed to fetch analytics data",
        details: error.message,
      }),
    };
  }
}

async function fetchLinkedInData(authorization, endpoint, domain = null, extraParams = "") {
  try {
    let url = `/.netlify/functions/${endpoint}`;
    const params = new URLSearchParams();
    
    if (domain) {
      params.append("domain", domain);
    }
    
    if (extraParams) {
      const extraParamsObj = new URLSearchParams(extraParams);
      for (const [key, value] of extraParamsObj) {
        params.append(key, value);
      }
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: authorization,
        "LinkedIn-Version": "202312",
      },
    });

    if (!response.ok) {
      console.warn(`Failed to fetch ${endpoint} ${domain}: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint} ${domain}:`, error);
    return null;
  }
}

function calculatePostsEngagementsTrend(changelogData, timeRange) {
  const elements = changelogData?.elements || [];
  
  // Determine date range
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const dateRange = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateRange.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      posts: 0,
      likes: 0,
      comments: 0,
      shares: 0
    });
  }
  
  // Count activities by date
  elements.forEach(element => {
    const elementDate = new Date(element.capturedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayData = dateRange.find(day => day.date === elementDate);
    
    if (dayData) {
      if (element.resourceName === "ugcPosts" && element.method === "CREATE") {
        dayData.posts++;
      } else if (element.resourceName === "socialActions/likes" && element.method === "CREATE") {
        dayData.likes++;
      } else if (element.resourceName === "socialActions/comments" && element.method === "CREATE") {
        dayData.comments++;
      } else if (element.resourceName === "socialActions/shares" && element.method === "CREATE") {
        dayData.shares++;
      }
    }
  });
  
  return dateRange.map(day => ({
    date: day.date,
    posts: day.posts,
    likes: day.likes,
    comments: day.comments,
    totalEngagement: day.likes + day.comments + day.shares
  }));
}

function calculateConnectionsGrowth(connectionsData, timeRange) {
  const connections = connectionsData?.elements?.[0]?.snapshotData || [];
  
  // Sort connections by date
  const sortedConnections = connections
    .filter(conn => conn["Connected On"] || conn.connectedOn)
    .sort((a, b) => {
      const dateA = new Date(a["Connected On"] || a.connectedOn);
      const dateB = new Date(b["Connected On"] || b.connectedOn);
      return dateA.getTime() - dateB.getTime();
    });

  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const growthData = [];
  let cumulativeCount = 0;
  
  // Calculate cumulative growth
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toLocaleDateString();
    const connectionsOnDate = sortedConnections.filter(conn => {
      const connDate = new Date(conn["Connected On"] || conn.connectedOn);
      return connDate.toLocaleDateString() === dateStr;
    }).length;
    
    cumulativeCount += connectionsOnDate;
    
    growthData.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      totalConnections: cumulativeCount,
      newConnections: connectionsOnDate
    });
  }
  
  return growthData;
}

function calculatePostTypesBreakdown(changelogData) {
  const posts = changelogData?.elements?.filter(e => 
    e.resourceName === "ugcPosts" && e.method === "CREATE"
  ) || [];
  
  const typeCounts = {
    "Text Only": 0,
    "Image": 0,
    "Video": 0,
    "Article": 0,
    "External Link": 0
  };
  
  posts.forEach(post => {
    const content = post.activity?.specificContent?.["com.linkedin.ugc.ShareContent"];
    const media = content?.media;
    
    if (media && media.length > 0) {
      const mediaType = media[0].mediaType || "IMAGE";
      if (mediaType.includes("VIDEO")) {
        typeCounts["Video"]++;
      } else if (mediaType.includes("IMAGE")) {
        typeCounts["Image"]++;
      } else {
        typeCounts["External Link"]++;
      }
    } else if (content?.shareCommentary?.text?.includes("http")) {
      typeCounts["External Link"]++;
    } else {
      typeCounts["Text Only"]++;
    }
  });
  
  return Object.entries(typeCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));
}

function calculateTopHashtags(postsData, changelogData) {
  const hashtagCounts = {};
  
  // Extract hashtags from snapshot data
  const snapshotPosts = postsData?.elements?.[0]?.snapshotData || [];
  snapshotPosts.forEach(post => {
    const content = post.ShareCommentary || "";
    const hashtags = content.match(/#[\w]+/g) || [];
    hashtags.forEach(hashtag => {
      hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
    });
  });
  
  // Extract hashtags from changelog data
  const changelogPosts = changelogData?.elements?.filter(e => 
    e.resourceName === "ugcPosts" && e.method === "CREATE"
  ) || [];
  
  changelogPosts.forEach(post => {
    const content = post.activity?.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text || "";
    const hashtags = content.match(/#[\w]+/g) || [];
    hashtags.forEach(hashtag => {
      hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
    });
  });
  
  return Object.entries(hashtagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([hashtag, count]) => ({ hashtag, count }));
}

function calculateEngagementPerPost(changelogData) {
  const elements = changelogData?.elements || [];
  
  // Get user posts
  const userPosts = elements.filter(e => 
    e.resourceName === "ugcPosts" && e.method === "CREATE"
  );
  
  // Build engagement map
  const engagementMap = {};
  userPosts.forEach(post => {
    engagementMap[post.resourceId] = {
      postId: post.resourceId,
      content: post.activity?.specificContent?.["com.linkedin.ugc.ShareContent"]?.shareCommentary?.text || "Post content",
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: post.capturedAt
    };
  });
  
  // Count engagements
  elements.forEach(element => {
    const postId = element.activity?.object;
    if (postId && engagementMap[postId]) {
      if (element.resourceName === "socialActions/likes" && element.method === "CREATE") {
        engagementMap[postId].likes++;
      } else if (element.resourceName === "socialActions/comments" && element.method === "CREATE") {
        engagementMap[postId].comments++;
      } else if (element.resourceName === "socialActions/shares" && element.method === "CREATE") {
        engagementMap[postId].shares++;
      }
    }
  });
  
  // Return top 10 posts by total engagement
  return Object.values(engagementMap)
    .map(post => ({
      ...post,
      totalEngagement: post.likes + post.comments + post.shares,
      content: post.content.substring(0, 50) + (post.content.length > 50 ? "..." : "")
    }))
    .sort((a, b) => b.totalEngagement - a.totalEngagement)
    .slice(0, 10);
}

function calculateMessagesSentReceived(changelogData) {
  const elements = changelogData?.elements || [];
  const currentUserId = elements.find(e => e.owner)?.owner;
  
  // Get last 30 days
  const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const dateRange = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dateRange.push({
      date: date.toLocaleDateString(),
      sent: 0,
      received: 0
    });
  }
  
  // Count messages
  elements
    .filter(e => e.resourceName === "messages" && e.capturedAt >= last30Days)
    .forEach(message => {
      const messageDate = new Date(message.capturedAt).toLocaleDateString();
      const dayData = dateRange.find(day => day.date === messageDate);
      
      if (dayData) {
        if (message.actor === currentUserId) {
          dayData.sent++;
        } else {
          dayData.received++;
        }
      }
    });
  
  return dateRange.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sent: day.sent,
    received: day.received
  }));
}

function calculateAudienceDistribution(connectionsData) {
  const connections = connectionsData?.elements?.[0]?.snapshotData || [];
  
  // Industry distribution
  const industries = {};
  const positions = {};
  const locations = {};
  
  connections.forEach(conn => {
    // Industry
    const industry = conn.Industry || "Unknown";
    industries[industry] = (industries[industry] || 0) + 1;
    
    // Position/Seniority
    const position = conn.Position || "Unknown";
    positions[position] = (positions[position] || 0) + 1;
    
    // Location
    const location = conn.Location || "Unknown";
    locations[location] = (locations[location] || 0) + 1;
  });
  
  return {
    industries: Object.entries(industries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value })),
    
    positions: Object.entries(positions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value })),
    
    locations: Object.entries(locations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }))
  };
}

function getScoreImpacts() {
  return {
    profileCompleteness: {
      description: "A complete profile increases visibility and credibility",
      impact: "Affects profile visibility and professional brand scores",
      tips: ["Add a professional headline", "Complete work experience", "Add relevant skills"]
    },
    postingActivity: {
      description: "Regular posting keeps you visible in your network's feed",
      impact: "Directly affects engagement quality and professional brand",
      tips: ["Post 3-5 times per week", "Share industry insights", "Engage with others' content"]
    },
    engagementQuality: {
      description: "High engagement indicates valuable content and strong network",
      impact: "Influences audience relevance and mutual interactions",
      tips: ["Ask questions in posts", "Share personal experiences", "Respond to comments quickly"]
    },
    networkGrowth: {
      description: "Growing your network expands your reach and opportunities",
      impact: "Affects audience relevance and engagement rate calculations",
      tips: ["Connect with industry peers", "Attend virtual events", "Engage before connecting"]
    },
    audienceRelevance: {
      description: "A relevant audience is more likely to engage with your content",
      impact: "Improves engagement rate and professional brand perception",
      tips: ["Connect with industry professionals", "Join relevant groups", "Share industry-specific content"]
    },
    contentDiversity: {
      description: "Varied content types keep your audience engaged",
      impact: "Enhances engagement quality and professional brand",
      tips: ["Mix text, images, and videos", "Share articles and insights", "Use polls and questions"]
    },
    engagementRate: {
      description: "High engagement relative to network size shows content quality",
      impact: "Key metric for LinkedIn algorithm and visibility",
      tips: ["Post when audience is active", "Create conversation-starting content", "Use relevant hashtags"]
    },
    mutualInteractions: {
      description: "Engaging with others builds relationships and visibility",
      impact: "Improves network growth and audience relevance",
      tips: ["Like and comment on others' posts", "Share valuable content", "Start conversations"]
    },
    profileVisibility: {
      description: "High visibility indicates strong personal brand",
      impact: "Affects all other scores through increased exposure",
      tips: ["Optimize profile for search", "Use keywords in headline", "Stay active and consistent"]
    },
    professionalBrand: {
      description: "Strong professional brand attracts the right opportunities",
      impact: "Influences all engagement and growth metrics",
      tips: ["Define your expertise area", "Share thought leadership", "Maintain consistent messaging"]
    }
  };
}