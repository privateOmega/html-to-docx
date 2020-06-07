export const pixelRegex = /([\d.]+)px/i;
export const percentageRegex = /([\d.]+)%/i;
export const pointRegex = /(\d+)pt/i;

export const pixelToEMU = (pixelValue) => {
  return Math.round(pixelValue * 9525);
};

export const EMUToPixel = (EMUValue) => {
  return Math.round(EMUValue / 9525);
};

export const TWIPToEMU = (TWIPValue) => {
  return Math.round(TWIPValue * 635);
};

export const EMUToTWIP = (EMUValue) => {
  return Math.round(EMUValue / 635);
};

export const pointToTWIP = (pointValue) => {
  return Math.round(pointValue * 20);
};

export const TWIPToPoint = (TWIPValue) => {
  return Math.round(TWIPValue / 20);
};

export const pointToHIP = (pointValue) => {
  return Math.round(pointValue * 2);
};

export const HIPToPoint = (HIPValue) => {
  return Math.round(HIPValue / 2);
};

export const HIPToTWIP = (HIPValue) => {
  return Math.round(HIPValue * 10);
};

export const TWIPToHIP = (TWIPValue) => {
  return Math.round(TWIPValue / 10);
};

export const pixelToTWIP = (pixelValue) => {
  return EMUToTWIP(pixelToEMU(pixelValue));
};

export const TWIPToPixel = (TWIPValue) => {
  return EMUToPixel(TWIPToEMU(TWIPValue));
};

export const pixelToHIP = (pixelValue) => {
  return TWIPToHIP(EMUToTWIP(pixelToEMU(pixelValue)));
};

export const HIPToPixel = (HIPValue) => {
  return EMUToPixel(TWIPToEMU(HIPToTWIP(HIPValue)));
};
