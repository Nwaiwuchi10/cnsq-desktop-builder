"use client";

import React from "react";
import { X, Mail, Phone, ShieldCheck, User } from "lucide-react";

interface ContactInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    name: string;
    avatar?: string | null;
    email?: string;
    phone?: string;
    role?: string;
    online?: boolean;
  } | null;
}

export const ContactInfoDrawer: React.FC<ContactInfoDrawerProps> = ({
  isOpen,
  onClose,
  contact,
}) => {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white dark:bg-[#141414] border-l border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-300 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-gray-900 dark:text-white text-base">
          Contact Info
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <X size={20} />
        </button>
      </div>

      {/* Profile Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col items-center text-center">
          {contact.avatar ? (
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-lime-500 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {contact.name.charAt(0)}
            </div>
          )}

          <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
            {contact.name}
          </h2>

          <div className="flex items-center gap-1.5 mt-1">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                contact.online ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {contact.online ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {contact.role && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <ShieldCheck size={20} className="text-lime-500" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Role / Department</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {contact.role}
                </p>
              </div>
            </div>
          )}

          {contact.email && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <Mail size={20} className="text-lime-500" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Email Address</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 break-all">
                  {contact.email}
                </p>
              </div>
            </div>
          )}

          {contact.phone && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
              <Phone size={20} className="text-lime-500" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Phone Number</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {contact.phone}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoDrawer;
