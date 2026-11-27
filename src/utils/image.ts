import { imageSize } from 'image-size';

import { bytesToBase64 } from './base64';

/**
 * Downloads a remote image and returns its body base64-encoded.
 *
 * Matches the previous image-to-base64 behaviour: redirects are followed and
 * the response status is not checked.
 */
export const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  return bytesToBase64(new Uint8Array(await response.arrayBuffer()));
};

/**
 * Reads an image's pixel dimensions, or returns null if the data is not an
 * image format image-size understands (e.g. an HTML error page).
 */
export const measureImage = (bytes: Uint8Array): { width: number; height: number } | null => {
  try {
    const { width, height } = imageSize(bytes);
    return { width, height };
  } catch {
    return null;
  }
};
