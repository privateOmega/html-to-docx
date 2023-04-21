const isValidUrl = (urlString) => {
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.([-a-zA-Z0-9()@:%_.~#?&//=]*)/;

  return Boolean(urlRegex.test(urlString));
};

// eslint-disable-next-line import/prefer-default-export
export { isValidUrl };
