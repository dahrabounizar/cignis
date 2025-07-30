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
    console.log("Dashboard Data: No authorization header");
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "No authorization token" }),
    };
  }

  // Extract token from Bearer header
  const token = authorization.replace('Bearer ', '');

  try {
    console.log("Dashboard Data: Starting analysis");

    // Fetch all required data in parallel
    const [
      profileData,
      connectionsData,
      postsData,
      changelogData,
      skillsData,
      positionsData,
      educationData
    ] = await Promise.all([
      fetchLinkedInData(authorization, "linkedin-snapshot", "PROFILE"),
      fetchLinkedInData(authorization, "linkedin-snapshot", "CONNECTIONS"),
      fetchLinkedInData(authorization, "linkedin-snapshot", "MEMBER_SHARE_INFO"),
      fetchLinkedInData(authorization, "linkedin-changelog", null, "count=100"),
      fetchLinkedInData(authorization, "linkedin-snapshot", "SKILLS"),
      fetchLinkedInData(authorization, "linkedin-snapshot", "POSITIONS"),
      fetchLinkedInData(authorization, "linkedin-snapshot", "EDUCATION")
    ]);

    // Log data availability for debugging
    console.log("Dashboard Data: API data summary:", {
      profile: profileData?.elements?.length || 0,
      connections: connectionsData?.elements?.[0]?.snapshotData?.length || 0,
      posts: postsData?.elements?.[0]?.snapshotData?.length || 0,
      changelog: changelogData?.elements?.length || 0,
      skills: skillsData?.elements?.[0]?.snapshotData?.length || 0,
      positions: positionsData?.elements?.[0]?.snapshotData?.length || 0,
      education: educationData?.elements?.[0]?.snapshotData?.length || 0
    });

    // Check if we have minimal data, if not provide realistic fallbacks
    const hasMinimalData = (
      (connectionsData?.elements?.[0]?.snapshotData?.length || 0) > 0 ||
      (postsData?.elements?.[0]?.snapshotData?.length || 0) > 0 ||
      (changelogData?.elements?.length || 0) > 0
    );

    let profileEvaluation, summaryKPIs, miniTrends;

    if (hasMinimalData) {
      // Calculate with real data
      profileEvaluation = calculateProfileEvaluation({
        profileData,
        connectionsData,
        postsData,
        changelogData,
        skillsData,
        positionsData,
        educationData
      });

      summaryKPIs = calculateSummaryKPIs({
        connectionsData,
        postsData,
        changelogData
      });

      miniTrends = calculateMiniTrends(changelogData);
    } else {
      // Provide realistic demo data when no real data is available
      console.log("Dashboard Data: No real data available, using demo data");
      
      profileEvaluation = {
        scores: {
          profileCompleteness: 7,
          postingActivity: 6,
          engagementQuality: 8,
          networkGrowth: 5,
          audienceRelevance: 7,
          contentDiversity: 6,
          engagementRate: 8,
          mutualInteractions: 7,
          profileVisibility: 6,
          professionalBrand: 8
        },
        overallScore: 7,
        explanations: getScoreExplanations()
      };

      summaryKPIs = {
        totalConnections: 1247,
        postsLast30Days: 8,
        engagementRate: "6.4%",
        connectionsLast30Days: 23
      };

      miniTrends = {
        posts: [
          { date: "Day 1", value: 0 },
          { date: "Day 2", value: 1 },
          { date: "Day 3", value: 2 },
          { date: "Day 4", value: 0 },
          { date: "Day 5", value: 1 },
          { date: "Day 6", value: 3 },
          { date: "Day 7", value: 1 }
        ],
        engagements: [
          { date: "Day 1", value: 12 },
          { date: "Day 2", value: 18 },
          { date: "Day 3", value: 25 },
          { date: "Day 4", value: 8 },
          { date: "Day 5", value: 15 },
          { date: "Day 6", value: 32 },
          { date: "Day 7", value: 19 }
        ]
      };
    }

    const result = {
      profileEvaluation,
      summaryKPIs,
      miniTrends,
      lastUpdated: new Date().toISOString(),
      isDemoData: !hasMinimalData
    };

    console.log("Dashboard Data: Analysis complete", { isDemoData: !hasMinimalData });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Dashboard Data Error:", error);
    console.error("Dashboard Data Error Stack:", error.stack);

    // Return demo data even on error to prevent 0s in dashboard
    const fallbackResult = {
      profileEvaluation: {
        scores: {
          profileCompleteness: 6,
          postingActivity: 5,
          engagementQuality: 7,
          networkGrowth: 4,
          audienceRelevance: 6,
          contentDiversity: 5,
          engagementRate: 7,
          mutualInteractions: 6,
          profileVisibility: 5,
          professionalBrand: 7
        },
        overallScore: 6,
        explanations: getScoreExplanations()
      },
      summaryKPIs: {
        totalConnections: 892,
        postsLast30Days: 5,
        engagementRate: "4.8%",
        connectionsLast30Days: 15
      },
      miniTrends: {
        posts: [
          { date: "Day 1", value: 1 },
          { date: "Day 2", value: 0 },
          { date: "Day 3", value: 1 },
          { date: "Day 4", value: 2 },
          { date: "Day 5", value: 0 },
          { date: "Day 6", value: 1 },
          { date: "Day 7", value: 0 }
        ],
        engagements: [
          { date: "Day 1", value: 8 },
          { date: "Day 2", value: 12 },
          { date: "Day 3", value: 15 },
          { date: "Day 4", value: 22 },
          { date: "Day 5", value: 6 },
          { date: "Day 6", value: 18 },
          { date: "Day 7", value: 10 }
        ]
      },
      lastUpdated: new Date().toISOString(),
      isDemoData: true,
      error: "Fallback data due to API error"
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify(fallbackResult),
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
      const errorText = await response.text();
      console.error(`Failed to fetch ${endpoint} ${domain}: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint} ${domain}:`, error);
    return null;
  }
}

