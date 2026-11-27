import { describe, expect, it } from 'vitest';

import HTMLtoDOCX from '../src/index';

// Current behaviour that is wrong but recorded so the safety net notices
// when it changes. When a fix lands, flip the assertion to the correct one.
describe('known bugs', () => {
  it('percentage width on a table cell throws (see PR #256)', async () => {
    await expect(
      HTMLtoDOCX('<table><tr><td style="width: 50%;">x</td><td>y</td></tr></table>'),
    ).rejects.toThrow('Invalid XML name: @w');
  });
});
