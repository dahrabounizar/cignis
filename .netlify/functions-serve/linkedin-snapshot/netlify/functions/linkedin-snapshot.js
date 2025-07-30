var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/linkedin-snapshot.js
var linkedin_snapshot_exports = {};
__export(linkedin_snapshot_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(linkedin_snapshot_exports);
async function handler(event, context) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      }
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
      body: JSON.stringify({ error: "No authorization token" })
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
        "LinkedIn-Version": "202312"
      }
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
      firstSnapshotDataKeys: data.elements?.[0]?.snapshotData?.[0] ? Object.keys(data.elements[0].snapshotData[0]) : []
    });
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      },
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("LinkedIn Snapshot Function - Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        error: "Failed to fetch LinkedIn snapshot data",
        details: error.message
      })
    };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=linkedin-snapshot.js.map
