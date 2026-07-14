export const ThumbnailService = {
  async generateVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.currentTime = 1; // Capture at 1 second
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        URL.revokeObjectURL(video.src);
        resolve(dataUrl);
      };
      video.onerror = reject;
    });
  },

  async getFileThumbnail(file: File, type: string): Promise<string | undefined> {
    if (type === 'image' || type === 'svg' || type === 'gif') {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    if (type === 'video') {
      return this.generateVideoThumbnail(file);
    }
    return undefined;
  }
};
