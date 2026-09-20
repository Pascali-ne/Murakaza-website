/**
 * Converts a selected image file to an optimized, lightweight base64 Data URL.
 * Because the data URL is stored directly in PostgreSQL (Neon DB), it is 100%
 * permanent and will NEVER be deleted or lost across Git commits or Render redeploys.
 */
export async function fileToDataUrl(file, maxWidth = 800, maxHeight = 800, quality = 0.82) {
  if (!file) return "";

  // If video, read as standard Data URL directly
  if (file.type && file.type.startsWith("video/")) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // If GIF or SVG, preserve original frames/vector
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // For photos (JPEG, PNG, WebP), resize and compress via Canvas to ~30KB - 70KB
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL("image/webp", quality);
          resolve(dataUrl);
        } catch {
          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        // Fallback to raw data url if canvas fails
        resolve(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
