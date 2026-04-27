import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

interface Props {
  onAddMember: () => void;
  onViewMembers: () => void;
  onRemoveMember: () => void;
}

const VerticalOptionsMenu: React.FC<Props> = ({
  onAddMember,
  onViewMembers,
  onRemoveMember,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors rounded-full"
      >
        <BsThreeDotsVertical size={22} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#141414] transition-colors shadow-lg rounded-lg z-50 border">
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            onClick={() => {
              setOpen(false);
              onAddMember();
            }}
          >
            ➕ Add Member
          </button>

          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors"
            onClick={() => {
              setOpen(false);
              onViewMembers();
            }}
          >
            👥 View Members
          </button>

          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800 transition-colors text-red-600"
            onClick={() => {
              setOpen(false);
              onRemoveMember();
            }}
          >
            ❌ Remove Member
          </button>
        </div>
      )}
    </div>
  );
};

export default VerticalOptionsMenu;
