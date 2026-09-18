/**
 * Formats and cleans product image URLs to ensure safe, HTTPS-compliant rendering on Vercel
 * and properly encodes filenames with special characters (like hashes, spaces, commas).
 */
export function formatImageUrl(url) {
  if (!url || typeof url !== "string") {
    return "https://placehold.co/600x400/e2e8f0/64748b?text=Murakaza";
  }

  let clean = url.trim();

  // If already a Data URI or Blob, return directly
  if (clean.startsWith("data:") || clean.startsWith("blob:")) {
    return clean;
  }

  // Force HTTPS for Render host or non-localhost origins to prevent Mixed Content blocking on Vercel
  if (clean.includes("onrender.com") || (!clean.includes("localhost") && !clean.includes("127.0.0.1"))) {
    clean = clean.replace(/^http:\/\//i, "https://");
  }

  // If the URL points to an uploads path, safely encode the filename portion so special characters (#, spaces) don't break HTTP requests
  const uploadsIdx = clean.indexOf("/uploads/");
  if (uploadsIdx !== -1) {
    const base = clean.slice(0, uploadsIdx + 9);
    const rawFilename = clean.slice(uploadsIdx + 9);
    try {
      // Decode first in case partially encoded, then encode
      const decoded = decodeURIComponent(rawFilename);
      clean = base + encodeURIComponent(decoded);
    } catch {
      clean = base + encodeURIComponent(rawFilename);
    }
  }

  return clean;
}
