// components/VoiceRecorder.tsx
import React, { useState, useRef } from "react";

const VoiceRecorder: React.FC = () => {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSend = async () => {
    if (!audioURL) return;

    const response = await fetch(audioURL);
    const blob = await response.blob();

    // Example: Send to backend
    const formData = new FormData();
    formData.append("file", blob, "voiceMessage.webm");

    try {
      await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });
      alert("Audio sent!");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 transition-colors">
      {recording ? (
        <button
          onClick={stopRecording}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Stop Recording
        </button>
      ) : (
        <button
          onClick={startRecording}
          className="px-4 py-2 bg-green-500 text-white rounded-md"
        >
          Start Recording
        </button>
      )}

      {audioURL && (
        <div className="flex flex-col items-center mt-2">
          <audio controls src={audioURL}></audio>
          <button
            onClick={handleSend}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
