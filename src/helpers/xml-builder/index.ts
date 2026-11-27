// Public API of the XML builders (unchanged from the former single module).
export { fixupLineHeight, fixupColorCode } from './fixups';
export {
  buildLineBreak,
  buildTextElement,
  buildBold,
  buildItalics,
  buildUnderline,
} from './formatting';
export { buildDrawing } from './drawing';
export { buildParagraph, buildNumberingInstances, buildIndentation } from './paragraph';
export { buildTable } from './table';
