// Base64 helpers that work without Node's Buffer, so the library runs in
// browsers without a polyfill.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const CODES = new Int16Array(128).fill(-1);
for (let index = 0; index < ALPHABET.length; index += 1) {
  CODES[ALPHABET.charCodeAt(index)] = index;
}
// URL-safe alphabet, accepted like Buffer.from(..., 'base64') does.
CODES['-'.charCodeAt(0)] = 62;
CODES['_'.charCodeAt(0)] = 63;
const PADDING = '='.charCodeAt(0);

/**
 * Decodes base64 with the same leniency as `Buffer.from(input, 'base64')`:
 * whitespace and other non-alphabet characters are skipped, the URL-safe
 * alphabet is accepted, and decoding stops at the first `=`.
 */
export const base64ToBytes = (input: string): Uint8Array => {
  const bytes = new Uint8Array(Math.floor((input.length * 3) / 4) + 3);
  let length = 0;
  let accumulator = 0;
  let bits = 0;
  for (let index = 0; index < input.length; index += 1) {
    const charCode = input.charCodeAt(index);
    if (charCode === PADDING) break;
    const value = charCode < 128 ? CODES[charCode]! : -1;
    if (value >= 0) {
      accumulator = ((accumulator << 6) | value) & 0xffffff;
      bits += 6;
      if (bits >= 8) {
        bits -= 8;
        bytes[length] = (accumulator >> bits) & 0xff;
        length += 1;
      }
    }
  }
  return bytes.subarray(0, length);
};

/** Encodes bytes as standard (padded) base64, like `buffer.toString('base64')`. */
export const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
};
