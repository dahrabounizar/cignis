// lib/changelog.ts
import { liGet } from "./linkedin";

export type Event = {
  resourceName: string;
  method: string;
  capturedAt?: number;
  processedAt?: number;
  activity?: any;
  processedActivity?: any;
  owner?: string;
  actor?: string;
  resourceId?: string;
};

export async function fetchChangelogWindow(
  token: string,
  sinceMs?: number,
  count = 10
): Promise<Event[]> {
  // count must be 1..50; outside → 400 per PDF
  const safeCount = Math.min(50, Math.max(1, count));
  const qs = new URLSearchParams({ 
    q: "memberAndApplication", 
    count: String(safeCount) 
  });
  
  if (sinceMs) {
    qs.set("startTime", String(sinceMs));
  }
  
  const data = await liGet(`/memberChangeLogs?${qs.toString()}`, token);
  return data.elements || [];
}

export async function fetchLast28DaysChangelog(token: string): Promise<Event[]> {
  const now = Date.now();
  const twentyEightDaysAgo = now - 28 * 24 * 3600 * 1000;
  
  return await fetchChangelogWindow(token, twentyEightDaysAgo, 50);
}

export function groupEventsByResourceName(events: Event[]) {
  const groups: Record<string, Event[]> = {};
  
  for (const event of events) {
    if (!groups[event.resourceName]) {
      groups[event.resourceName] = [];
    }
    groups[event.resourceName].push(event);
  }
  
  return groups;
}

export function getWeekFromTimestamp(ms?: number): string {
  if (!ms) return "unknown";
  const d = new Date(ms);
  // Simple week key; replace with date-fns if needed
  const firstJan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d as any) - (firstJan as any)) / 86400000 + firstJan.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}