function calculateProfileEvaluation(data) {
  const {
    profileData,
    connectionsData,
    postsData,
    changelogData,
    skillsData,
    positionsData,
    educationData
  } = data;

  const scores = {};

  // 1. Profile Completeness (0-10)
  scores.profileCompleteness = calculateProfileCompleteness({
    profileData,
    skillsData,
    positionsData,
    educationData
  });

  // 2. Posting Activity (0-10)
  scores.postingActivity = calculatePostingActivity(postsData, changelogData);

  // 3. Engagement Quality (0-10)
  scores.engagementQuality = calculateEngagementQuality(changelogData);

  // 4. Network Growth (0-10)
  scores.networkGrowth = calculateNetworkGrowth(connectionsData);

  // 5. Audience Relevance (0-10)
  scores.audienceRelevance = calculateAudienceRelevance(connectionsData);

  // 6. Content Diversity (0-10)
  scores.contentDiversity = calculateContentDiversity(postsData, changelogData);

  // 7. Engagement Rate vs Followers (0-10)
  scores.engagementRate = calculateEngagementRate(postsData, changelogData, connectionsData);

  // 8. Mutual Interactions (0-10)
  scores.mutualInteractions = calculateMutualInteractions(changelogData);

  // 9. Profile Visibility Signals (0-10)
  scores.profileVisibility = calculateProfileVisibility(profileData);

  // 10. Professional Brand Signals (0-10)
  scores.professionalBrand = calculateProfessionalBrand({
    profileData,
    postsData,
    positionsData
  });

  // Calculate overall score
  const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 10;

  return {
    scores,
    overallScore: Math.round(overallScore * 10) / 10,
    explanations: getScoreExplanations()
  };
}

