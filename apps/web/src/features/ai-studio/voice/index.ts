export const selectVoiceActor = (gender: 'male' | 'female' | 'neutral') => {
  return {
    voiceId: `actor-${gender}`,
    sampleUrl: `https://audio.example.com/voices/${gender}-1.mp3`,
    accent: 'US English',
  };
};
