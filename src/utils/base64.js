export function extractBase64Data(src) {
  const idxComma = src.indexOf(',');
  const idxSlash = src.indexOf('/');

  if (idxComma === -1 || idxSlash === -1 || !src.startsWith('data:')) {
    return {
      type: '',
      extension: '',
      data: '',
    };
  }

  const idxSemi = src.indexOf(';');
  const extEnd = idxSemi === -1 ? idxComma : Math.min(idxSemi, idxComma);

  return {
    type: src.substring('data:'.length, idxSlash),
    extension: src.substring(idxSlash + 1, extEnd),
    data: src.substring(idxComma + 1).trim(),
  };
}
