export const MetadataService = {
  async getMetadata(file: File, type: string): Promise<any> {
    if (type === 'video' || type === 'audio') {
      return new Promise((resolve) => {
        const element = document.createElement(type);
        element.src = URL.createObjectURL(file);
        element.onloadedmetadata = () => {
          const metadata: any = { duration: element.duration };
          if (type === 'video') {
            const video = element as HTMLVideoElement;
            metadata.width = video.videoWidth;
            metadata.height = video.videoHeight;
          }
          URL.revokeObjectURL(element.src);
          resolve(metadata);
        };
      });
    }
    if (type === 'image' || type === 'svg') {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          const metadata = { width: img.width, height: img.height };
          URL.revokeObjectURL(img.src);
          resolve(metadata);
        };
      });
    }
    return {};
  }
};
