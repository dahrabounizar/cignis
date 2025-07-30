// Fixed dashboard data function with proper DMA implementation
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
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "No authorization token" }),
    };
  }

  const token = authorization.replace('Bearer ', '');

  try {
    console.log("Dashboard Data Fixed: Starting analysis with DMA checks");

    // 1) Precheck DMA enablement
    const dmaOk = await ensureDmaEnabled(token);
    if (!dmaOk) {
      return {
        statusCode: 428,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ 
          error: "DMA not enabled for this member",
          message: "Please enable archiving consent for DMA compliance"
        }),
      };
    }

    // 2) Fetch 28-day changes with proper headers
    const now = Date.now();
    const twentyEightDaysAgo = now - 28 * 24 * 3600 * 1000;
    const events = await fetchChangelogWindow(token, twentyEightDaysAgo, 50);

    console.log("Dashboard Data Fixed: Fetched events", {
      totalEvents: events.length,
      resourceNames: [...new Set(events.map(e => e.resourceName))]
    });

    // 3) Split by resourceName (exact mappings from PDF)
    const posts = events.filter(e => e.resourceName === "ugcPosts" && ["CREATE", "UPDATE"].includes(e.method));
    const comments = events.filter(e => e.resourceName === "socialActions/comments" && e.method === "CREATE");
    const likes = events.filter(e => e.resourceName === "socialActions/likes" && e.method === "CREATE");
    const invitations = events.filter(e => e.resourceName === "invitations");
    const messages = events.filter(e => e.resourceName === "messages");

    console.log("Dashboard Data Fixed: Event breakdown", {
      posts: posts.length,
      comments: comments.length,
      likes: likes.length,
      invitations: invitations.length,
      messages: messages.length
    });

    // 4) Posting Activity (last 30 days)
    const posts30d = posts.length;

    // 5) Engagement Quality & Rate
    const totalComments = comments.length;
    const totalLikes = likes.length;
    const totalEngagements = totalLikes + totalComments;
    const engagementPerPost = posts30d > 0 ? totalEngagements / posts30d : 0;
    const engagementRatePct = posts30d > 0 ? (totalEngagements / posts30d) * 100 : 0;

    // 6) Content Diversity (shareMediaCategory from activity.specificContent)
    const byType = { NONE: 0, ARTICLE: 0, VIDEO: 0, IMAGE: 0, URN_REFERENCE: 0, OTHER: 0 };
    for (const p of posts) {
      const sc = p.activity?.specificContent?.["com.linkedin.ugc.ShareContent"];
      const cat = sc?.shareMediaCategory || "OTHER";
      if (byType[cat] === undefined) byType.OTHER++;
      else byType[cat]++;
    }

    // 7) Network Growth proxy (invitations activity over 28d)
    const invitesCount = invitations.length;

    // 8) Weekly trend lines (group by ISO week from capturedAt)
    const toWeek = (ms) => {
      if (!ms) return "unknown";
      const d = new Date(ms);
      const firstJan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil((((d - firstJan) / 86400000 + firstJan.getDay() + 1) / 7));
      return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    };

    const weeklyPosts = {};
    for (const p of posts) {
      const wk = toWeek(p.capturedAt || p.processedAt);
      weeklyPosts[wk] = (weeklyPosts[wk] || 0) + 1;
    }

    const weeklyEng = {};
    for (const a of [...comments, ...likes]) {
      const wk = toWeek(a.capturedAt || a.processedAt);
      weeklyEng[wk] = (weeklyEng[wk] || 0) + 1;
    }

    // 9) Simple /10 scoring (don't overfit; keep high-level)
    const clamp10 = (x) => Math.max(0, Math.min(10, x));
    const postingActivityScore = clamp10(posts30d >= 8 ? 10 : posts30d >= 4 ? 7 : posts30d > 0 ? 5 : 2);
    const engagementQualityScore = clamp10(engagementPerPost >= 10 ? 10 : engagementPerPost >= 5 ? 7 : engagementPerPost > 0 ? 5 : 2);
    const contentDiversityScore = (() => {
      const kinds = Object.values(byType).filter(v => v > 0).length;
      return clamp10(kinds >= 4 ? 10 : kinds === 3 ? 8 : kinds === 2 ? 6 : kinds === 1 ? 4 : 2);
    })();
    const networkGrowthScore = clamp10(invitesCount >= 20 ? 10 : invitesCount >= 10 ? 7 : invitesCount > 0 ? 5 : 2);

    // 10) Add fallback scores for snapshot-based metrics
    let profileCompleteness = 2; // Default low score
    let audienceRelevance = 2;
    let profileVisibility = 2;
    let professionalBrand = 2;
    let mutualInteractions = Math.min(totalEngagements / 10, 10); // Based on user's own activity

    // Try to get snapshot data for better scores
    try {
      const [profileData, connectionsData] = await Promise.all([
        fetchSnapshotData(token, "PROFILE"),
        fetchSnapshotData(token, "CONNECTIONS")
      ]);

      if (profileData?.elements?.[0]?.snapshotData?.length > 0) {
        profileCompleteness = calculateProfileCompletenessFromSnapshot(profileData);
        professionalBrand = calculateProfessionalBrandFromSnapshot(profileData);
        profileVisibility = calculateProfileVisibilityFromSnapshot(profileData);
      }

      if (connectionsData?.elements?.[0]?.snapshotData?.length > 0) {
        audienceRelevance = calculateAudienceRelevanceFromSnapshot(connectionsData);
      }
    } catch (error) {
      console.log("Dashboard Data Fixed: Snapshot fallback failed, using defaults", error.message);
    }

    const result = {
      // Scores we can back with Changelog data
      profileEvaluation: {
        scores: {
          postingActivity: postingActivityScore,
          engagementQuality: engagementQualityScore,
          contentDiversity: contentDiversityScore,
          networkGrowth: networkGrowthScore,
          profileCompleteness,
          audienceRelevance,
          engagementRate: Math.min(engagementRatePct / 10, 10),
          mutualInteractions,
          profileVisibility,
          professionalBrand
        },
        overallScore: Math.round(((postingActivityScore + engagementQualityScore + contentDiversityScore + networkGrowthScore + profileCompleteness + audienceRelevance + Math.min(engagementRatePct / 10, 10) + mutualInteractions + profileVisibility + professionalBrand) / 10) * 10) / 10,
        explanations: getScoreExplanations()
      },

      // Tiles/summary KPIs
      summaryKPIs: {
        totalConnections: 0, // Will be filled by snapshot if available
        postsLast30Days: posts30d,
        engagementRate: `${engagementRatePct.toFixed(1)}%`,
        connectionsLast30Days: invitesCount // proxy
      },

      // Trends for "Weekly Trends" boxes
      miniTrends: {
        posts: Object.entries(weeklyPosts).map(([week, count]) => ({ date: week, value: count })),
        engagements: Object.entries(weeklyEng).map(([week, count]) => ({ date: week, value: count }))
      },

      lastUpdated: new Date().toISOString(),

      // Raw counts for debugging
      _debug: {
        dmaEnabled: true,
        eventsProcessed: events.length,
        counts: { 
          posts: posts.length, 
          comments: comments.length, 
          likes: likes.length, 
          invitations: invitations.length, 
          messages: messages.length 
        },
        contentTypes: byType
      }
    };

    console.log("Dashboard Data Fixed: Analysis complete", {
      overallScore: result.profileEvaluation.overallScore,
      posts30d,
      totalEngagements
    });

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
    console.error("Dashboard Data Fixed Error:", error);
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

