const MAX_EDGE = 1600;
const WEBP_QUALITY = 0.8;

/**
 * Resizes an image file on the client so its longest edge is at most 1600px
 * and converts it to WebP (~0.8 quality) before uploading from mobile.
 */
export async function resizeImageToWebP(file: File): Promise<File> {
  if (typeof window === "undefined") return file;

  const bitmap = await loadImageSource(file);
  const { width, height } = bitmap;

  let targetWidth = width;
  let targetHeight = height;

  if (width > MAX_EDGE || height > MAX_EDGE) {
    if (width >= height) {
      targetWidth = MAX_EDGE;
      targetHeight = Math.max(1, Math.round((height * MAX_EDGE) / width));
    } else {
      targetHeight = MAX_EDGE;
      targetWidth = Math.max(1, Math.round((width * MAX_EDGE) / height));
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  ctx.drawImage(bitmap.source, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY);
  });

  if (!blob) return file;

  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

type LoadedSource = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

async function loadImageSource(file: File): Promise<LoadedSource> {
  if ("createImageBitmap" in window) {
    try {
      const bmp = await createImageBitmap(file);
      return {
        source: bmp,
        width: bmp.width,
        height: bmp.height,
        close: () => bmp.close(),
      };
    } catch {
      // Fall back to HTMLImageElement below.
    }
  }

  const url = URL.createObjectURL(file);
  return new Promise<LoadedSource>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        close: () => URL.revokeObjectURL(url),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not decode image"));
    };
    img.src = url;
  });
}

