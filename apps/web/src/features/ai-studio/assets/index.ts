export const retrieveAssets = async (prompts: string[]) => {
  return prompts.map((p, idx) => ({
    id: `as-${idx}`,
    name: `Asset matching: ${p.slice(0, 10)}`,
    url: `https://images.example.com/asset-${idx}.png`,
  }));
};
