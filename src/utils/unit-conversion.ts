export const pixelRegex = /([\d.]+)px/i;
export const percentageRegex = /([\d.]+)%/i;
export const pointRegex = /([\d.]+)pt/i;
export const cmRegex = /([\d.]+)cm/i;
export const inchRegex = /([\d.]+)in/i;

export const pixelToEMU = (pixelValue: number) => Math.round(pixelValue * 9525);

export const EMUToPixel = (EMUValue: number) => Math.round(EMUValue / 9525);

export const TWIPToEMU = (TWIPValue: number) => Math.round(TWIPValue * 635);

export const EMUToTWIP = (EMUValue: number) => Math.round(EMUValue / 635);

export const pointToTWIP = (pointValue: number) => Math.round(pointValue * 20);

export const TWIPToPoint = (TWIPValue: number) => Math.round(TWIPValue / 20);

export const pointToHIP = (pointValue: number) => Math.round(pointValue * 2);

export const HIPToPoint = (HIPValue: number) => Math.round(HIPValue / 2);

export const HIPToTWIP = (HIPValue: number) => Math.round(HIPValue * 10);

export const TWIPToHIP = (TWIPValue: number) => Math.round(TWIPValue / 10);

export const pixelToTWIP = (pixelValue: number) => EMUToTWIP(pixelToEMU(pixelValue));

export const TWIPToPixel = (TWIPValue: number) => EMUToPixel(TWIPToEMU(TWIPValue));

export const pixelToHIP = (pixelValue: number) => TWIPToHIP(EMUToTWIP(pixelToEMU(pixelValue)));

export const HIPToPixel = (HIPValue: number) => EMUToPixel(TWIPToEMU(HIPToTWIP(HIPValue)));

export const inchToPoint = (inchValue: number) => Math.round(inchValue * 72);

export const inchToTWIP = (inchValue: number) => pointToTWIP(inchToPoint(inchValue));

export const cmToInch = (cmValue: number) => cmValue * 0.3937008;

export const cmToTWIP = (cmValue: number) => inchToTWIP(cmToInch(cmValue));

export const pixelToPoint = (pixelValue: number) => HIPToPoint(pixelToHIP(pixelValue));

export const pointToPixel = (pointValue: number) => HIPToPixel(pointToHIP(pointValue));

export const EIPToPoint = (EIPValue: number) => Math.round(EIPValue / 8);

export const pointToEIP = (PointValue: number) => Math.round(PointValue * 8);

export const pixelToEIP = (pixelValue: number) => pointToEIP(pixelToPoint(pixelValue));

export const EIPToPixel = (EIPValue: number) => pointToPixel(EIPToPoint(EIPValue));
