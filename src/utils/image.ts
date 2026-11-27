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
