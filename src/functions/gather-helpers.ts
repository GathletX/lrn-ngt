//DBOutfit consists of a map of key/id
export const outfitStringToDBOutfit = (outfitString: string) => {
  const outfit = JSON.parse(outfitString);
  return Object.keys(outfit).reduce(
    (acc, currKey) =>
      Object.assign(Object.assign({}, acc), {
        [currKey]: outfit[currKey] ? outfit[currKey]?.id || "" : ""
      }),
    {}
  );
};
