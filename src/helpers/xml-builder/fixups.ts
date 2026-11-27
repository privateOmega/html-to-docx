/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
import colorNames from 'color-name';
import {
  rgbToHex,
  hslToHex,
  hslRegex,
  rgbRegex,
  hexRegex,
  hex3Regex,
  hex3ToHex,
} from '../../utils/color-conversion';
import {
  pixelRegex,
  pointRegex,
  pointToHIP,
  HIPToTWIP,
  pointToTWIP,
  pixelToHIP,
  pixelToTWIP,
  pixelToEIP,
  pointToEIP,
  cmToTWIP,
  cmRegex,
  inchRegex,
  inchToTWIP,
} from '../../utils/unit-conversion';

// eslint-disable-next-line consistent-return
export const fixupColorCode = (colorCodeString: string) => {
  if (Object.prototype.hasOwnProperty.call(colorNames, colorCodeString.toLowerCase())) {
    const [red, green, blue] = (colorNames as Record<string, number[]>)[
      colorCodeString.toLowerCase()
    ]!;

    return rgbToHex(red, green, blue);
  } else if (rgbRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(rgbRegex);
    const red = matchedParts![1];
    const green = matchedParts![2];
    const blue = matchedParts![3];

    return rgbToHex(red, green, blue);
  } else if (hslRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hslRegex);
    const hue = matchedParts![1];
    const saturation = matchedParts![2];
    const luminosity = matchedParts![3];

    return hslToHex(hue, saturation, luminosity);
  } else if (hexRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hexRegex);

    return matchedParts![1];
  } else if (hex3Regex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hex3Regex);
    const red = matchedParts![1];
    const green = matchedParts![2];
    const blue = matchedParts![3];

    return hex3ToHex(red, green, blue);
  } else {
    return '000000';
  }
};

// eslint-disable-next-line consistent-return
export const fixupLineHeight = (lineHeight: number | string, fontSize?: number | null) => {
  // FIXME: If line height is anything other than a number
  // eslint-disable-next-line no-restricted-globals
  if (!isNaN(lineHeight as number)) {
    if (fontSize) {
      const actualLineHeight = +lineHeight * fontSize;

      return HIPToTWIP(actualLineHeight);
    } else {
      // 240 TWIP or 12 point is default line height
      return +lineHeight * 240;
    }
  } else {
    // 240 TWIP or 12 point is default line height
    return 240;
  }
};

// eslint-disable-next-line consistent-return
export const fixupFontSize = (fontSizeString: string) => {
  if (pointRegex.test(fontSizeString)) {
    const matchedParts = fontSizeString.match(pointRegex);
    // convert point to half point
    return pointToHIP(Number(matchedParts![1]));
  } else if (pixelRegex.test(fontSizeString)) {
    const matchedParts = fontSizeString.match(pixelRegex);
    // convert pixels to half point
    return pixelToHIP(Number(matchedParts![1]));
  }
};

// eslint-disable-next-line consistent-return
export const fixupRowHeight = (rowHeightString: string) => {
  if (pointRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(pointRegex);
    // convert point to half point
    return pointToTWIP(Number(matchedParts![1]));
  } else if (pixelRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(pixelRegex);
    // convert pixels to half point
    return pixelToTWIP(Number(matchedParts![1]));
  } else if (cmRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(cmRegex);
    return cmToTWIP(Number(matchedParts![1]));
  } else if (inchRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(inchRegex);
    return inchToTWIP(Number(matchedParts![1]));
  }
};

// eslint-disable-next-line consistent-return
export const fixupColumnWidth = (columnWidth: number | string) => {
  // RegExp#test stringifies its argument; numbers never match a unit.
  const columnWidthString = String(columnWidth);
  if (pointRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(pointRegex);
    return pointToTWIP(Number(matchedParts![1]));
  } else if (pixelRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(pixelRegex);
    return pixelToTWIP(Number(matchedParts![1]));
  } else if (cmRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(cmRegex);
    return cmToTWIP(Number(matchedParts![1]));
  } else if (inchRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(inchRegex);
    return inchToTWIP(Number(matchedParts![1]));
  }
};

// eslint-disable-next-line consistent-return
export const fixupMargin = (marginString: string) => {
  if (pointRegex.test(marginString)) {
    const matchedParts = marginString.match(pointRegex);
    // convert point to half point
    return pointToTWIP(Number(matchedParts![1]));
  } else if (pixelRegex.test(marginString)) {
    const matchedParts = marginString.match(pixelRegex);
    // convert pixels to half point
    return pixelToTWIP(Number(matchedParts![1]));
  }
};

export const cssBorderParser = (
  borderString: string,
): [number | string | undefined, string, string | undefined] => {
  const trimmed = String(borderString).trim();
  if (trimmed === 'none' || trimmed === '0') {
    return [0, 'none', undefined];
  }
  let [size, stroke, color]: (number | string | undefined)[] = trimmed.split(/\s+/);

  if (pointRegex.test(size as string)) {
    const matchedParts = (size as string).match(pointRegex);
    // convert point to eighth of a point
    size = pointToEIP(Number(matchedParts![1]));
  } else if (pixelRegex.test(size as string)) {
    const matchedParts = (size as string).match(pixelRegex);
    // convert pixels to eighth of a point
    size = pixelToEIP(Number(matchedParts![1]));
  } else if (/^\d+(?:\.\d+)?$/.test(size as string)) {
    size = pixelToEIP(Number(size));
  }
  stroke = stroke && ['dashed', 'dotted', 'double', 'none'].includes(stroke as string) ? stroke : 'single';

  color = color && fixupColorCode(color as string).toUpperCase();

  return [size, stroke as string, color as string | undefined];
};