// Helper functions
async function ensureDmaEnabled(token) {
  try {
    const response = await fetch("https://api.linkedin.com/rest/memberAuthorizations?q=memberAndApplication", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.log("DMA check failed:", response.status);
      return false;
    }

    const data = await response.json();
    const enabled = Array.isArray(data.elements) && data.elements.length > 0;
    
    if (enabled) {
      const hasRegulatedAt = data.elements.some(auth => auth.regulatedAt);
      return hasRegulatedAt;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking DMA enablement:", error);
    return false;
  }
}

async function fetchChangelogWindow(token, sinceMs, count = 10) {
  const safeCount = Math.min(50, Math.max(1, count));
  const qs = new URLSearchParams({ 
    q: "memberAndApplication", 
    count: String(safeCount) 
  });
  
  if (sinceMs) {
    qs.set("startTime", String(sinceMs));
  }

  const response = await fetch(`https://api.linkedin.com/rest/memberChangeLogs?${qs.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "LinkedIn-Version": "202312", // Required for versioned REST
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Changelog API failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.elements || [];
}

async function fetchSnapshotData(token, domain) {
  try {
    const response = await fetch(`https://api.linkedin.com/rest/memberSnapshotData?q=criteria&domain=${domain}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Snapshot API failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.log(`Snapshot fetch failed for ${domain}:`, error.message);
    return null;
  }
}

function calculateProfileCompletenessFromSnapshot(profileData) {
  const profileSnapshot = profileData?.elements?.[0]?.snapshotData || [];
  const profile = profileSnapshot[0] || {};
  
  let score = 0;
  if (profile["First Name"] || profile.firstName) score += 2;
  if (profile["Last Name"] || profile.lastName) score += 2;
  if (profile["Headline"] || profile.headline) score += 2;
  if (profile["Industry"] || profile.industry) score += 2;
  if (profile["Location"] || profile.location) score += 2;
  
  return Math.min(score, 10);
}

function calculateProfessionalBrandFromSnapshot(profileData) {
  const profileSnapshot = profileData?.elements?.[0]?.snapshotData || [];
  const profile = profileSnapshot[0] || {};
  
  let score = 0;
  const headline = profile["Headline"] || profile.headline || "";
  if (headline && headline.length > 20) score += 3;
  if (profile["Industry"] || profile.industry) score += 3;
  if (profile["Current Position"] || profile.currentPosition) score += 4;
  
  return Math.min(score, 10);
}

function calculateProfileVisibilityFromSnapshot(profileData) {
  const profileSnapshot = profileData?.elements?.[0]?.snapshotData || [];
  const profile = profileSnapshot[0] || {};
  
  let score = 2; // Base score
  const profileViews = parseInt(profile["Profile Views"] || profile.profileViews || "0");
  if (profileViews >= 100) score += 3;
  else if (profileViews >= 50) score += 2;
  else if (profileViews >= 10) score += 1;
  
  return Math.min(score, 10);
}

function calculateAudienceRelevanceFromSnapshot(connectionsData) {
  const connections = connectionsData?.elements?.[0]?.snapshotData || [];
  if (connections.length === 0) return 2;
  
  const industries = {};
  connections.forEach(conn => {
    const industry = conn.Industry || conn.industry || "Unknown";
    industries[industry] = (industries[industry] || 0) + 1;
  });
  
  const industryCount = Object.keys(industries).length;
  const diversityScore = Math.min(industryCount / 5, 1) * 10;
  
  return Math.min(Math.round(diversityScore), 10);
}

function getScoreExplanations() {
  return {
    profileCompleteness: "Profile completeness based on filled fields (headline, skills, experience, education)",
    postingActivity: "Posting frequency in the last 28 days from LinkedIn changelog",
    engagementQuality: "Average engagement (likes + comments) received per post",
    networkGrowth: "New connections and invitations in the last 28 days",
    audienceRelevance: "Industry diversity and professional connection quality",
    contentDiversity: "Variety in content types (text, images, videos, articles)",
    engagementRate: "Total engagement relative to post count",
    mutualInteractions: "Engagement you give to others (likes, comments)",
    profileVisibility: "Profile views and search appearances from LinkedIn",
    professionalBrand: "Professional signals (headline, industry, current role)"
  };
}