function calculateProfileCompleteness({ profileData, skillsData, positionsData, educationData }) {
  let score = 0;
  
  // Extract actual data arrays from LinkedIn API response
  const profileSnapshot = profileData?.elements?.[0]?.snapshotData || [];
  const skillsSnapshot = skillsData?.elements?.[0]?.snapshotData || [];
  const positionsSnapshot = positionsData?.elements?.[0]?.snapshotData || [];
  const educationSnapshot = educationData?.elements?.[0]?.snapshotData || [];
  
  // LinkedIn profile data might be an array, find the main profile entry
  const profile = profileSnapshot.find(p => 
    p["First Name"] || p["Last Name"] || p.firstName || p.lastName || 
    p.headline || p.Headline || p.industry || p.Industry
  ) || profileSnapshot[0] || {};
  
  // Basic info (4 points)
  if (profile["First Name"] || profile.firstName) {
    score += 1;
  }
  if (profile["Last Name"] || profile.lastName) {
    score += 1;
  }
  if (profile["Headline"] || profile.headline) {
    score += 1;
  }
  if (profile["Industry"] || profile.industry) {
    score += 1;
  }
  
  // Skills (2 points)
  const skillsCount = skillsSnapshot.length;
  const skillsPoints = Math.min(skillsCount / 5, 2);
  score += skillsPoints;
  
  // Experience (2 points)
  const positionsCount = positionsSnapshot.length;
  const positionsPoints = Math.min(positionsCount / 2, 2);
  score += positionsPoints;
  
  // Education (2 points)
  const educationCount = educationSnapshot.length;
  const educationPoints = Math.min(educationCount, 2);
  score += educationPoints;
  
  const finalScore = Math.min(Math.round(score), 10);
  
  return finalScore;
}

function calculatePostingActivity(postsData, changelogData) {
  // Get posts from changelog (last 28 days)
  const posts = changelogData?.elements?.filter(e => 
    e.resourceName === "ugcPosts" && e.method === "CREATE"
  ) || [];
  
  // Also check snapshot data for historical posts
  const snapshotPosts = postsData?.elements?.[0]?.snapshotData || [];
  
  const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentPosts = posts.filter(p => p.capturedAt >= last30Days);
  
  // If no recent posts in changelog, use snapshot data
  const totalRecentPosts = recentPosts.length > 0 ? recentPosts.length : Math.min(snapshotPosts.length, 10);
  
  // Score based on posting frequency (0-10)
  let score = 0;
  if (totalRecentPosts >= 20) score = 10;
  else if (totalRecentPosts >= 15) score = 8;
  else if (totalRecentPosts >= 10) score = 6;
  else if (totalRecentPosts >= 5) score = 4;
  else if (totalRecentPosts >= 1) score = 2;
  else score = 0;
  return score;
}

function calculateEngagementQuality(changelogData) {
  console.log("=== ENGAGEMENT QUALITY CALCULATION ===");
  
  const elements = changelogData?.elements || [];
  console.log("Total changelog elements:", elements.length);
  
  const likes = elements.filter(e => e.resourceName === "socialActions/likes" && e.method === "CREATE");
  const comments = elements.filter(e => e.resourceName === "socialActions/comments" && e.method === "CREATE");
  const posts = elements.filter(e => e.resourceName === "ugcPosts" && e.method === "CREATE");
  
  console.log("Engagement data:", {
    likes: likes.length,
    comments: comments.length,
    posts: posts.length
  });
  
  console.log("Sample like:", likes[0]);
  console.log("Sample comment:", comments[0]);
  console.log("Sample post:", posts[0]);
  
  if (posts.length === 0) return 0;
  
  const avgEngagement = (likes.length + comments.length) / posts.length;
  
  let score = 0;
  if (avgEngagement >= 20) score = 10;
  else if (avgEngagement >= 15) score = 8;
  else if (avgEngagement >= 10) score = 6;
  else if (avgEngagement >= 5) score = 4;
  else if (avgEngagement >= 1) score = 2;
  else score = 0;
  
  console.log(`Engagement quality score: ${score}/10 (avg: ${avgEngagement})`);
  return score;
}

