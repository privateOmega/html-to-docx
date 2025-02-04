import it from 'node:test';
import assert from 'assert';
import { extractBase64Data } from '../src/utils/base64.js';

it('extracts file infos from a base64 data URL of a PNG', async () => {
  const dataStr =
    'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI1' +
    '2P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
  const fileObj = extractBase64Data(`data:image/png;base64,${dataStr}`);
  assert.deepEqual(fileObj, {
    type: 'image',
    extension: 'png',
    data: dataStr,
  });
});

it('extracts file infos from a base64 data URL of an SVG', async () => {
  const dataStr = 'PHN2Zz4KICA8Y2lyY2xlIHI9IjUwIiBmaWxsPSJyZWQiLz4KPC9zdmc+';
  const fileObj = extractBase64Data(`data:image/svg+xml;base64,${dataStr}`);
  assert.deepEqual(fileObj, {
    type: 'image',
    extension: 'svg+xml',
    data: dataStr,
  });
});

it('extracts file infos from a simple data URL of an SVG', async () => {
  const dataStr =
    "%3Csvg xmlns='http://www.w3.org/2000/svg'" + "%3E%3Ccircle r='50' fill='red'/%3E%3C/svg%3E";
  const fileObj = extractBase64Data(`data:image/svg+xml,${dataStr}`);
  assert.deepEqual(fileObj, {
    type: 'image',
    extension: 'svg+xml',
    data: dataStr,
  });
});

it('extracts file infos from an UTF-8 data URL of an SVG', async () => {
  const dataStr =
    "%3Csvg xmlns='http://www.w3.org/2000/svg'" + "%3E%3Ccircle r='50' fill='red'/%3E%3C/svg%3E";
  const fileObj = extractBase64Data(`data:image/svg+xml;utf8,${dataStr}`);
  assert.deepEqual(fileObj, {
    type: 'image',
    extension: 'svg+xml',
    data: dataStr,
  });
});
