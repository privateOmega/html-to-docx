// Image sizing: the drawing extent of an <img> from its intrinsic size, the
// available width and its CSS width/height/max-width/max-height.
import { pixelToEMU, pixelRegex, TWIPToEMU, percentageRegex } from '../../utils/unit-conversion';
import type { VNodeType, BuilderAttributes } from './shared';

export const calculateAbsoluteValues = (attribute: string, originalAttributeInEMU: number) => {
  if (attribute !== 'auto') {
    if (pixelRegex.test(attribute)) {
      return pixelToEMU(Number(attribute.match(pixelRegex)![1]));
    } else if (percentageRegex.test(attribute)) {
      const percentageValue = attribute.match(percentageRegex)![1];
      return Math.round((Number(percentageValue) / 100) * originalAttributeInEMU);
    }
  }
  return originalAttributeInEMU;
};

export const computeImageDimensions = (vNode: VNodeType, attributes: BuilderAttributes) => {
  const { maximumWidth, originalWidth, originalHeight } = attributes;
  const aspectRatio = originalWidth! / originalHeight!;
  const maximumWidthInEMU = TWIPToEMU(maximumWidth!);
  let originalWidthInEMU = pixelToEMU(originalWidth!);
  let originalHeightInEMU = pixelToEMU(originalHeight!);
  if (originalWidthInEMU > maximumWidthInEMU) {
    originalWidthInEMU = maximumWidthInEMU;
    originalHeightInEMU = Math.round(originalWidthInEMU / aspectRatio);
  }
  let modifiedHeight;
  let modifiedWidth;
  let modifiedMaxHeight;
  let modifiedMaxWidth;

  if (vNode?.properties?.style) {
    const styleWidth = vNode.properties.style.width;
    const styleHeight = vNode.properties.style.height;
    const styleMaxWidth = vNode.properties.style['max-width'];
    const styleMaxHeight = vNode.properties.style['max-height'];

    // style - width
    if (styleWidth) {
      modifiedWidth = calculateAbsoluteValues(styleWidth, originalWidthInEMU);
      if (styleWidth === 'auto' && styleHeight === 'auto') {
        modifiedHeight = originalHeightInEMU;
      }
    }

    // style - height
    if (styleHeight) {
      modifiedHeight = calculateAbsoluteValues(styleHeight, originalHeightInEMU);

      if (styleHeight !== 'auto') {
        if (percentageRegex.test(styleHeight)) {
          if (!modifiedWidth) {
            modifiedWidth = Math.round(modifiedHeight * aspectRatio);
          }
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (modifiedWidth) {
          if (!modifiedHeight) {
            modifiedHeight = Math.round(modifiedWidth / aspectRatio);
          }
        } else {
          modifiedWidth = originalWidthInEMU;
        }
      }
    }

    // style - max width
    if (styleMaxWidth) {
      modifiedMaxWidth = calculateAbsoluteValues(styleMaxWidth, originalWidthInEMU);
      if (modifiedWidth) {
        modifiedWidth = modifiedWidth > modifiedMaxWidth ? modifiedMaxWidth : modifiedWidth;
      } else {
        modifiedWidth = modifiedMaxWidth;
      }
    }

    // style - max height
    if (styleMaxHeight) {
      modifiedMaxHeight = calculateAbsoluteValues(styleMaxHeight, originalHeightInEMU);
      if (modifiedHeight) {
        modifiedHeight = modifiedHeight > modifiedMaxHeight ? modifiedMaxHeight : modifiedHeight;
      } else {
        modifiedHeight = modifiedMaxHeight;
      }
    }
    if (modifiedWidth && !modifiedHeight) {
      modifiedHeight = Math.round(modifiedWidth / aspectRatio);
    } else if (modifiedHeight && !modifiedWidth) {
      modifiedWidth = Math.round(modifiedHeight * aspectRatio);
    }
  } else {
    modifiedWidth = originalWidthInEMU;
    modifiedHeight = originalHeightInEMU;
  }

  // eslint-disable-next-line no-param-reassign
  attributes.width = modifiedWidth;
  // eslint-disable-next-line no-param-reassign
  attributes.height = modifiedHeight;
};
