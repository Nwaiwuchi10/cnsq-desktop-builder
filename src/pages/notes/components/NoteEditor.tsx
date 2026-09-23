import React, { useRef } from "react";
import {
  Menu, ArrowLeft, Paperclip, Trash, Link as LinkIcon, MoreVertical, Pin, Loader2, ListIcon, Eye, PanelLeftClose, PanelLeftOpen
} from "lucide-react";
import { Note } from "../page";

const COLORS = [
  { name: "blue", hex: "#3b82f6" },
  { name: "green", hex: "#84cc16" },
  { name: "orange", hex: "#f97316" },
  { name: "purple", hex: "#a855f7" },
  { name: "red", hex: "#ef4444" },
];

interface NoteEditorProps {
  title: string;
  content: string;
  labelColor: string;
  attachments: string[];
  link: string;
  uploadFiles: File[];
  search: string;
  isMobileDetail: boolean;
  isDrawerOpen: boolean;
  activeNote: Note | null;
  showMenu: boolean;
  isSaving: boolean;
  onSetTitle: (val: string) => void;
  onSetContent: (val: string) => void;
  onSetLabelColor: (val: string) => void;
  onSetAttachments: (val: string[]) => void;
  onSetLink: (val: string) => void;
  onSetUploadFiles: (val: File[]) => void;
  onSetSearch: (val: string) => void;
  onSetIsMobileDetail: (val: boolean) => void;
  onSetIsDrawerOpen: (val: boolean) => void;
  onSetShowMenu: (val: boolean) => void;
  onSetViewMode: (val: 'read' | 'edit') => void;
  onSaveNote: () => void;
  onDeleteNote: (id: number) => void;
  onPinNote: (note: Note) => void;
}

