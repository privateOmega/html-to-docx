export const removeSimpleOrDoubleQuotes = /(["'])(.*?)\1/;

export interface FontTableObject {
  fontName: string;
  genericFontName: string;
}

export const fontFamilyToTableObject = (
  fontFamilyString: string | undefined,
  fallbackFont: string,
): FontTableObject => {
  const fontFamilyElements = fontFamilyString
    ? fontFamilyString.split(',').map((fontName): string => {
        const trimmedFontName = fontName.trim();
        if (removeSimpleOrDoubleQuotes.test(trimmedFontName)) {
          return trimmedFontName.match(removeSimpleOrDoubleQuotes)![2]!;
        }
        return trimmedFontName;
      })
    : [fallbackFont];

  return {
    fontName: fontFamilyElements[0]!,
    genericFontName: fontFamilyElements[fontFamilyElements.length - 1]!,
  };
};
