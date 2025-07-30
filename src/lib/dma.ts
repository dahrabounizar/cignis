// lib/dma.ts
import { liGet, liPost } from "./linkedin";

export async function ensureDmaEnabled(token: string) {
  try {
    const finder = await liGet("/memberAuthorizations?q=memberAndApplication", token);
    const enabled = Array.isArray(finder.elements) && finder.elements.length > 0;
    
    // Check if any element has regulatedAt indicating DMA consent
    if (enabled) {
      const hasRegulatedAt = finder.elements.some((auth: any) => auth.regulatedAt);
      return hasRegulatedAt;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking DMA enablement:", error);
    return false;
  }
}

// Optionally enable archiving for the user if needed (empty JSON body)
export async function enableDma(token: string) {
  try {
    await liPost("/memberAuthorizations", token, {});
    return true;
  } catch (error) {
    console.error("Error enabling DMA:", error);
    throw new Error(`Enable DMA failed: ${error.message}`);
  }
}