function calculateNetworkGrowth(connectionsData, changelogData) {
  console.log("=== NETWORK GROWTH CALCULATION ===");
  
  const connections = connectionsData?.elements?.[0]?.snapshotData || [];
  console.log("Total connections from snapshot:", connections.length);
  console.log("Sample connection:", connections[0]);
  
  // Also check changelog for invitation acceptances
  const invitations = changelogData?.elements?.filter(e => 
    e.resourceName === "invitations" && e.method === "CREATE"
  ) || [];
  
  console.log("Invitations in changelog:", invitations.length);
  console.log("Sample invitation:", invitations[0]);
  
  const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  // Count recent connections from snapshot data
  const recentConnections = connections.filter(conn => {
    const connectedDate = new Date(conn["Connected On"] || conn.connectedOn || conn.date || conn.Date);
    return connectedDate.getTime() >= last30Days;
  });
  
  // Add recent invitations from changelog
  const recentInvitations = invitations.filter(inv => inv.capturedAt >= last30Days);
  
  const totalRecentGrowth = recentConnections.length + recentInvitations.length;
  
  console.log("Network growth (30d):", {
    recentConnections: recentConnections.length,
    recentInvitations: recentInvitations.length,
    total: totalRecentGrowth
  });
  
  let score = 0;
  if (totalRecentGrowth >= 50) score = 10;
  else if (totalRecentGrowth >= 30) score = 8;
  else if (totalRecentGrowth >= 20) score = 6;
  else if (totalRecentGrowth >= 10) score = 4;
  else if (totalRecentGrowth >= 5) score = 2;
  else score = 0;
  
  console.log(`Network growth score: ${score}/10 (${totalRecentGrowth} new connections)`);
  return score;
}

function calculateAudienceRelevance(connectionsData) {
  console.log("=== AUDIENCE RELEVANCE CALCULATION ===");
  
  const connections = connectionsData?.elements?.[0]?.snapshotData || [];
  console.log("Processing connections for audience relevance:", connections.length);
  console.log("Sample connection for relevance:", connections[0]);
  
  // Calculate industry diversity
  const industries = {};
  connections.forEach(conn => {
    const industry = conn.Industry || conn.industry || conn.Company || conn.company || "Unknown";
    industries[industry] = (industries[industry] || 0) + 1;
  });
  
  const industryCount = Object.keys(industries).length;
  const totalConnections = connections.length;
  
  console.log("Industry diversity:", {
    uniqueIndustries: industryCount,
    totalConnections,
    topIndustries: Object.entries(industries).sort(([,a], [,b]) => b - a).slice(0, 3)
  });
  
  if (totalConnections === 0) return 0;
  
  // Score based on industry diversity and professional titles
  const diversityScore = Math.min(industryCount / 10, 1) * 5; // 0-5 points
  
  const professionalConnections = connections.filter(conn => 
    (conn.Position && conn.Position.trim()) || (conn.position && conn.position.trim()) || 
    (conn.Title && conn.Title.trim()) || (conn.title && conn.title.trim())
  ).length;
  const professionalRatio = professionalConnections / totalConnections;
  const professionalScore = professionalRatio * 5; // 0-5 points
  
  const finalScore = Math.round(diversityScore + professionalScore);
  
  console.log("Audience relevance calculation:", {
    diversityScore,
    professionalScore,
    professionalConnections,
    professionalRatio,
    finalScore
  });
  
  console.log(`Audience relevance score: ${finalScore}/10`);
  return finalScore;
}

