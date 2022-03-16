/* eslint-disable no-undef */
import {
  rgbRegex,
  hslRegex,
  hexRegex,
  hex3Regex,
  rgbToHex,
  hslToHex,
  hex3ToHex,
} from '../src/utils/color-conversion';

describe('Color Regexes', () => {
  describe('rgbRegex', () => {
    it('should match rgb value', () => {
      expect(rgbRegex.test('rgb(200, 12, 53)')).toEqual(true);

      const matchedParts = 'rgb(200, 12, 53)'.match(rgbRegex);
      expect(matchedParts[1]).toEqual('200');
      expect(matchedParts[2]).toEqual('12');
      expect(matchedParts[3]).toEqual('53');
    });

    it('should not match hsl value', () => {
      expect(rgbRegex.test('hsl(0, 100%, 50%)')).toEqual(false);
    });
  });

  describe('hslRegex', () => {
    it('should match hsl value', () => {
      expect(hslRegex.test('hsl(0, 100%, 50%)')).toEqual(true);

      const matchedParts = 'hsl(0, 100%, 50%)'.match(hslRegex);
      expect(matchedParts[1]).toEqual('0');
      expect(matchedParts[2]).toEqual('100');
      expect(matchedParts[3]).toEqual('50');
    });

    it('should not match rgb value', () => {
      expect(hslRegex.test('rgb(200, 12, 53)')).toEqual(false);
    });
  });

  describe('hexRegex', () => {
    it('should match hex value', () => {
      expect(hexRegex.test('#008000')).toEqual(true);

      const matchedParts = '#008000'.match(hexRegex);
      expect(matchedParts[1]).toEqual('008000');
    });

    it('should not match rgb value', () => {
      expect(hexRegex.test('rgb(200, 12, 53)')).toEqual(false);
    });
  });

  describe('hex3Regex', () => {
    it('should match hex3 value', () => {
      expect(hex3Regex.test('#00f')).toEqual(true);

      const matchedParts = '#00f'.match(hex3Regex);
      expect(matchedParts[1]).toEqual('0');
      expect(matchedParts[2]).toEqual('0');
      expect(matchedParts[3]).toEqual('f');
    });

    // TODO: fix hex3 regex
    it.skip('should not match hex value', () => {
      expect(hex3Regex.test('#008000')).toEqual(false);
    });
  });
});

describe('Color Conversion Methods', () => {
  describe('rgbToHex', () => {
    it('should rgb converted to hex value', () => {
      expect(rgbToHex(128, 0, 128)).toEqual('800080');
    });

    it('should rgb converted to hex value with zero padding', () => {
      expect(rgbToHex(10, 15, 25)).toEqualCaseInsensitive('0A0F19');
    });

    // TODO: fix rgbToHex to throw an error and skip color coding the element
    it.skip('should rgb to hex throw error for invalid inputs', () => {
      expect(rgbToHex('aa', 'bb', null)).toThrow();
    });
  });

  describe('hslToHex', () => {
    it('should hsl converted to hex value', () => {
      expect(hslToHex(0, 100, 50)).toEqualCaseInsensitive('ff0000');
    });

    it('should hsl converted to hex value with zero padding', () => {
      expect(hslToHex(3, 100, 50)).toEqualCaseInsensitive('ff0d00');
    });

    // TODO: fix hslToHex to throw an error and skip color coding the element
    it.skip('should hsl to hex throw error for invalid inputs', () => {
      expect(hslToHex('aa', 100, null)).toThrow();
    });
  });

  describe('hex3ToHex', () => {
    it('should hex3 converted to hex value', () => {
      expect(hex3ToHex(0, 'f', 'f')).toEqualCaseInsensitive('00ffff');
    });

    // TODO: fix hex3ToHex to throw an error and skip color coding the element
    it.skip('should hex3 to hex throw error for invalid inputs', () => {
      expect(hex3ToHex('aa', 100, null)).toThrow();
    });
  });
});
