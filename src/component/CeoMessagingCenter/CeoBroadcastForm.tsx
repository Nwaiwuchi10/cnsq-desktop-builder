import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Send, 
  Paperclip, 
  Users, 
  Type, 
  Bold, 
  Italic, 
  List,
  FileText,
  Loader2,
  Search,
  Check
} from "lucide-react";
import Api from "@/utils/api";
import CustomModal from "../Message/Message";

interface StaffMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface CeoBroadcastFormProps {
  message?: any; // For editing
  onClose: () => void;
  onSuccess: () => void;
}

const CeoBroadcastForm: React.FC<CeoBroadcastFormProps> = ({ message, onClose, onSuccess }) => {
  const [title, setTitle] = useState(message?.title || "");
  const [description, setDescription] = useState(message?.description || "");
  const [isAllStaff, setIsAllStaff] = useState(message?.isAllStaff ?? true);
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>(
    message?.recipients?.map((r: any) => r.id) || []
  );
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStaff();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await Api.get("/staff-register");
      setStaffList(res.data || []);
    } catch (error) {
      console.error("Error fetching staff registry:", error);
    }
  };

  const toggleStaff = (id: number) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const filteredStaff = staffList.filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStaffNames = staffList.filter(s => selectedStaffIds.includes(s.id));

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setModal({ type: "error", message: "Please enter both title and message content." });
      return;
    }

    if (!isAllStaff && selectedStaffIds.length === 0) {
      setModal({ type: "error", message: "Please select at least one recipient." });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("user-token");
      const formData = new FormData();
      
      const dto = {
        title,
        description,
        isAllStaff,
        recipientIds: isAllStaff ? [] : selectedStaffIds
      };

      formData.append("dto", JSON.stringify(dto));
      files.forEach(file => formData.append("files", file));

      if (message?.id) {
        await Api.patch(`/ceo-messaging-center/${message.id}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
      } else {
        await Api.post("/ceo-messaging-center", formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data" 
          }
        });
      }

      setModal({ 
        type: "success", 
        message: "Message broadcasted successfully!"
      });
      
      setTimeout(() => {
        setModal(null);
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setModal({ 
        type: "error", 
        message: error.response?.data?.message || "Failed to process message." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#141414] w-full max-w-xl rounded-[24px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/5">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#1a1a1a]/50">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
              {message?.id ? "Edit Message" : "New Broadcast Message"}
            </h2>
            <p className="text-gray-500 text-[10px] font-medium uppercase tracking-wider">Announcement for staff</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {/* Target Selection */}
            <div className="space-y-1.5" ref={dropdownRef}>
              <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Target Audience</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setIsAllStaff(true)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                    isAllStaff 
                      ? "bg-[#86CD23]/10 border-[#86CD23] text-[#86CD23]" 
                      : "bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 text-gray-400"
                  }`}
                >
                  <Users size={16} />
                  All Staff
                </button>
                <button
                  type="button"
                  onClick={() => setIsAllStaff(false)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-bold transition-all ${
                    !isAllStaff 
                      ? "bg-[#86CD23]/10 border-[#86CD23] text-[#86CD23]" 
                      : "bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 text-gray-400"
                  }`}
                >
                  <Users size={16} />
                  Specific Staff
                </button>
              </div>

              {!isAllStaff && (
                <div className="relative animate-in slide-in-from-top-2 duration-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search staff members..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#86CD23]/20 focus:border-[#86CD23] transition-all font-bold text-sm"
                    />
                  </div>

                  {showDropdown && (
                    <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl max-h-[200px] overflow-y-auto">
                      {filteredStaff.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400 font-bold">No staff found</div>
                      ) : (
                        filteredStaff.map(staff => (
                          <div
                            key={staff.id}
                            onClick={() => toggleStaff(staff.id)}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border-b border-gray-50 dark:border-white/5 last:border-0"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{staff.firstName} {staff.lastName}</span>
                              <span className="text-[10px] text-gray-400">{staff.email}</span>
                            </div>
                            {selectedStaffIds.includes(staff.id) && (
                              <div className="bg-[#86CD23] rounded-full p-1">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedStaffNames.map(staff => (
                      <div 
                        key={staff.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-white/5 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10"
                      >
                        {staff.firstName}
                        <button onClick={() => toggleStaff(staff.id)} className="hover:text-red-500">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {selectedStaffIds.length > 0 && (
                      <button 
                        onClick={() => setSelectedStaffIds([])}
                        className="text-[10px] font-black text-red-500 hover:underline px-2"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Title Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Message Title</label>
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter message title..."
                  className="w-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#86CD23]/20 focus:border-[#86CD23] transition-all font-bold text-sm"
                />
              </div>
            </div>

            {/* Content Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Message Body</label>
              <div className="relative bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#86CD23]/20 focus-within:border-[#86CD23] transition-all">
                {/* Editor Toolbar */}
                <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-black/20">
                  <button className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-md text-gray-400 transition-colors"><Bold size={14} /></button>
                  <button className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-md text-gray-400 transition-colors"><Italic size={14} /></button>
                  <button className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-md text-gray-400 transition-colors"><List size={14} /></button>
                  <div className="w-[1px] h-3 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                  <button className="p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded-md text-gray-400 transition-colors"><Type size={14} /></button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write your announcement detail here..."
                  rows={4}
                  className="w-full bg-transparent p-4 focus:outline-none font-medium text-sm resize-none text-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest pl-1">Attachments</label>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-[#86CD23] text-xs font-bold hover:underline"
                >
                  <Paperclip size={14} />
                  Add files
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  multiple 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>

              {files.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700 group">
                      <span className="text-[10px] font-bold text-gray-600 truncate max-w-[100px]">{file.name}</span>
                      <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#86CD23] hover:bg-[#7ab520] text-black rounded-xl font-black text-sm transition-all shadow-lg shadow-[#86CD23]/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Send Broadcast Now
            </button>
          </div>
        </div>
      </div>

      {modal && (
        <CustomModal 
          type={modal.type} 
          message={modal.message} 
          onClose={() => setModal(null)} 
        />
      )}
    </div>
  );
};

export default CeoBroadcastForm;