function calculateContentDiversity(postsData, changelogData) {
  console.log("=== CONTENT DIVERSITY CALCULATION ===");
  
  // Check both snapshot and changelog data for content types
  const snapshotPosts = postsData?.elements?.[0]?.snapshotData || [];
  const posts = changelogData?.elements?.filter(e => 
    e.resourceName === "ugcPosts" && e.method === "CREATE"
  ) || [];
  
  console.log("Content diversity data:", {
    snapshotPosts: snapshotPosts.length,
    changelogPosts: posts.length
  });
  
  console.log("Sample snapshot post:", snapshotPosts[0]);
  console.log("Sample changelog post:", posts[0]);
  
  const totalPosts = posts.length + snapshotPosts.length;
  if (totalPosts === 0) return 0;
  
  const contentTypes = {
    text: 0,
    image: 0,
    video: 0,
    article: 0,
    external: 0
  };
  
  // Process changelog posts
  posts.forEach(post => {
    const content = post.activity?.specificContent?.["com.linkedin.ugc.ShareContent"];
    const media = content?.media;
    
    if (media && media.length > 0) {
      const mediaType = media[0].mediaType || "IMAGE";
      if (mediaType.includes("VIDEO")) {
        contentTypes.video++;
      } else {
        contentTypes.image++;
      }
    } else {
      contentTypes.text++;
    }
  });
  
  // Process snapshot posts
  snapshotPosts.forEach(post => {
    const mediaType = post["Media Type"] || post.mediaType || post.MediaType || "TEXT";
    if (mediaType === "VIDEO") {
      contentTypes.video++;
    } else if (mediaType === "IMAGE") {
      contentTypes.image++;
    } else if (mediaType === "ARTICLE") {
      contentTypes.article++;
    } else if (post["Shared URL"] || post.sharedUrl || post.SharedUrl) {
      contentTypes.external++;
    } else {
      contentTypes.text++;
    }
  });
  
  const typeCount = Object.values(contentTypes).filter(count => count > 0).length;
  const score = Math.min(typeCount * 2.5, 10);
  
  console.log("Content types breakdown:", contentTypes);
  console.log(`Content diversity score: ${score}/10 (${typeCount} unique types)`);
  
  return Math.round(score);
}

function calculateEngagementRate(postsData, changelogData, connectionsData) {
  console.log("=== ENGAGEMENT RATE CALCULATION ===");
  
  const posts = changelogData?.elements?.filter(e => 
    e.resourceName === "ugcPosts" && e.method === "CREATE"
  ) || [];
  
  const likes = changelogData?.elements?.filter(e => 
    e.resourceName === "socialActions/likes" && e.method === "CREATE"
  ) || [];
  
  const comments = changelogData?.elements?.filter(e => 
    e.resourceName === "socialActions/comments" && e.method === "CREATE"
  ) || [];
  
  const totalConnections = connectionsData?.elements?.[0]?.snapshotData?.length || 1;
  const totalEngagement = likes.length + comments.length;
  
  console.log("Engagement rate calculation:", {
    posts: posts.length,
    likes: likes.length,
    comments: comments.length,
    totalConnections,
    totalEngagement
  });
  
  if (posts.length === 0) return 0;
  
  const engagementRate = (totalEngagement / posts.length / totalConnections) * 100;
  
  let score = 0;
  if (engagementRate >= 5) score = 10;
  else if (engagementRate >= 3) score = 8;
  else if (engagementRate >= 2) score = 6;
  else if (engagementRate >= 1) score = 4;
  else if (engagementRate >= 0.5) score = 2;
  else score = 0;
  
  console.log(`Engagement rate score: ${score}/10 (rate: ${engagementRate.toFixed(2)}%)`);
  return score;
}

function calculateMutualInteractions(changelogData) {
  console.log("=== MUTUAL INTERACTIONS CALCULATION ===");
  
  const elements = changelogData?.elements || [];
  console.log("Total elements for mutual interactions:", elements.length);
  
  // Comments given by user (from changelog)
  const myLikes = elements.filter(e => 
    e.resourceName === "socialActions/likes" && e.method === "CREATE"
  );
  const myComments = elements.filter(e => 
    e.resourceName === "socialActions/comments" && e.method === "CREATE"
  );
  
  const totalInteractions = myLikes.length + myComments.length;
  
  console.log("Mutual interactions:", {
    likes: myLikes.length,
    comments: myComments.length,
    total: totalInteractions
  });
  
  console.log("Sample like interaction:", myLikes[0]);
  console.log("Sample comment interaction:", myComments[0]);
  
  let score = 0;
  if (totalInteractions >= 100) score = 10;
  else if (totalInteractions >= 75) score = 8;
  else if (totalInteractions >= 50) score = 6;
  else if (totalInteractions >= 25) score = 4;
  else if (totalInteractions >= 10) score = 2;
  else score = 0;
  
  console.log(`Mutual interactions score: ${score}/10 (${totalInteractions} interactions)`);
  return score;
}

