"use client";

const VoiceNote = () => {
  return <div>VoiceNote</div>;
};

export default VoiceNote;
// "use client";

// import { useState } from "react";
// import { ReactMediaRecorder } from "react-media-recorder";

// export default function VoiceNote() {
//   const [audioURL, setAudioURL] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);

//   const handleUpload = async (blobUrl: string) => {
//     try {
//       setUploading(true);

//       const blob = await fetch(blobUrl).then((r) => r.blob());
//       const formData = new FormData();
//       formData.append("voice", blob, "voice-note.webm");

//       await fetch("/api/upload-voice", {
//         method: "POST",
//         body: formData,
//       });

//       setAudioURL(blobUrl);
//     } catch (err) {
//       console.error("Upload failed", err);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <ReactMediaRecorder
//       audio
//       mediaRecorderOptions={{
//         mimeType: "audio/webm",
//       }}
//       onStop={(blobUrl) => handleUpload(blobUrl)}
//       render={({ status, startRecording, stopRecording }) => (
//         <div className="flex flex-col gap-3 max-w-sm">
//           {/* Recorder */}
//           <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-full shadow-sm">
//             {status !== "recording" ? (
//               <button
//                 onMouseDown={startRecording}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm"
//               >
//                 Hold to record
//               </button>
//             ) : (
//               <button
//                 onMouseUp={stopRecording}
//                 className="px-4 py-2 bg-red-600 text-white rounded-full text-sm"
//               >
//                 Recording...
//               </button>
//             )}

//             <span className="text-xs text-gray-600 capitalize">{status}</span>
//           </div>

//           {/* Preview */}
//           {audioURL && (
//             <div className="bg-white border rounded-lg p-2">
//               <audio controls className="w-full">
//                 <source src={audioURL} type="audio/webm" />
//               </audio>
//             </div>
//           )}

//           {/* Upload Status */}
//           {uploading && (
//             <p className="text-xs text-gray-500">Uploading voice note...</p>
//           )}
//         </div>
//       )}
//     />
//   );
// }
