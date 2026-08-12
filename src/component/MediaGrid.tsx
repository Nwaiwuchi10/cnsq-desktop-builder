"use client";

import React from "react";

interface MediaItem {
  id: string | number;
  url: string;
  mimeType?: string;
  filename?: string;
}

interface MediaGridProps {
  media?: MediaItem[];
  maxWidth?: number;
}

function isVideo(item: MediaItem): boolean {
  if (item.mimeType?.startsWith("video/")) return true;
  const ext = item.filename?.split(".").pop()?.toLowerCase();
  return !!(ext && ["mp4", "mov", "webm", "mkv", "avi"].includes(ext));
}

const MediaCell: React.FC<{
  item: MediaItem;
  className?: string;
  overlay?: React.ReactNode;
}> = ({ item, className = "", overlay }) => {
  const video = isVideo(item);
  return (
    <div className={`relative overflow-hidden bg-black/10 ${className}`}>
      {video ? (
        <video
          src={item.url}
          controls
          controlsList="nodownload"
          playsInline
          className="w-full h-full object-cover"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={item.url}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
      {overlay}
    </div>
  );
};

const MediaGrid: React.FC<MediaGridProps> = ({ media = [], maxWidth = 260 }) => {
  if (!media || media.length === 0) return null;
  const count = media.length;
  const gap = "gap-0.5";

  if (count === 1) {
    const vid = isVideo(media[0]);
    return (
      <div style={{ maxWidth }} className="w-full overflow-hidden rounded-md">
        {vid ? (
          <video
            src={media[0].url}
            controls
            playsInline
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-64 object-cover rounded-md"
          />
        ) : (
          <img
            src={media[0].url}
            alt=""
            className="w-full max-h-64 object-cover rounded-md"
            loading="lazy"
          />
        )}
      </div>
    );
  }

  if (count === 2) {
    return (
      <div style={{ maxWidth }} className={`w-full flex ${gap}`}>
        {media.map((m) => (
          <MediaCell key={m.id} item={m} className="flex-1 h-36 rounded-md" />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div style={{ maxWidth }} className={`w-full flex flex-col ${gap}`}>
        <MediaCell item={media[0]} className="w-full h-44 rounded-md" />
        <div className={`flex ${gap}`}>
          <MediaCell item={media[1]} className="flex-1 h-28 rounded-md" />
          <MediaCell item={media[2]} className="flex-1 h-28 rounded-md" />
        </div>
      </div>
    );
  }

  // 4+ items: 2x2 grid, +N overlay on 4th slot
  const visible = media.slice(0, 4);
  const remaining = count - 4;

  return (
    <div style={{ maxWidth }} className={`w-full grid grid-cols-2 ${gap}`}>
      {visible.map((m, idx) => {
        const isLast = idx === 3 && remaining > 0;
        return (
          <MediaCell
            key={m.id}
            item={m}
            className="h-[7.5rem] rounded-md"
            overlay={
              isLast ? (
                <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
                  <span className="text-white text-xl font-bold drop-shadow">+{remaining}</span>
                </div>
              ) : undefined
            }
          />
        );
      })}
    </div>
  );
};

export default MediaGrid;
