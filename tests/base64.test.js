import { describe, expect, it } from 'vitest';

import { base64ToBytes, bytesToBase64 } from '../src/utils/base64';

// Deterministic PRNG (mulberry32) so failures are reproducible.
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

describe('base64 helpers match Buffer', () => {
  it('base64ToBytes decodes like Buffer.from(input, "base64")', () => {
    const random = rng(1);
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/-_= \n\t*%.é';
    for (let run = 0; run < 20000; run += 1) {
      const length = Math.floor(random() * 32);
      let input = '';
      for (let index = 0; index < length; index += 1) {
        input += alphabet[Math.floor(random() * (random() < 0.8 ? 64 : alphabet.length))];
      }
      expect(Buffer.from(base64ToBytes(input))).toEqual(Buffer.from(input, 'base64'));
    }
  });

  it('bytesToBase64 encodes like buffer.toString("base64")', () => {
    const random = rng(2);
    for (let run = 0; run < 2000; run += 1) {
      const bytes = Uint8Array.from({ length: Math.floor(random() * 100) }, () =>
        Math.floor(random() * 256),
      );
      expect(bytesToBase64(bytes)).toBe(Buffer.from(bytes).toString('base64'));
    }
    const large = Uint8Array.from({ length: 200000 }, (_, index) => index % 256);
    expect(bytesToBase64(large)).toBe(Buffer.from(large).toString('base64'));
  });

  it('round-trips data-URI content with a leading space', () => {
    const png =
      'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
    expect(bytesToBase64(base64ToBytes(` ${png}`))).toBe(png);
  });
});
