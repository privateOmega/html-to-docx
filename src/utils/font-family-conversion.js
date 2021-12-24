export const removeSimpleOrDoubleQuotes = /(["'])(.*?)\1/;

export const fontFamilyToFontName = (fontFamilyString) => {
  if (fontFamilyString) {
    const firstFontName = fontFamilyString.split(',')[0];
    if (removeSimpleOrDoubleQuotes.test(firstFontName)) {
      return firstFontName.match(removeSimpleOrDoubleQuotes)[2];
    }
    return firstFontName;
  }
  return '';
};