function calculateProfileVisibility(profileData) {
  console.log("=== PROFILE VISIBILITY CALCULATION ===");
  
  const profileSnapshot = profileData?.elements?.[0]?.snapshotData || [];
  console.log("Profile snapshot for visibility:", profileSnapshot.length);
  console.log("Sample profile data:", profileSnapshot[0]);
  
  const profile = profileSnapshot.find(p => 
    p["Profile Views"] || p["Search Appearances"] || p.profileViews || p.searchAppearances
  ) || profileSnapshot[0] || {};
  
  console.log("Profile visibility data:", profile);
  console.log("Profile visibility keys:", Object.keys(profile));
  
  let score = 0;
  
  // Profile views (if available)
  const profileViews = parseInt(profile["Profile Views"] || profile.profileViews || "0");
  console.log("Profile views:", profileViews);
  
  if (profileViews >= 1000) score += 4;
  else if (profileViews >= 500) score += 3;
  else if (profileViews >= 100) score += 2;
  else if (profileViews >= 50) score += 1;
  
  // Search appearances (if available)
  const searchAppearances = parseInt(profile["Search Appearances"] || profile.searchAppearances || "0");
  console.log("Search appearances:", searchAppearances);
  
  if (searchAppearances >= 100) score += 3;
  else if (searchAppearances >= 50) score += 2;
  else if (searchAppearances >= 10) score += 1;
  
  // Profile completeness indicators
  if ((profile.Headline || profile.headline) && (profile.Headline || profile.headline).length > 50) score += 1;
  if (profile.Industry || profile.industry) score += 1;
  if (profile.Location || profile.location) score += 1;
  
  console.log(`Profile visibility score: ${score}/10`);
  
  return Math.min(score, 10);
}

function calculateProfessionalBrand(data) {
  console.log("=== PROFESSIONAL BRAND CALCULATION ===");
  
  const { profileData, postsData, positionsData } = data;
  const profileSnapshot = profileData?.elements?.[0]?.snapshotData || [];
  const profile = profileSnapshot.find(p => 
    p["First Name"] || p["Last Name"] || p.firstName || p.lastName || 
    p.headline || p.Headline || p.industry || p.Industry
  ) || profileSnapshot[0] || {};
  
  console.log("Professional brand profile data:", profile);
  console.log("Professional brand data analysis:", {
    hasHeadline: !!(profile.Headline || profile.headline),
    hasIndustry: !!(profile.Industry || profile.industry),
    positionsCount: positionsData?.elements?.[0]?.snapshotData?.length || 0
  });
  
  let score = 0;
  
  // Professional headline
  const headline = profile.Headline || profile.headline || "";
  if (headline && headline.length > 20) {
    score += 2;
    console.log("Found professional headline, +2 points");
  }
  
  // Industry specified
  if (profile.Industry || profile.industry) {
    score += 2;
    console.log("Found industry, +2 points");
  }
  
  // Work experience
  const positions = positionsData?.elements?.[0]?.snapshotData || [];
  console.log("Positions found:", positions.length);
  console.log("Sample position:", positions[0]);
  
  if (positions.length >= 3) {
    score += 2;
    console.log("Found 3+ positions, +2 points");
  } else if (positions.length >= 1) {
    score += 1;
    console.log("Found 1+ positions, +1 point");
  }
  
  // Current position
  const currentPosition = positions.find(pos => 
    pos["End Date"] === null || !pos["End Date"] || pos.endDate === null || !pos.endDate
  );
  if (currentPosition) {
    score += 2;
    console.log("Found current position, +2 points");
  }
  
  // Professional posting (check for business-related content)
  const posts = postsData?.elements?.[0]?.snapshotData || [];
  const professionalPosts = posts.filter(post => {
    const content = post.ShareCommentary || post.shareCommentary || post.commentary || "";
    return content.includes("business") || content.includes("professional") || 
           content.includes("industry") || content.includes("career");
  });
  
  if (posts.length > 0 && professionalPosts.length / posts.length >= 0.5) {
    score += 2;
    console.log("Found professional content, +2 points");
  }
  
  console.log(`Professional brand score: ${score}/10`);
  
  return Math.min(score, 10);
}

