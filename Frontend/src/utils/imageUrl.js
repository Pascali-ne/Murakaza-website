/**
 * Formats and cleans product image URLs to ensure safe, HTTPS-compliant rendering on Vercel
 * and properly encodes filenames with special characters (like hashes, spaces, commas).
 */
export function formatImageUrl(url) {
  if (!url || typeof url !== "string") {
    return "";
  }

  let clean = url.trim();
  if (!clean) return "";

  // If already a Data URI or Blob, return directly
  if (clean.startsWith("data:") || clean.startsWith("blob:")) {
    return clean;
  }

  // Force HTTPS for Render host to prevent Mixed Content blocking on Vercel
  if (clean.includes("onrender.com")) {
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

/**
 * Detects if a URL points to a video file format.
 */
export function isVideoUrl(url) {
  if (!url || typeof url !== "string") return false;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".m4v") ||
    clean.includes("video/mp4")
  );
}
