/* eslint-disable no-param-reassign */

export const rgbRegex = /rgb\((\d+),\s*([\d.]+),\s*([\d.]+)\)/i;
export const hslRegex = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/i;
export const hexRegex = /#([0-9A-F]{6})/i;
export const hex3Regex = /#([0-9A-F])([0-9A-F])([0-9A-F])/i;

export type RGBComponent = string | number

export const rgbToHex = (red: RGBComponent, green: RGBComponent, blue: RGBComponent) => {
  const hexColorCode = [red, green, blue]
    .map((x) => {
      x = parseInt(<string>x).toString(16);
      return x.length === 1 ? `0${x}` : x;
    })
    .join('');

  return hexColorCode;
};

export const hslToHex = (hue, saturation, luminosity) => {
  hue /= 360;
  saturation /= 100;
  luminosity /= 100;
  // eslint-disable-next-line one-var
  let red, green, blue;
  if (saturation === 0) {
    // eslint-disable-next-line no-multi-assign
    red = green = blue = luminosity; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q =
      luminosity < 0.5
        ? luminosity * (1 + saturation)
        : luminosity + saturation - luminosity * saturation;
    const p = 2 * luminosity - q;
    red = hue2rgb(p, q, hue + 1 / 3);
    green = hue2rgb(p, q, hue);
    blue = hue2rgb(p, q, hue - 1 / 3);
  }
  return [red, green, blue]
    .map((x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join('');
};

export const hex3ToHex = (red: string, green: string, blue: string) => {
  const hexColorCode = [red, green, blue].map((x) => `${x}${x}`).join('');

  return hexColorCode;
};
