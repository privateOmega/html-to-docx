// Only absolute http(s) URLs are downloaded. Uses the WHATWG URL parser
// rather than a regular expression: the previous pattern needed lookbehind,
// which older Safari versions reject at parse time (#179, #208), and it
// required a dot in the host name, so e.g. http://localhost URLs were not
// recognised.
const isValidUrl = (urlString: unknown): boolean => {
  if (typeof urlString !== 'string') {
    return false;
  }
  try {
    const { protocol } = new URL(urlString);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
};

const base64DataUriRegex = /^data:([A-Za-z-+/]+);base64,(.+)$/;

/**
 * The base64 payload of a `data:<mime>;base64,<payload>` URI, or `null` for
 * anything else (relative paths, non-base64 data URIs, a missing src).
 */
const base64DataUriPayload = (source: unknown): string | null => {
  if (typeof source !== 'string') {
    return null;
  }
  return base64DataUriRegex.exec(source)?.[2] ?? null;
};

export { base64DataUriPayload, isValidUrl };