export default function NoteEditor({
  title,
  content,
  labelColor,
  attachments,
  link,
  uploadFiles,
  search,
  isMobileDetail,
  isDrawerOpen,
  activeNote,
  showMenu,
  isSaving,
  onSetTitle,
  onSetContent,
  onSetLabelColor,
  onSetAttachments,
  onSetLink,
  onSetUploadFiles,
  onSetSearch,
  onSetIsMobileDetail,
  onSetIsDrawerOpen,
  onSetShowMenu,
  onSetViewMode,
  onSaveNote,
  onDeleteNote,
  onPinNote
}: NoteEditorProps) {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      onSetUploadFiles([...uploadFiles, ...filesArray]);
      // Reset the input so it doesn't confusingly show files that might be deleted later
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeUploadFile = (idx: number) => {
    onSetUploadFiles(uploadFiles.filter((_, i) => i !== idx));
    // Also ensure the input is cleared
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`flex-1 flex-col h-full bg-white dark:bg-[#141414] ${!isMobileDetail ? 'hidden md:flex' : 'flex'}`}>
      {/* Editor Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/80 dark:bg-[#141414]/80 backdrop-blur-md min-h-[73px] sticky top-0 z-10">
        <div className="flex items-center">
          {/* Desktop Drawer Toggle */}
          <div className="hidden md:flex items-center mr-4">
            <button onClick={() => onSetIsDrawerOpen(!isDrawerOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f1f1f] text-gray-600 dark:text-gray-400 transition-colors">
              {isDrawerOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>

          {/* Mobile Back Button */}
          <div className="md:hidden flex items-center mr-2">
            <button onClick={() => onSetIsMobileDetail(false)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1f1f1f] flex items-center text-gray-800 dark:text-gray-200">
              <ArrowLeft size={20} className="mr-1" />
              <span className="font-medium text-sm">Notes</span>
            </button>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-3">
          {activeNote && (
            <div className="flex items-center space-x-1 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm">
              <div className="relative">
                <button onClick={() => onSetShowMenu(!showMenu)} className="p-2 rounded hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 transition-colors">
                  <MoreVertical size={18} strokeWidth={1.5} />
                </button>
                {showMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                    <button onClick={() => onPinNote(activeNote)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] flex items-center font-medium transition-colors">
                      <Pin size={16} className="mr-3 text-gray-400 dark:text-gray-500" /> {activeNote.isPinned ? "Unpin Note" : "Pin Note"}
                    </button>
                    <button onClick={() => { onSetViewMode('read'); onSetShowMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] flex items-center font-medium transition-colors">
                      <Eye size={16} className="mr-3 text-gray-400 dark:text-gray-500" /> View Note
                    </button>
                    <button onClick={() => onDeleteNote(activeNote.id)} className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center font-medium transition-colors">
                      <Trash size={16} className="mr-3 text-red-400" /> Delete Note
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-8 flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full flex flex-col h-full space-y-6">
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Label:</span>
            <div className="flex space-x-2">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => onSetLabelColor(color.name)}
                  className={`w-5 h-5 rounded-full transition-all ${labelColor === color.name
                    ? "ring-2 ring-offset-2 dark:ring-offset-[#141414] ring-[#95D700] scale-110 shadow-sm"
                    : "hover:scale-110 shadow-sm opacity-80 hover:opacity-100"
                    }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => onSetTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-xl md:text-2xl font-bold bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#95D700] text-gray-900 dark:text-white placeholder-gray-400"
          />

          <textarea
            value={content}
            onChange={(e) => onSetContent(e.target.value)}
            placeholder="Start typing your note here..."
            className="w-full flex-1 bg-white dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-700 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[#95D700] resize-none text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed min-h-[100px] placeholder-gray-400"
          />

          {/* Edit Add Link */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800/50">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center uppercase tracking-wide">
              <LinkIcon size={16} className="mr-2 text-gray-400" /> Reference Link
            </h4>
            <input
              type="url"
              value={link}
              onChange={(e) => onSetLink(e.target.value)}
              placeholder="Paste a reference link (e.g., https://example.com)"
              className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#95D700] text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Edit Attachments UI (File Upload) */}
          <div className="pt-6">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center uppercase tracking-wide">
              <Paperclip size={16} className="mr-2 text-gray-400" /> Add Attachments
            </h4>
            
            <div className="mb-6">
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#95D700]/10 file:text-[#95D700]
                  hover:file:bg-[#95D700]/20
                  cursor-pointer"
              />
            </div>

            {(attachments.length > 0 || uploadFiles.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-8">
                {/* Existing uploaded attachments from S3 */}
                {attachments.map((url, idx) => (
                  <div key={`existing-${idx}`} className="flex justify-between items-center bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-sm group shadow-sm">
                    <a href={url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate max-w-[85%] font-medium" title={url}>
                      {url.split('/').pop()}
                    </a>
                    <button
                      onClick={() => onSetAttachments(attachments.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                      title="Remove attachment"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
                
                {/* Pending local file uploads */}
                {uploadFiles.map((file, idx) => (
                  <div key={`pending-${idx}`} className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-3 rounded-xl text-sm group shadow-sm">
                    <span className="text-blue-600 dark:text-blue-400 truncate max-w-[85%] font-medium" title={file.name}>
                      {file.name} (Pending)
                    </span>
                    <button
                      onClick={() => removeUploadFile(idx)}
                      className="text-blue-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-[#2a2a2a] transition-colors"
                      title="Remove pending file"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex pt-4 pb-8 border-t border-gray-100 dark:border-gray-800/50">
            <button 
              disabled={isSaving}
              onClick={onSaveNote} 
              className="px-6 py-3 w-full flex items-center justify-center sm:w-auto bg-[#95D700] text-white text-sm font-bold rounded-xl hover:bg-[#86c000] transition-transform active:scale-95 shadow-sm shadow-[#95D700]/20 whitespace-nowrap disabled:opacity-70 disabled:active:scale-100"
            >
              {isSaving && <Loader2 size={18} className="animate-spin mr-2" />}
              {isSaving ? "Saving Note..." : "Save Note"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
