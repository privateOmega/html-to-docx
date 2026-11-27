/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-param-reassign */
/* eslint-disable no-case-declarations */
/* eslint-disable no-plusplus */
/* eslint-disable no-else-return */
import { fragment } from 'xmlbuilder2';
import namespaces from '../../namespaces';
import { attr } from '../../utils/xml';
import type { BuilderAttributes } from './shared';

export const buildPresetGeometry = () =>
  fragment({ namespaceAlias: { a: namespaces.a } })
    .ele('@a', 'prstGeom')
    .att('prst', 'rect')
    .up();

export const buildExtents = ({
  width,
  height,
}: {
  width?: number | string;
  height?: number | string;
}) =>
  fragment({ namespaceAlias: { a: namespaces.a } })
    .ele('@a', 'ext')
    .att('cx', attr(width))
    .att('cy', attr(height))
    .up();

export const buildOffset = () =>
  fragment({ namespaceAlias: { a: namespaces.a } })
    .ele('@a', 'off')
    .att('x', '0')
    .att('y', '0')
    .up();

export const buildGraphicFrameTransform = (attributes: BuilderAttributes) => {
  const graphicFrameTransformFragment = fragment({ namespaceAlias: { a: namespaces.a } }).ele(
    '@a',
    'xfrm',
  );

  const offsetFragment = buildOffset();
  graphicFrameTransformFragment.import(offsetFragment);
  const extentsFragment = buildExtents(attributes);
  graphicFrameTransformFragment.import(extentsFragment);

  graphicFrameTransformFragment.up();

  return graphicFrameTransformFragment;
};

export const buildShapeProperties = (attributes: BuilderAttributes) => {
  const shapeProperties = fragment({ namespaceAlias: { pic: namespaces.pic } }).ele('@pic', 'spPr');

  const graphicFrameTransformFragment = buildGraphicFrameTransform(attributes);
  shapeProperties.import(graphicFrameTransformFragment);
  const presetGeometryFragment = buildPresetGeometry();
  shapeProperties.import(presetGeometryFragment);

  shapeProperties.up();

  return shapeProperties;
};

export const buildFillRect = () =>
  fragment({ namespaceAlias: { a: namespaces.a } })
    .ele('@a', 'fillRect')
    .up();

export const buildStretch = () => {
  const stretchFragment = fragment({ namespaceAlias: { a: namespaces.a } }).ele('@a', 'stretch');

  const fillRectFragment = buildFillRect();
  stretchFragment.import(fillRectFragment);

  stretchFragment.up();

  return stretchFragment;
};

export const buildSrcRectFragment = () =>
  fragment({ namespaceAlias: { a: namespaces.a } })
    .ele('@a', 'srcRect')
    .att('b', '0')
    .att('l', '0')
    .att('r', '0')
    .att('t', '0')
    .up();

export const buildBinaryLargeImageOrPicture = (relationshipId: number) =>
  fragment({
    namespaceAlias: { a: namespaces.a, r: namespaces.r },
  })
    .ele('@a', 'blip')
    .att('@r', 'embed', `rId${relationshipId}`)
    // FIXME: possible values 'email', 'none', 'print', 'hqprint', 'screen'
    .att('cstate', 'print')
    .up();

export const buildBinaryLargeImageOrPictureFill = (relationshipId: number) => {
  const binaryLargeImageOrPictureFillFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'blipFill');
  const binaryLargeImageOrPictureFragment = buildBinaryLargeImageOrPicture(relationshipId);
  binaryLargeImageOrPictureFillFragment.import(binaryLargeImageOrPictureFragment);
  const srcRectFragment = buildSrcRectFragment();
  binaryLargeImageOrPictureFillFragment.import(srcRectFragment);
  const stretchFragment = buildStretch();
  binaryLargeImageOrPictureFillFragment.import(stretchFragment);

  binaryLargeImageOrPictureFillFragment.up();

  return binaryLargeImageOrPictureFillFragment;
};

