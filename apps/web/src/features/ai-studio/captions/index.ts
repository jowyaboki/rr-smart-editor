export const generateWordLevelCaptions = (dialogue: string) => {
  return dialogue.split(' ').map((word, idx) => ({
    word,
    start: idx * 0.4,
    end: (idx + 1) * 0.4,
  }));
};