function calculateSummaryKPIs(data) {
  const { connectionsData, postsData, changelogData } = data;
  
  const totalConnections = connectionsData?.elements?.[0]?.snapshotData?.length || 0;
  
  const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  // Posts last 30 days
  const recentPosts = changelogData?.elements?.filter(e => 
    e.resourceName === "ugcPosts" && 
    e.method === "CREATE" && 
    e.capturedAt >= last30Days
  ) || [];
  
  // If no recent posts in changelog, estimate from snapshot
  const snapshotPosts = postsData?.elements?.[0]?.snapshotData || [];
  const postsLast30Days = recentPosts.length > 0 ? recentPosts.length : Math.min(snapshotPosts.length, 5);
  
  // Connections added last 30 days
  const connections = connectionsData?.elements?.[0]?.snapshotData || [];
  const recentConnections = connections.filter(conn => {
    const connectedDate = new Date(conn["Connected On"] || conn.connectedOn || conn.date || conn.Date);
    return connectedDate.getTime() >= last30Days;
  });
  
  // Add invitations from changelog
  const recentInvitations = changelogData?.elements?.filter(e => 
    e.resourceName === "invitations" && 
    e.method === "CREATE" && 
    e.capturedAt >= last30Days
  ) || [];
  
  // Engagement rate
  const likes = changelogData?.elements?.filter(e => 
    e.resourceName === "socialActions/likes" && e.method === "CREATE"
  ) || [];
  const comments = changelogData?.elements?.filter(e => 
    e.resourceName === "socialActions/comments" && e.method === "CREATE"
  ) || [];
  
  const totalEngagement = likes.length + comments.length;
  const engagementRate = postsLast30Days > 0 ? 
    ((totalEngagement / postsLast30Days) * 100).toFixed(1) : "0";
  
  const kpis = {
    totalConnections,
    postsLast30Days,
    engagementRate: `${engagementRate}%`,
    connectionsLast30Days: recentConnections.length + recentInvitations.length
  };
  return kpis;
}

function calculateMiniTrends(changelogData) {
  const elements = changelogData?.elements || [];
  
  // Get last 7 days of data
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push({
      date: date.toISOString().split('T')[0], // Use ISO date format
      posts: 0,
      engagements: 0
    });
  }
  
  // Count posts and engagements by day
  elements.forEach(element => {
    const elementDate = new Date(element.capturedAt).toISOString().split('T')[0];
    const dayData = last7Days.find(day => day.date === elementDate);
    
    if (dayData) {
      if (element.resourceName === "ugcPosts" && element.method === "CREATE") {
        dayData.posts++;
      } else if (
        (element.resourceName === "socialActions/likes" || 
         element.resourceName === "socialActions/comments") && 
        element.method === "CREATE"
      ) {
        dayData.engagements++;
      }
    }
  });
  
  const trends = {
    posts: last7Days.map((day, index) => ({ 
      date: `Day ${index + 1}`, 
      value: day.posts 
    })),
    engagements: last7Days.map((day, index) => ({ 
      date: `Day ${index + 1}`, 
      value: day.engagements 
    }))
  };
  return trends;
}

function getScoreExplanations() {
  return {
    profileCompleteness: "Profile completeness based on filled fields (headline, skills, experience, education)",
    postingActivity: "Posting frequency in the last 30 days from LinkedIn changelog",
    engagementQuality: "Average engagement (likes + comments) received per post",
    networkGrowth: "New connections and invitations in the last 30 days",
    audienceRelevance: "Industry diversity and professional connection quality",
    contentDiversity: "Variety in content types (text, images, videos, articles)",
    engagementRate: "Total engagement relative to your network size",
    mutualInteractions: "Engagement you give to others (likes, comments)",
    profileVisibility: "Profile views and search appearances from LinkedIn",
    professionalBrand: "Professional signals (headline, industry, current role)"
  };
}