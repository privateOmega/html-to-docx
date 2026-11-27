import { imageSize } from 'image-size';

import { bytesToBase64 } from './base64';

/**
 * MIME types for the image formats image-size detects, as mime-types maps the
 * matching file extensions. Formats without a registered type are not
 * embedded.
 */
const IMAGE_MIME_TYPES: Readonly<Record<string, string>> = {
  bmp: 'image/bmp',
  dds: 'image/vnd.ms-dds',
  gif: 'image/gif',
  heif: 'image/heif',
  ico: 'image/vnd.microsoft.icon',
  jp2: 'image/jp2',
  jpg: 'image/jpeg',
  jxl: 'image/jxl',
  ktx: 'image/ktx',
  png: 'image/png',
  pnm: 'image/x-portable-anymap',
  psd: 'image/vnd.adobe.photoshop',
  svg: 'image/svg+xml',
  tga: 'image/x-tga',
  tiff: 'image/tiff',
  webp: 'image/webp',
};

/**
 * Reads an image's pixel dimensions and format, or returns null if the data is
 * not an image format image-size understands (e.g. an HTML error page).
 */
export const measureImage = (
  bytes: Uint8Array,
): { width: number; height: number; type: string | undefined } | null => {
  try {
    const { width, height, type } = imageSize(bytes);
    return { width, height, type };
  } catch {
    return null;
  }
};

/**
 * Downloads a remote image and returns it as a base64 data URI whose MIME type
 * is detected from the image data (not the URL), so images served from URLs
 * without an image extension are typed correctly.
 *
 * Redirects are followed and the response status is not checked; data that is
 * not a supported image rejects, so callers skip the image.
 */
export const fetchImageAsDataUri = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const type = measureImage(bytes)?.type;
  const mimeType = type ? IMAGE_MIME_TYPES[type] : undefined;
  if (!mimeType) {
    throw new Error(`unsupported image data (${url})`);
  }
  // The space after the comma matches the data URIs built previously.
  return `data:${mimeType};base64, ${bytesToBase64(bytes)}`;
};
