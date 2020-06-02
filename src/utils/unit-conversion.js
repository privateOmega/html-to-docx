export const pixelRegex = /([\d.]+)px/i;
export const percentageRegex = /([\d.]+)%/i;

export const pixelsToEMU = (pixelValue) => {
  return Math.round(pixelValue * 9525);
};

export const EMUToPixels = (EMUValue) => {
  return Math.round(EMUValue / 9525);
};

export const TWIPToEMU = (TWIPValue) => {
  return Math.round(TWIPValue * 635);
};

export const EMUToTWIP = (EMUValue) => {
  return Math.round(EMUValue / 635);
};
