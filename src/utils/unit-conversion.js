export const pixelRegex = /([\d.]+)px/i;
export const percentageRegex = /([\d.]+)%/i;
export const pointRegex = /(\d+)pt/i;

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

export const pointsToTWIP = (pointValue) => {
  return Math.round(pointValue * 20);
};

export const TWIPToPoints = (TWIPValue) => {
  return Math.round(TWIPValue / 20);
};

export const pointsToHIP = (pointValue) => {
  return Math.round(pointValue * 2);
};

export const HIPToPoints = (HIPValue) => {
  return Math.round(HIPValue / 2);
};

export const HIPToTWIP = (HIPValue) => {
  return Math.round(HIPValue * 10);
};

export const TWIPToHIP = (TWIPValue) => {
  return Math.round(TWIPValue / 10);
};