export const buildNonVisualPictureDrawingProperties = () =>
  fragment({ namespaceAlias: { pic: namespaces.pic } })
    .ele('@pic', 'cNvPicPr')
    .up();

export const buildNonVisualDrawingProperties = (
  pictureId: number,
  pictureNameWithExtension: string,
  pictureDescription = '',
) =>
  fragment({ namespaceAlias: { pic: namespaces.pic } })
    .ele('@pic', 'cNvPr')
    .att('id', attr(pictureId))
    .att('name', attr(pictureNameWithExtension))
    .att('descr', attr(pictureDescription))
    .up();

export const buildNonVisualPictureProperties = (
  pictureId: number,
  pictureNameWithExtension: string,
  pictureDescription: string | undefined,
) => {
  const nonVisualPicturePropertiesFragment = fragment({
    namespaceAlias: { pic: namespaces.pic },
  }).ele('@pic', 'nvPicPr');
  // TODO: Handle picture attributes
  const nonVisualDrawingPropertiesFragment = buildNonVisualDrawingProperties(
    pictureId,
    pictureNameWithExtension,
    pictureDescription,
  );
  nonVisualPicturePropertiesFragment.import(nonVisualDrawingPropertiesFragment);
  const nonVisualPictureDrawingPropertiesFragment = buildNonVisualPictureDrawingProperties();
  nonVisualPicturePropertiesFragment.import(nonVisualPictureDrawingPropertiesFragment);
  nonVisualPicturePropertiesFragment.up();

  return nonVisualPicturePropertiesFragment;
};

export const buildPicture = ({
  id,
  fileNameWithExtension,
  description,
  relationshipId,
  width,
  height,
}: BuilderAttributes) => {
  const pictureFragment = fragment({ namespaceAlias: { pic: namespaces.pic } }).ele('@pic', 'pic');
  const nonVisualPicturePropertiesFragment = buildNonVisualPictureProperties(
    id!,
    fileNameWithExtension!,
    description,
  );
  pictureFragment.import(nonVisualPicturePropertiesFragment);
  const binaryLargeImageOrPictureFill = buildBinaryLargeImageOrPictureFill(relationshipId!);
  pictureFragment.import(binaryLargeImageOrPictureFill);
  const shapeProperties = buildShapeProperties({ width, height });
  pictureFragment.import(shapeProperties);
  pictureFragment.up();

  return pictureFragment;
};

export const buildGraphicData = (graphicType: string, attributes: BuilderAttributes) => {
  const graphicDataFragment = fragment({ namespaceAlias: { a: namespaces.a } })
    .ele('@a', 'graphicData')
    .att('uri', 'http://schemas.openxmlformats.org/drawingml/2006/picture');
  if (graphicType === 'picture') {
    const pictureFragment = buildPicture(attributes);
    graphicDataFragment.import(pictureFragment);
  }
  graphicDataFragment.up();

  return graphicDataFragment;
};

export const buildGraphic = (graphicType: string, attributes: BuilderAttributes) => {
  const graphicFragment = fragment({ namespaceAlias: { a: namespaces.a } }).ele('@a', 'graphic');
  // TODO: Handle drawing type
  const graphicDataFragment = buildGraphicData(graphicType, attributes);
  graphicFragment.import(graphicDataFragment);
  graphicFragment.up();

  return graphicFragment;
};

export const buildDrawingObjectNonVisualProperties = (pictureId: number, pictureName: string) =>
  fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'docPr')
    .att('id', attr(pictureId))
    .att('name', attr(pictureName))
    .up();

export const buildWrapSquare = () =>
  fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'wrapSquare')
    .att('wrapText', 'bothSides')
    .att('distB', '228600')
    .att('distT', '228600')
    .att('distL', '228600')
    .att('distR', '228600')
    .up();

// eslint-disable-next-line no-unused-vars
export const buildWrapNone = () =>
  fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'wrapNone')
    .up();

