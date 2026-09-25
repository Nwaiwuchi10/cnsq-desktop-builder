import React, { useRef, useState, useEffect } from "react";
import {
  Menu, ArrowLeft, Paperclip, Trash, Link as LinkIcon, MoreVertical, Pin, Loader2, ListIcon, Eye, PanelLeftClose, PanelLeftOpen,
  CheckSquare, Type, List, Share, Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3, Check
} from "lucide-react";
import { Note } from "@/pages/notes/page";

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
  attachments: string[]; // Keeping for backward compatibility if any
  link: string; // Keeping for backward compatibility
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
  currentUserId: number | null;
  onOpenShare: () => void;
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
  onPinNote,
  currentUserId,
  onOpenShare
}: NoteEditorProps) {

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const [showFormatting, setShowFormatting] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || "";
    }
  }, [activeNote]);

  const handleInput = () => {
    if (editorRef.current) {
      onSetContent(editorRef.current.innerHTML);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64 = event.target?.result as string;

        // Restore focus to editor before inserting//
        if (editorRef.current) editorRef.current.focus();

        // As per request, ALWAYS insert as a file link, NEVER as a direct image display
        const html = `&nbsp;<a href="${base64}" download="${file.name}" contenteditable="false" style="display:inline-flex; align-items:center; padding:6px 12px; background:#f3f4f6; border-radius:8px; text-decoration:none; color:#374151; font-size:14px; font-weight:500; margin:4px 2px; border:1px solid #e5e7eb;">📄 <span style="margin-left:8px;">${file.name}</span></a>&nbsp;`;
        document.execCommand('insertHTML', false, html);

        handleInput();
      };

      reader.readAsDataURL(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const execCmd = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleInput();
  };

  const insertChecklist = () => {
    // Custom HTML for a checklist item compatible with contentEditable
    const id = Math.random().toString(36).substring(7);
    const html = `
      <ul style="list-style-type: none; padding-left: 0; margin-top: 4px; margin-bottom: 4px;">
        <li style="display: flex; align-items: flex-start; margin-bottom: 4px;">
          <input type="checkbox" id="chk-${id}" style="margin-top: 4px; margin-right: 8px; cursor: pointer;" contenteditable="false" />
          <span contenteditable="true" style="flex: 1; min-height: 1.5em;" placeholder="List item..."></span>
        </li>
      </ul>
    `;
    execCmd('insertHTML', html.trim());
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const node = selection.focusNode;
      if (node && node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const offset = selection.focusOffset;

        const textBeforeCursor = text.slice(0, offset);
        const match = textBeforeCursor.match(/(https?:\/\/[^\s]+)\s?$/);

        if (match) {
          const url = match[1];
          if (node.parentNode && node.parentNode.nodeName.toLowerCase() === 'a') {
            return;
          }

          const urlStart = textBeforeCursor.lastIndexOf(url);
          const urlEnd = urlStart + url.length;

          const range = document.createRange();
          range.setStart(node, urlStart);
          range.setEnd(node, urlEnd);

          selection.removeAllRanges();
          selection.addRange(range);

          document.execCommand('createLink', false, url);

          selection.collapseToEnd();
          handleInput();
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    // Auto-link logic for pasted URLs
    const urlPattern = /^(https?:\/\/[^\s]+)$/;
    if (urlPattern.test(text)) {
      e.preventDefault();
      const html = `<a href="${text}" target="_blank" style="color:#3b82f6; text-decoration:underline;">${text}</a>`;
      document.execCommand('insertHTML', false, html);
      handleInput();
    }
  };

  return (
    <div className={`flex-1 min-w-0 flex-col h-full bg-white dark:bg-[#141414] ${!isMobileDetail ? 'hidden md:flex' : 'flex'}`}>
      {/* Editor Header (Toolbar) */}
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

          {/* Formatting Toolbar - Apple Notes Style Inline tools */}
          <div className="flex items-center space-x-1 ml-4 border border-gray-200 dark:border-gray-700 rounded-lg p-1 bg-gray-50 dark:bg-[#1a1a1a]">
            <button onClick={insertChecklist} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400" title="Checklist">
              <CheckSquare size={16} />
            </button>

            <div className="relative">
              <button onClick={() => setShowFormatting(!showFormatting)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 font-serif font-bold text-sm flex items-center justify-center w-8 h-8" title="Format Text">
                Aa
              </button>
              {showFormatting && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-2">
                  <div className="flex px-2 pb-2 mb-2 border-b border-gray-100 dark:border-gray-700 justify-around">
                    <button onClick={() => execCmd('bold')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Bold size={16} /></button>
                    <button onClick={() => execCmd('italic')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Italic size={16} /></button>
                    <button onClick={() => execCmd('underline')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Underline size={16} /></button>
                    <button onClick={() => execCmd('strikeThrough')} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Strikethrough size={16} /></button>
                  </div>
                  <button onClick={() => execCmd('formatBlock', 'H1')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2a] font-bold">Title (H1)</button>
                  <button onClick={() => execCmd('formatBlock', 'H2')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2a] font-semibold">Heading (H2)</button>
                  <button onClick={() => execCmd('formatBlock', 'H3')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2a] font-medium">Subheading (H3)</button>
                  <button onClick={() => execCmd('formatBlock', 'P')} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2a]">Body text (P)</button>
                </div>
              )}
            </div>

            <button onClick={() => execCmd('insertUnorderedList')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400" title="Bulleted List">
              <List size={16} />
            </button>

            {/* Inline Add Link Tool */}
            <button onClick={() => execCmd('insertText', 'https://')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400" title="Add Link">
              <LinkIcon size={16} />
            </button>

            {/* Inline Attach File Tool (Any format, doc, images, pdf) */}
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400" title="Attach File Inline">
              <Paperclip size={16} />
            </button>

            <button onClick={onOpenShare} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400" title="Share Note">
              <Share size={16} />
            </button>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center space-x-3">
          <input
            type="file"
            accept="*/*"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          {activeNote && (
            <div className="flex items-center space-x-1 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm">
              <div className="relative">
                <button onClick={() => onSetShowMenu(!showMenu)} className="p-2 rounded hover:bg-gray-50 dark:hover:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 transition-colors">
                  <MoreVertical size={18} strokeWidth={1.5} />
                </button>
                {showMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-20 py-2 origin-top-right">
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

            <div className="ml-auto">
              <button
                disabled={isSaving}
                onClick={onSaveNote}
                className="px-4 py-2 bg-[#95D700] text-white text-sm font-bold rounded-lg hover:bg-[#86c000] transition-transform active:scale-95 shadow-sm shadow-[#95D700]/20 flex items-center disabled:opacity-70 disabled:active:scale-100"
              >
                {isSaving && <Loader2 size={16} className="animate-spin mr-2" />}
                {isSaving ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => onSetTitle(e.target.value)}
            placeholder="Title"
            className="w-full text-3xl md:text-4xl font-bold bg-transparent border-none p-0 outline-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
          />

          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onPaste={handlePaste}
            onKeyUp={handleKeyUp}
            className="w-full flex-1 bg-transparent border-none outline-none resize-none text-gray-800 dark:text-gray-200 text-[16px] leading-relaxed min-h-[300px] prose dark:prose-invert max-w-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
            data-placeholder="Start typing your note here... (You can add links, files, and lists inline directly!)"
            style={{ minHeight: '300px' }}
          />

          {/* Backward compatibility rendering for existing old notes that had separate attachments/links */}
          {((attachments && attachments.length > 0) || (link && link.trim() !== '')) && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/50 opacity-60">
              <h5 className="text-xs uppercase font-bold text-gray-500 mb-2">Legacy Attached Items</h5>
              {link && <div className="text-sm text-blue-500 mb-2"><a href={link} target="_blank" rel="noreferrer">{link}</a></div>}
              {attachments && attachments.map((a, i) => (
                <div key={i} className="text-sm text-blue-500"><a href={a} target="_blank" rel="noreferrer">{a.split('/').pop()}</a></div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Force native list styles inside the editor area since Tailwind resets them */}
      <style>{`
        .prose ul:not([style*="list-style-type: none"]) { list-style-type: disc !important; padding-left: 1.5rem !important; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .prose ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-top: 0.5rem; margin-bottom: 0.5rem; }
        .prose li { display: list-item !important; margin-bottom: 0.25rem; }
        .prose h1, .prose h2, .prose h3 { margin-top: 1rem; margin-bottom: 0.5rem; }
      `}</style>
    </div >
  );
}
