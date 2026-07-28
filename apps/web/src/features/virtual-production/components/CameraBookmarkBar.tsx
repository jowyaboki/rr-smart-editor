import React from 'react';
import { useVirtualProductionStore } from '../store/virtualProductionStore';
import { globalVirtualStudioEngine } from '@ai-video-editor/virtual-production';

export function CameraBookmarkBar() {
  const { studio, selectedCameraId, setStudio } = useVirtualProductionStore();

  if (!studio || !selectedCameraId || !studio.cameras[selectedCameraId]) {
    return (
      <div className="text-xs text-gray-500 text-center py-2">
        Select a Camera from the Outliner list to manage viewport bookmarks.
      </div>
    );
  }

  const camera = studio.cameras[selectedCameraId];

  const handleAddBookmark = () => {
    const nextCameraState = globalVirtualStudioEngine.cameraService.createBookmark(
      camera,
      `Bookmark ${camera.bookmarks.length + 1}`,
    );

    setStudio({
      ...studio,
      cameras: {
        ...studio.cameras,
        [selectedCameraId]: nextCameraState,
      },
    });
  };

  const handleRecallBookmark = (bookmarkId: string) => {
    const bookmark = camera.bookmarks.find((b) => b.id === bookmarkId);
    if (!bookmark) return;

    // Fast animation transition simulated
    setStudio({
      ...studio,
      cameras: {
        ...studio.cameras,
        [selectedCameraId]: {
          ...camera,
          transform: bookmark.transform,
          activeBookmarkId: bookmarkId,
        },
      },
    });
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 overflow-x-auto">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Bookmarks</span>
        {camera.bookmarks.map((bm) => (
          <button
            key={bm.id}
            onClick={() => handleRecallBookmark(bm.id)}
            className={`px-3 py-1 rounded text-xs transition ${
              camera.activeBookmarkId === bm.id
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-[#2d2d35] hover:bg-[#3e3e48] text-gray-300'
            }`}
          >
            📍 {bm.name}
          </button>
        ))}
        {camera.bookmarks.length === 0 && (
          <span className="text-xs text-gray-600">No bookmarks saved yet</span>
        )}
      </div>

      <button
        onClick={handleAddBookmark}
        className="px-3 py-1 bg-[#2d2d35] hover:bg-[#3e3e48] text-indigo-400 text-xs font-semibold rounded border border-[#3e3e48] transition"
      >
        + Save Position Bookmark
      </button>
    </div>
  );
}