export const buildEffectExtentFragment = () =>
  fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'effectExtent')
    .att('b', '0')
    .att('l', '0')
    .att('r', '0')
    .att('t', '0')
    .up();

export const buildExtent = ({
  width,
  height,
}: {
  width?: number | string;
  height?: number | string;
}) =>
  fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'extent')
    .att('cx', attr(width))
    .att('cy', attr(height))
    .up();

export const buildPositionV = () =>
  fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'positionV')
    .att('relativeFrom', 'paragraph')
    .ele('@wp', 'posOffset')
    .txt('19050')
    .up()
    .up();

export const buildPositionH = () =>
  fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'positionH')
    .att('relativeFrom', 'column')
    .ele('@wp', 'posOffset')
    .txt('19050')
    .up()
    .up();

export const buildSimplePos = () =>
  fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'simplePos')
    .att('x', '0')
    .att('y', '0')
    .up();

export const buildAnchoredDrawing = (graphicType: string, attributes: BuilderAttributes) => {
  const anchoredDrawingFragment = fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'anchor')
    .att('distB', '0')
    .att('distL', '0')
    .att('distR', '0')
    .att('distT', '0')
    .att('relativeHeight', '0')
    .att('behindDoc', 'false')
    .att('locked', 'true')
    .att('layoutInCell', 'true')
    .att('allowOverlap', 'false')
    .att('simplePos', 'false');
  // Even though simplePos isnt supported by Word 2007 simplePos is required.
  const simplePosFragment = buildSimplePos();
  anchoredDrawingFragment.import(simplePosFragment);
  const positionHFragment = buildPositionH();
  anchoredDrawingFragment.import(positionHFragment);
  const positionVFragment = buildPositionV();
  anchoredDrawingFragment.import(positionVFragment);
  const extentFragment = buildExtent({ width: attributes.width, height: attributes.height });
  anchoredDrawingFragment.import(extentFragment);
  const effectExtentFragment = buildEffectExtentFragment();
  anchoredDrawingFragment.import(effectExtentFragment);
  const wrapSquareFragment = buildWrapSquare();
  anchoredDrawingFragment.import(wrapSquareFragment);
  const drawingObjectNonVisualPropertiesFragment = buildDrawingObjectNonVisualProperties(
    attributes.id!,
    attributes.fileNameWithExtension!,
  );
  anchoredDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
  const graphicFragment = buildGraphic(graphicType, attributes);
  anchoredDrawingFragment.import(graphicFragment);

  anchoredDrawingFragment.up();

  return anchoredDrawingFragment;
};

export const buildInlineDrawing = (graphicType: string, attributes: BuilderAttributes) => {
  const inlineDrawingFragment = fragment({ namespaceAlias: { wp: namespaces.wp } })
    .ele('@wp', 'inline')
    .att('distB', '0')
    .att('distL', '0')
    .att('distR', '0')
    .att('distT', '0');

  const extentFragment = buildExtent({ width: attributes.width, height: attributes.height });
  inlineDrawingFragment.import(extentFragment);
  const effectExtentFragment = buildEffectExtentFragment();
  inlineDrawingFragment.import(effectExtentFragment);
  const drawingObjectNonVisualPropertiesFragment = buildDrawingObjectNonVisualProperties(
    attributes.id!,
    attributes.fileNameWithExtension!,
  );
  inlineDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
  const graphicFragment = buildGraphic(graphicType, attributes);
  inlineDrawingFragment.import(graphicFragment);

  inlineDrawingFragment.up();

  return inlineDrawingFragment;
};

export const buildDrawing = (
  inlineOrAnchored = false,
  graphicType: string,
  attributes: BuilderAttributes,
) => {
  const drawingFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'drawing');
  const inlineOrAnchoredDrawingFragment = inlineOrAnchored
    ? buildInlineDrawing(graphicType, attributes)
    : buildAnchoredDrawing(graphicType, attributes);
  drawingFragment.import(inlineOrAnchoredDrawingFragment);
  drawingFragment.up();

  return drawingFragment;
};
