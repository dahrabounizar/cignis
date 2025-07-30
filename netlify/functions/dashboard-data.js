// netlify/functions/dashboard-data.js
// CommonJS Netlify Function to provide Dashboard data from LinkedIn DMA Changelog API

// If your Node runtime is 18+, you can use global fetch and remove node-fetch.
// If not sure, keep the fallback require:
let _fetch = typeof fetch !== "undefined" ? fetch : undefined;
if (!_fetch) {
  try {
    _fetch = require("node-fetch");
  } catch (e) {
    // If node-fetch is not installed and runtime provides fetch, ignore
  }
}
const doFetch = (...args) => (_fetch || fetch)(...args);

const LI_BASE = "https://api.linkedin.com/rest";

function jsonResponse(statusCode, data, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...extraHeaders,
    },
    body: JSON.stringify(data),
  };
}

async function liGet(path, token, extraHeaders = {}) {
  const url = `${LI_BASE}${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
  // Changelog is versioned; per docs use LinkedIn-Version: 202312
  if (path.startsWith("/memberChangeLogs")) {
    headers["LinkedIn-Version"] = "202312";
  }
  const res = await doFetch(url, { headers });
  const text = await res.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // leave payload as null
  }
  if (!res.ok) {
    const errBody = payload || text || "No body";
    const err = new Error(`LinkedIn ${res.status}: ${typeof errBody === "string" ? errBody : JSON.stringify(errBody)}`);
    err.status = res.status;
    err.body = errBody;
    throw err;
  }
  return payload;
}

async function ensureDmaEnabled(token) {
  const data = await liGet("/memberAuthorizations?q=memberAndApplication", token);
  const enabled = Array.isArray(data?.elements) && data.elements.length > 0;
  return { enabled, data };
}

exports.handler = async (event, context) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return jsonResponse(204, {});
    }

    // 1) Read token from server env or secret manager (NEVER from client)
    const token = process.env.LINKEDIN_DMA_TOKEN || process.env.LINKEDIN_TOKEN;
    if (!token) {
      return jsonResponse(500, { error: "Missing LinkedIn DMA token in server environment" });
    }

    // 2) Verify DMA is enabled for this member (prevents empty streams)
    const auth = await ensureDmaEnabled(token);
    if (!auth.enabled) {
      return jsonResponse(428, { error: "DMA not enabled for this member/app pair", details: auth.data });
    }

    // 3) Fetch last 28 days from Member Changelog
    const now = Date.now();
    const twentyEightDaysAgo = now - 28 * 24 * 3600 * 1000;
    const params = new URLSearchParams({ q: "memberAndApplication", count: "50", startTime: String(twentyEightDaysAgo) });
    const changes = await liGet(`/memberChangeLogs?${params.toString()}`, token);

    const elements = Array.isArray(changes?.elements) ? changes.elements : [];

    // 4) Split by resourceName
    const posts = elements.filter(e => e.resourceName === "ugcPosts");
    const comments = elements.filter(e => e.resourceName === "socialActions/comments");
    const likes = elements.filter(e => e.resourceName === "socialActions/likes");
    const invitations = elements.filter(e => e.resourceName === "invitations");
    const messages = elements.filter(e => e.resourceName === "messages");

    // 5) Compute dashboard metrics (no more zeros if there is data)
    const posts30d = posts.length;
    const totalComments = comments.length;
    const totalLikes = likes.length;
    const totalEngagements = totalLikes + totalComments;

    const engagementPerPost = posts30d > 0 ? totalEngagements / posts30d : 0;
    const engagementRatePct = posts30d > 0 ? (totalEngagements / posts30d) * 100 : 0;

    // Content diversity by shareMediaCategory
    const byType = { NONE: 0, ARTICLE: 0, VIDEO: 0, IMAGE: 0, URN_REFERENCE: 0, OTHER: 0 };
    for (const p of posts) {
      const sc = p.activity?.specificContent?.["com.linkedin.ugc.ShareContent"];
      const cat = sc?.shareMediaCategory || "OTHER";
      if (byType[cat] === undefined) byType.OTHER++;
      else byType[cat]++;
    }

    const invitesCount = invitations.length;

    // Simple /10 scores (high-level; adjust later)
    const clamp10 = (x) => Math.max(0, Math.min(10, x));
    const postingActivity = clamp10(posts30d >= 8 ? 10 : posts30d >= 4 ? 7 : posts30d > 0 ? 5 : 2);
    const engagementQuality = clamp10(engagementPerPost >= 10 ? 10 : engagementPerPost >= 5 ? 7 : engagementPerPost > 0 ? 5 : 2);
    const kinds = Object.values(byType).filter(v => v > 0).length;
    const contentDiversity = clamp10(kinds >= 4 ? 10 : kinds === 3 ? 8 : kinds === 2 ? 6 : kinds === 1 ? 4 : 2);
    const networkGrowth = clamp10(invitesCount >= 20 ? 10 : invitesCount >= 10 ? 7 : invitesCount > 0 ? 5 : 2);

    // Weekly trends (group by year-week, using capturedAt or processedAt)
    const toWeek = (ms) => {
      if (!ms) return "unknown";
      const d = new Date(ms);
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const dayMs = 24 * 3600 * 1000;
      const pastDays = Math.floor((d - jan1) / dayMs);
      const week = Math.ceil((pastDays + jan1.getDay() + 1) / 7);
      return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    };
    const weeklyPosts = {};
    for (const p of posts) {
      const wk = toWeek(p.capturedAt || p.processedAt);
      weeklyPosts[wk] = (weeklyPosts[wk] || 0) + 1;
    }
    const weeklyEngagements = {};
    for (const a of [...comments, ...likes]) {
      const wk = toWeek(a.capturedAt || a.processedAt);
      weeklyEngagements[wk] = (weeklyEngagements[wk] || 0) + 1;
    }

    // Return payload expected by your Dashboard
    return jsonResponse(200, {
      scores: {
        postingActivity,
        engagementQuality,
        contentDiversity,
        networkGrowth
      },
      summary: {
        posts30d,
        totalEngagements,
        engagementRatePct,
        newConnections28d: invitesCount
      },
      trends: {
        weeklyPosts,
        weeklyEngagements
      },
      debugCounts: {
        posts: posts.length,
        comments: comments.length,
        likes: likes.length,
        invitations: invitations.length,
        messages: messages.length
      }
    });
  } catch (err) {
    // Log full error (visible in Netlify function logs)
    console.error("dashboard-data error:", err && err.stack ? err.stack : err);
    const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
    return jsonResponse(status, {
      error: String(err?.message || err),
      upstream: err?.body || null
    });
  }
};