/**
 * Returns a random 128-bit identifier as 32 hex characters, used to name
 * embedded media files. Uses crypto.getRandomValues, which (unlike
 * crypto.randomUUID) is also available in browsers outside secure contexts.
 */
export const randomId = (): string =>
  Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
