import { describe, expect, it } from 'vitest';

import { base64DataUriPayload, isValidUrl } from '../src/utils/url';

describe('isValidUrl', () => {
  it('accepts absolute http(s) URLs', () => {
    expect(isValidUrl('https://example.com/a.png')).toBe(true);
    expect(isValidUrl('http://localhost:3000/a.png')).toBe(true);
    expect(isValidUrl('HTTPS://EXAMPLE.COM/A.PNG')).toBe(true);
  });

  it('rejects everything else', () => {
    for (const value of [
      '/media/a.png',
      'images/a.png',
      '//cdn.example.com/a.png',
      'data:image/png;base64,AAAA',
      'ftp://example.com/a.png',
      'not a url',
      '',
      undefined,
      null,
    ]) {
      expect(isValidUrl(value)).toBe(false);
    }
  });

  // #179, #208: lookbehind assertions are a syntax error in Safari < 16.4,
  // which broke the whole bundle there.
  it('does not use lookbehind', () => {
    expect(isValidUrl.toString()).not.toMatch(/\(\?<[=!]/);
  });
});

describe('base64DataUriPayload', () => {
  it('returns the payload of a base64 data URI', () => {
    expect(base64DataUriPayload('data:image/png;base64,AAAA')).toBe('AAAA');
    expect(base64DataUriPayload('data:image/svg+xml;base64,PHN2Zy8+')).toBe('PHN2Zy8+');
  });

  it('returns null for anything else', () => {
    for (const value of ['data:image/svg+xml;utf8,<svg/>', '/a.png', '', undefined]) {
      expect(base64DataUriPayload(value)).toBeNull();
    }
  });
});
