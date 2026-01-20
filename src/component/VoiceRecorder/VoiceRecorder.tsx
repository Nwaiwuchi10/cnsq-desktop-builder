"use client";

import { ReactMediaRecorder } from "react-media-recorder";

type Props = {
  onRecorded: (blob: Blob, url: string) => void;
};

export default function VoiceRecorder({ onRecorded }: Props) {
  return (
    <ReactMediaRecorder
      audio
      mediaRecorderOptions={{ mimeType: "audio/webm" }}
      onStop={(blobUrl) => {
        fetch(blobUrl)
          .then((r) => r.blob())
          .then((blob) => {
            onRecorded(blob, blobUrl);
          });
      }}
      render={({ status, startRecording, stopRecording }) => (
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`px-2 py-1 rounded cursor-pointer ${
            status === "recording"
              ? "bg-red-600 text-white"
              : "bg-green-600 text-white"
          }`}
        >
          🎤
        </button>
      )}
    />
  );
}
