// lib/linkedin.ts
const LI_REST = "https://api.linkedin.com/rest";

export async function liGet(path: string, token: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers);
  headers.set("Authorization", `Bearer ${token}`);
  
  // Changelog is versioned → header required
  if (path.startsWith("/memberChangeLogs")) {
    headers.set("LinkedIn-Version", "202312");
  }
  
  const res = await fetch(`${LI_REST}${path}`, { ...opts, headers });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`LinkedIn ${res.status}: ${t || "No body"}`);
  }
  return res.json();
}

export async function liPost(path: string, token: string, body: any, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Content-Type", "application/json");
  
  const res = await fetch(`${LI_REST}${path}`, { 
    ...opts, 
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`LinkedIn ${res.status}: ${t || "No body"}`);
  }
  return res.json();
}