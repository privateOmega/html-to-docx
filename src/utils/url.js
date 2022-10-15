const urlRegex = /http(s)?:\/\/(\w+:?\w*@)?(\S+)(:\d+)?((?<=\.)\w+)+(\/([\w#!:.?+=&%@!\-/])*)?/gi;

const isValidUrl = (urlString) => Boolean(urlRegex.test(urlString));

export { urlRegex, isValidUrl };
