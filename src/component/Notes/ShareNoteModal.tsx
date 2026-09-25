import React, { useState, useEffect } from "react";
import { Link as LinkIcon, Loader2, Check } from "lucide-react";
import { Note } from "@/pages/notes/page";

interface ShareNoteModalProps {
  activeNote: Note | null;
  currentUserId: number | null;
  onClose: () => void;
  setModalData: (data: { type: "success" | "error"; message: string } | null) => void;
}

export default function ShareNoteModal({ activeNote, currentUserId, onClose, setModalData }: ShareNoteModalProps) {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [isSendingNote, setIsSendingNote] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    if (staffList.length === 0) {
      const fetchStaff = async () => {
        setIsLoadingStaff(true);
        try {
          const token = localStorage.getItem("user-token");
          const { default: Api } = await import("@/utils/api");
          const res = await Api.get("/staff-register", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const list = Array.isArray(res.data) ? res.data : res.data.staffMatches || [];
          setStaffList(list.filter((s: any) => s.id !== currentUserId));
        } catch (error) {
          console.error("Failed to fetch staff", error);
        } finally {
          setIsLoadingStaff(false);
        }
      };
      fetchStaff();
    }
  }, [staffList.length, currentUserId]);

  const filteredStaffList = staffList.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const toggleStaffSelection = (id: number) => {
    setSelectedStaffIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const getShareLink = () => {
    const origin = window.location.origin;
    return `${origin}/notes?shareToken=${activeNote?.shareToken || activeNote?.id}`;
  };

  const handleCopyLink = () => {
    if (!activeNote) {
      setModalData({ type: "error", message: "Please save the note first." });
      return;
    }
    const link = getShareLink();
    navigator.clipboard.writeText(link);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 3000);
  };

  const handleSendNoteToDM = async () => {
    if (!activeNote || selectedStaffIds.length === 0) return;

    setIsSendingNote(true);
    try {
      const token = localStorage.getItem("user-token");
      const { default: Api } = await import("@/utils/api");

      // 1. Update Note shares on the backend so staff can view it
      const currentShares = activeNote.shares || [];
      const newShares = selectedStaffIds
        .filter(id => !currentShares.some((s: any) => s.staff?.id === id || s.staffId === id))
        .map(id => ({ staffId: id, permission: 'view' }));

      if (newShares.length > 0) {
        const formData = new FormData();
        const dto = {
          shares: [...currentShares, ...newShares]
        };
        formData.append("dto", JSON.stringify(dto));
        await Api.patch(`/notes/${activeNote.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      const shareLink = getShareLink();
      const messageText = `I shared a note with you: ${activeNote.title}\n\nClick here to view it: ${shareLink}`;

      for (const staffId of selectedStaffIds) {
        const convRes = await Api.post("/chat/conversations/dm", { targetUserId: staffId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const convId = convRes.data.id;

        const formData = new FormData();
        formData.append("dto", JSON.stringify({
          conversationId: convId,
          text: messageText,
          parentId: null
        }));

        await Api.post("/chat/messages", formData, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
        });
      }

      setModalData({ type: "success", message: "Note successfully shared and sent to selected staff DMs!" });
      onClose();
      window.location.href = "/chat";
    } catch (error) {
      console.error("Failed to send note to DM", error);
      setModalData({ type: "error", message: "Failed to send note. Please try again." });
    } finally {
      setIsSendingNote(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-[#1f1f1f] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-bold text-lg">Share Note</h3>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] p-1 rounded-full">
            &times;
          </button>
        </div>
        <div className="p-4 flex flex-col flex-1 overflow-hidden">
          <input
            type="text"
            placeholder="Search staff..."
            value={staffSearch}
            onChange={(e) => setStaffSearch(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-[#141414] focus:ring-2 focus:ring-[#95D700] outline-none mb-4"
          />

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
            {isLoadingStaff ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : filteredStaffList.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">No staff found.</p>
            ) : (
              filteredStaffList.map(staff => (
                <div key={staff.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded-lg cursor-pointer" onClick={() => toggleStaffSelection(staff.id)}>
                  <input
                    type="checkbox"
                    checked={selectedStaffIds.includes(staff.id)}
                    onChange={() => toggleStaffSelection(staff.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 text-[#95D700] rounded focus:ring-[#95D700]"
                  />
                  {staff.photoUrl ? (
                    <img src={staff.photoUrl} alt={staff.firstName} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                      {staff.firstName?.charAt(0)}{staff.lastName?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{staff.firstName} {staff.lastName}</p>
                    {staff.role && <p className="text-xs text-gray-500">{staff.role}</p>}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
            <button
              disabled={selectedStaffIds.length === 0 || isSendingNote}
              onClick={handleSendNoteToDM}
              className="w-full bg-[#95D700] text-white font-bold py-2 rounded-lg hover:bg-[#86c000] flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {isSendingNote ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              Send to DM ({selectedStaffIds.length})
            </button>
            <button onClick={handleCopyLink} className="w-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-200 font-bold py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-[#333] transition-colors flex items-center justify-center">
              {hasCopied ? (
                <>
                  <Check size={16} className="mr-2 text-green-500" /> Copied! Link is open for everyone
                </>
              ) : (
                <>
                  <LinkIcon size={16} className="mr-2" /> Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
