const isValidUrl = (urlString) => {
  const urlRegex = /http(s)?:\/\/(\w+:?\w*@)?(\S+)(:\d+)?((?<=\.)\w+)+(\/([\w#!:.?+=&%@!\-/])*)?/gi;

  return Boolean(urlRegex.test(urlString));
};

export { isValidUrl };
