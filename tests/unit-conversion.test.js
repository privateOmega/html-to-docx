/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import {
  percentageRegex,
  pixelRegex,
  pointRegex,
  cmRegex,
  inchRegex,
  pixelToEMU,
  EMUToPixel,
  TWIPToEMU,
  EMUToTWIP,
  pointToTWIP,
  TWIPToPoint,
  pointToHIP,
  pixelToTWIP,
  TWIPToPixel,
  inchToPoint,
  inchToTWIP,
  cmToInch,
  cmToTWIP,
  pixelToPoint,
  pointToPixel,
  HIPToPoint,
  HIPToTWIP,
  TWIPToHIP,
  pixelToHIP,
  HIPToPixel,
  EIPToPoint,
  pointToEIP,
  pixelToEIP,
  EIPToPixel,
} from '../src/utils/unit-conversion';

describe('Unit Regexes', () => {
  describe('pixelRegex', () => {
    it('should pixel regex match px value', () => {
      expect(pixelRegex.test('20px')).toEqual(true);

      const matchedParts = '20px'.match(pixelRegex);
      expect(matchedParts[1]).toEqual('20');
    });

    it('should pixel regex not match pt value', () => {
      expect(pixelRegex.test('20pt')).toEqual(false);
    });
  });

  describe('percentageRegex', () => {
    it('should percentage regex match % value', () => {
      expect(percentageRegex.test('20%')).toEqual(true);

      const matchedParts = '20%'.match(percentageRegex);
      expect(matchedParts[1]).toEqual('20');
    });

    it('should percentage regex not match cm value', () => {
      expect(percentageRegex.test('100cm')).toEqual(false);
    });
  });

  describe('pointRegex', () => {
    it('should point regex match pt value', () => {
      expect(pointRegex.test('20pt')).toEqual(true);

      const matchedParts = '20pt'.match(pointRegex);
      expect(matchedParts[1]).toEqual('20');
    });

    it('should point regex not match cm value', () => {
      expect(pointRegex.test('100cm')).toEqual(false);
    });
  });

  describe('cmRegex', () => {
    it('should cm regex match cm value', () => {
      expect(cmRegex.test('20cm')).toEqual(true);

      const matchedParts = '20cm'.match(cmRegex);
      expect(matchedParts[1]).toEqual('20');
    });

    it('should cm regex not match px value', () => {
      expect(cmRegex.test('100px')).toEqual(false);
    });
  });

  describe('inchRegex', () => {
    it('should inch regex match inch value', () => {
      expect(inchRegex.test('20in')).toEqual(true);

      const matchedParts = '20in'.match(inchRegex);
      expect(matchedParts[1]).toEqual('20');
    });

    it('should inch regex not match px value', () => {
      expect(inchRegex.test('100px')).toEqual(false);
    });
  });
});

describe('Unit Conversion Methods', () => {
  describe('pixelToEMU', () => {
    it('should pixel be converted to equivalent emu', () => {
      expect(pixelToEMU(20)).toEqual(190500);
    });
  });

  describe('EMUToPixel', () => {
    it('should emu be converted to equivalent pixel', () => {
      expect(EMUToPixel(190500)).toEqual(20);
    });
  });

  describe('TWIPToEMU', () => {
    it('should twip be converted to equivalent emu', () => {
      expect(TWIPToEMU(1)).toEqual(635);
    });
  });

  describe('EMUToTWIP', () => {
    it('should emu be converted to equivalent twip', () => {
      expect(EMUToTWIP(635)).toEqual(1);
    });
  });

  describe('pointToTWIP', () => {
    it('should pixel be converted to equivalent twip', () => {
      expect(pointToTWIP(20)).toEqual(400);
    });
  });

  describe('TWIPToPoint', () => {
    it('should pixel be converted to equivalent emu', () => {
      expect(TWIPToPoint(20)).toEqual(1);
    });
  });

  describe('pointToHIP', () => {
    it('should point be converted to equivalent hip', () => {
      expect(pointToHIP(20)).toEqual(40);
    });
  });

  describe('HIPToPoint', () => {
    it('should hip be converted to equivalent point', () => {
      expect(HIPToPoint(20)).toEqual(10);
    });
  });

  describe('HIPToTWIP', () => {
    it('should hip be converted to equivalent twip', () => {
      expect(HIPToTWIP(40)).toEqual(400);
    });
  });

  describe('TWIPToHIP', () => {
    it('should twip be converted to equivalent hip', () => {
      expect(TWIPToHIP(400)).toEqual(40);
    });
  });

  describe('pixelToTWIP', () => {
    it('should pixel be converted to equivalent twip', () => {
      expect(pixelToTWIP(5)).toEqual(75);
    });
  });

  describe('TWIPToPixel', () => {
    it('should twip be converted to equivalent pixel', () => {
      expect(TWIPToPixel(75)).toEqual(5);
    });
  });

  describe('pixelToHIP', () => {
    it('should pixel be converted to equivalent hip', () => {
      expect(pixelToHIP(1)).toEqual(1.5);
    });
  });

  describe('HIPToPixel', () => {
    it('should hip be converted to equivalent pixel', () => {
      expect(HIPToPixel(1.5)).toEqual(1);
    });
  });

  describe('inchToPoint', () => {
    it('should inch be converted to equivalent point', () => {
      expect(inchToPoint(2.5)).toEqual(180);
    });
  });

  describe('inchToTWIP', () => {
    it('should inch be converted to equivalent twip', () => {
      expect(inchToTWIP(3)).toEqual(4320);
    });
  });

  describe('cmToInch', () => {
    it('should cm be converted to equivalent inch', () => {
      expect(cmToInch(20)).toBeCloseTo(7.87);
    });
  });

  describe('cmToTWIP', () => {
    it('should cm be converted to equivalent twip', () => {
      expect(cmToTWIP(1)).toBeCloseTo(567, 0);
    });
  });

  describe('pixelToPoint', () => {
    it('should pixel be converted to equivalent point', () => {
      expect(pixelToPoint(20)).toEqual(15);
    });
  });

  describe('pointToPixel', () => {
    it('should point be converted to equivalent pixel', () => {
      expect(pointToPixel(20)).toBeCloseTo(26.67, 0);
    });
  });

  describe('EIPToPoint', () => {
    it('should eip be converted to equivalent point', () => {
      expect(EIPToPoint(8)).toEqual(1);
    });
  });

  describe('pointToEIP', () => {
    it('should point be converted to equivalent eip', () => {
      expect(pointToEIP(1)).toEqual(8);
    });
  });

  describe('pixelToEIP', () => {
    it('should pixel be converted to equivalent eip', () => {
      expect(pixelToEIP(1)).toEqual(6);
    });
  });

  describe('EIPToPixel', () => {
    it('should eip be converted to equivalent pixel', () => {
      expect(EIPToPixel(6)).toEqual(1);
    });
  });
});
