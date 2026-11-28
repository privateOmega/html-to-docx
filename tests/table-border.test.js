import { describe, it, expect } from 'vitest';
import { cssBorderParser } from '../src/helpers/xml-builder/fixups';
import { fixupTableCellBorder } from '../src/helpers/xml-builder/table';

describe('table border CSS parsing (#52)', () => {
  it('parses unit-less 0 and none as zero-width border', () => {
    expect(cssBorderParser('0')).toEqual([0, 'none', undefined]);
    expect(cssBorderParser('none')).toEqual([0, 'none', undefined]);
    expect(cssBorderParser('0px')).toEqual([0, 'single', undefined]);
  });

  it('parses unit-less numeric border sizes as pixels', () => {
    expect(cssBorderParser('2 solid #ff0000')).toEqual([cssBorderParser('2px solid #ff0000')[0], 'single', 'FF0000']);
  });

  it('treats border: "0" on table cells the same as border: 0 and "none"', () => {
    const attrs = { tableCellBorder: { top: 4 } };
    fixupTableCellBorder({ properties: { style: { border: '0' } } }, attrs);
    expect(attrs.tableCellBorder).toEqual({});
  });
});
