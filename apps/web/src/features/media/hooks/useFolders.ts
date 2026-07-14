import { useMediaStore } from '../store/mediaStore';

export const useFolders = () => {
  const { folders, createFolder, deleteFolder, selectedFolderId } = useMediaStore();

  return {
    folders,
    createFolder,
    deleteFolder,
    selectedFolderId,
  };
};
