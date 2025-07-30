// Import the helper functions (we'll need to convert to CommonJS for Netlify functions)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const LI_REST = "https://api.linkedin.com/rest";

async function liGet(path, token, opts = {}) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    ...opts.headers
  };
  
  // Changelog is versioned → header required
  if (path.startsWith("/memberChangeLogs")) {
    headers['LinkedIn-Version'] = '202312';
  }
  
  const res = await fetch(`${LI_REST}${path}`, { ...opts, headers });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`LinkedIn ${res.status}: ${t || "No body"}`);
  }
  return res.json();
}

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

async function ensureDmaEnabled(token) {
  const finder = await liGet("/memberAuthorizations?q=memberAndApplication", token);
  const enabled = Array.isArray(finder.elements) && finder.elements.length > 0;
  return enabled;
}

async function fetchChangelogWindow(token, sinceMs, count = 10) {
  // count must be 1..50; outside → 400 per PDF
  const safeCount = Math.min(50, Math.max(1, count));
  const qs = new URLSearchParams({ q: "memberAndApplication", count: String(safeCount) });
  if (sinceMs) qs.set("startTime", String(sinceMs));
  const data = await liGet(`/memberChangeLogs?${qs.toString()}`, token);
  return data.elements || [];
}

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
    console.log("Dashboard Data: Starting real LinkedIn data fetch");

    // 1) Precheck DMA enablement
    const dmaOk = await ensureDmaEnabled(token);
    if (!dmaOk) {
      console.log("DMA not enabled for this member");
      return {
        statusCode: 428,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ error: "DMA not enabled for this member" })
      };
    }

    // 2) Fetch 28-day changes
    const now = Date.now();
    const twentyEightDaysAgo = now - 28 * 24 * 3600 * 1000;
    const events = await fetchChangelogWindow(token, twentyEightDaysAgo, 50);

    console.log("Total changelog events:", events.length);

    // 3) Split by resourceName
    const posts = events.filter(e => e.resourceName === "ugcPosts");
    const comments = events.filter(e => e.resourceName === "socialActions/comments");
    const likes = events.filter(e => e.resourceName === "socialActions/likes");
    const invitations = events.filter(e => e.resourceName === "invitations");
    const messages = events.filter(e => e.resourceName === "messages");

    console.log("Event breakdown:", {
      posts: posts.length,
      comments: comments.length,
      likes: likes.length,
      invitations: invitations.length,
      messages: messages.length
    });

    // 4) Posting Activity
    const posts30d = posts.filter(p => p.method === "CREATE").length;

    // 5) Engagement Quality & Rate
    const totalComments = comments.filter(c => c.method === "CREATE").length;
    const totalLikes = likes.filter(l => l.method === "CREATE").length;
    const totalEngagements = totalLikes + totalComments;
    const engagementPerPost = posts30d > 0 ? totalEngagements / posts30d : 0;
    const engagementRatePct = posts30d > 0 ? (totalEngagements / posts30d) * 100 : 0;

    // 6) Content Diversity (shareMediaCategory from activity.specificContent)
    const byType = { NONE: 0, ARTICLE: 0, VIDEO: 0, IMAGE: 0, URN_REFERENCE: 0, OTHER: 0 };
    for (const p of posts.filter(p => p.method === "CREATE")) {
      const sc = p.activity?.specificContent?.["com.linkedin.ugc.ShareContent"];
      const cat = sc?.shareMediaCategory || "OTHER";
      if (byType[cat] === undefined) byType.OTHER++;
      else byType[cat]++;
    }

    // 7) Network Growth proxy (invitations activity over 28d)
    const invitesCount = invitations.filter(i => i.method === "CREATE").length;

    // 8) Weekly trend lines (group by ISO week from capturedAt)
    const toWeek = (ms) => {
      if (!ms) return "unknown";
      const d = new Date(ms);
      // simple week key; replace with date-fns if needed
      const firstJan = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil((((d - firstJan) / 86400000 + firstJan.getDay() + 1) / 7);
      return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    };
    
    const weeklyPosts = {};
    for (const p of posts.filter(p => p.method === "CREATE")) {
      const wk = toWeek(p.capturedAt || p.processedAt);
      weeklyPosts[wk] = (weeklyPosts[wk] || 0) + 1;
    }
    
    const weeklyEng = {};
    for (const a of [...comments, ...likes].filter(e => e.method === "CREATE")) {
      const wk = toWeek(a.capturedAt || a.processedAt);
      weeklyEng[wk] = (weeklyEng[wk] || 0) + 1;
    }

    // 9) Calculate 7-day trends for mini trends
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toISOString().split('T')[0],
        posts: 0,
        engagements: 0
      });
    }
    
    // Count posts and engagements by day
    events.forEach(element => {
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

    // 10) Simple /10 scoring (don't overfit; keep high-level)
    const clamp10 = (x) => Math.max(0, Math.min(10, x));
    const postingActivityScore = clamp10(posts30d >= 8 ? 10 : posts30d >= 4 ? 7 : posts30d > 0 ? 5 : 2);
    const engagementQualityScore = clamp10(engagementPerPost >= 10 ? 10 : engagementPerPost >= 5 ? 7 : engagementPerPost > 0 ? 5 : 2);
    const contentDiversityScore = (() => {
      const kinds = Object.values(byType).filter(v => v > 0).length;
      return clamp10(kinds >= 4 ? 10 : kinds === 3 ? 8 : kinds === 2 ? 6 : kinds === 1 ? 4 : 2);
    })();
    const networkGrowthScore = clamp10(invitesCount >= 20 ? 10 : invitesCount >= 10 ? 7 : invitesCount > 0 ? 5 : 2);

    // For scores that require snapshot data, we'll use placeholder values for now
    // These can be enhanced later with Member Snapshot API calls
    const profileCompletenessScore = 5; // Placeholder
    const audienceRelevanceScore = 5; // Placeholder
    const engagementRateScore = clamp10(engagementRatePct >= 20 ? 10 : engagementRatePct >= 10 ? 7 : engagementRatePct > 0 ? 5 : 2);
    const mutualInteractionsScore = clamp10(totalEngagements >= 20 ? 10 : totalEngagements >= 10 ? 7 : totalEngagements > 0 ? 5 : 2);
    const profileVisibilityScore = 5; // Placeholder
    const professionalBrandScore = 5; // Placeholder

    const scores = {
      profileCompleteness: profileCompletenessScore,
      postingActivity: postingActivityScore,
      engagementQuality: engagementQualityScore,
      networkGrowth: networkGrowthScore,
      audienceRelevance: audienceRelevanceScore,
      contentDiversity: contentDiversityScore,
      engagementRate: engagementRateScore,
      mutualInteractions: mutualInteractionsScore,
      profileVisibility: profileVisibilityScore,
      professionalBrand: professionalBrandScore
    };

    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 10;

    const result = {
      profileEvaluation: {
        scores,
        overallScore: Math.round(overallScore * 10) / 10,
        explanations: {
          profileCompleteness: "Profile completeness based on filled fields (requires Snapshot API)",
          postingActivity: "Posting frequency in the last 28 days from LinkedIn changelog",
          engagementQuality: "Average engagement (likes + comments) received per post",
          networkGrowth: "New connections and invitations in the last 28 days",
          audienceRelevance: "Industry diversity and professional connection quality (requires Snapshot API)",
          contentDiversity: "Variety in content types (text, images, videos, articles)",
          engagementRate: "Total engagement relative to posts",
          mutualInteractions: "Engagement you give to others (likes, comments)",
          profileVisibility: "Profile views and search appearances (requires Snapshot API)",
          professionalBrand: "Professional signals (requires Snapshot API)"
        }
      },
      summaryKPIs: {
        totalConnections: invitesCount, // This is just new connections, not total
        postsLast30Days: posts30d,
        engagementRate: `${engagementRatePct.toFixed(1)}%`,
        connectionsLast30Days: invitesCount
      },
      miniTrends: {
        posts: last7Days.map((day, index) => ({ 
          date: `Day ${index + 1}`, 
          value: day.posts 
        })),
        engagements: last7Days.map((day, index) => ({ 
          date: `Day ${index + 1}`, 
          value: day.engagements 
        }))
      },
      lastUpdated: new Date().toISOString(),
      _debug: {
        counts: { 
          posts: posts.length, 
          comments: comments.length, 
          likes: likes.length, 
          invitations: invitations.length, 
          messages: messages.length,
          totalEvents: events.length
        }
      }
    };

    console.log("Dashboard Data: Analysis complete", result._debug);

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