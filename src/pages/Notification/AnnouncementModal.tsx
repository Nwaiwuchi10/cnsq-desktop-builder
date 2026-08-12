"use client";

import React, { useEffect, useState } from "react";
import { X, Paperclip } from "lucide-react";
import Api from "@/utils/api";
import LoadingSpinner from "@/component/Loading/LoadingSpinner";
import { useRef } from "react";

interface AnnouncementModalProps {
  notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    isRead?: boolean;
    relatedProductDemo?: { id: number };
    relatedAnnouncement?: { id: number };
    relatedCeoMessageId?: string;
  };
  onClose: () => void;
}

interface DemoData {
  nameOfProduct: string;
  description: string;
  howItWorks: string;
  videos?: string[];
}

interface AnnouncementData {
  title: string;
  description: string;
  fileUrls?: string[];
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  notification,
  onClose,
}) => {
  const [details, setDetails] = useState<DemoData | AnnouncementData | null>(
    null,
  );
  console.log("notification", notification);
  const [isRead, setIsRead] = useState<boolean>(
    // For announcements: default to true immediately since the modal auto-marks as read on open.
    // For other types: reflect the notification's existing read status.
    // Use optional chaining to safely handle SSR pre-rendering where notification may be undefined.
    notification?.type === "announcement" ? true : !!notification?.isRead
  );
  const [isUpdatingRead, setIsUpdatingRead] = useState(false);
  const autoReadDone = useRef(false);

  const renderTextWithLinks = (text: string) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline break-words"
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        let endpoint = "";

        if (
          (notification.type === "new_product" ||
            notification.type === "demo") &&
          notification?.relatedProductDemo?.id
        ) {
          endpoint = `/adminproductdemo/${notification.relatedProductDemo.id}`;
        } else if (
          notification.type === "announcement" &&
          notification?.relatedAnnouncement?.id
        ) {
          endpoint = `/announcement/${notification.relatedAnnouncement.id}`;
        } else if (
          notification.type === "ceo_message" &&
          notification?.relatedCeoMessageId
        ) {
          endpoint = `/ceo-messaging-center/${notification.relatedCeoMessageId}`;
        }
        console.log("endpoint", endpoint);
        if (!endpoint) {
          console.warn(
            "No valid related ID found for notification:",
            notification,
          );
          return;
        }

        const res = await Api.get(endpoint);
        setDetails(res?.data);
      } catch (error) {
        console.error("Error loading details:", error);
      }
    };

    fetchDetails();
  }, [notification]);

  useEffect(() => {
    if (!notification?.id) return;

    const markAsRead = async () => {
      try {
        await Api.patch(`/notification/${notification.id}/read`, {
          isRead: true,
        });
      } catch (err) {
        console.error("Failed to mark notification as read", err);
      }
    };

    markAsRead();
  }, [notification?.id]);

  useEffect(() => {
    if (
      autoReadDone.current ||
      notification?.type !== "announcement" ||
      !notification?.relatedAnnouncement?.id
    )
      return;

    const token = localStorage.getItem("user-token") || "";

    const markAnnouncementAsRead = async () => {
      try {
        await Api.post(
          `/announcement/${notification?.relatedAnnouncement?.id}/read`,
          null, // no body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setIsRead(true);
        autoReadDone.current = true;
      } catch (err) {
        console.error("Failed to mark announcement as read", err);
      }
    };

    markAnnouncementAsRead();
  }, [notification?.relatedAnnouncement?.id]);

  useEffect(() => {
    if (
      autoReadDone.current ||
      notification?.type !== "ceo_message" ||
      !notification?.relatedCeoMessageId
    )
      return;

    const token = localStorage.getItem("user-token") || "";

    const markCeoMessageAsRead = async () => {
      try {
        await Api.post(
          `/ceo-messaging-center/mark-read/${notification.relatedCeoMessageId}`,
          null, // no body
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        autoReadDone.current = true;
      } catch (err) {
        console.error("Failed to mark CEO message as read", err);
      }
    };

    markCeoMessageAsRead();
  }, [notification?.relatedCeoMessageId]);

  const toggleReadStatus = async () => {
    if (!notification?.relatedAnnouncement?.id) return;

    setIsUpdatingRead(true);
    const token = localStorage.getItem("user-token") || "";
    try {
      if (isRead) {
        // MARK AS UNREAD
        await Api.delete(
          `/announcement/${notification.relatedAnnouncement.id}/unread`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setIsRead(false);
      } else {
        // MARK AS READ
        await Api.post(
          `/announcement/${notification.relatedAnnouncement.id}/read`,
          null, // no body needed
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setIsRead(true);
      }
    } catch (err) {
      console.error("Failed to toggle read status", err);
    } finally {
      setIsUpdatingRead(false);
    }
  };

  const [openedAt] = useState(() => new Date().toLocaleTimeString());

  if (!details)
    return (
      <div className="fixed inset-0 bg-gray-200 dark:bg-gray-800 transition-colors bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-[#141414] transition-colors p-6 rounded-xl w-full max-w-lg text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            <LoadingSpinner />
          </p>
        </div>
      </div>
    );

  if (!notification) return null;

  const isDemo =
    notification.type === "demo" || notification.type === "new_product";
  const isAnnouncement = notification.type === "announcement" || notification.type === "ceo_message";

  const demoDetails = details as DemoData;
  const announcementDetails = details as AnnouncementData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 h-full">
      <div className="bg-white dark:bg-[#141414] transition-colors rounded-2xl w-full max-w-2xl p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-400"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {notification.type === "ceo_message" && (
            <span className="px-2 py-0.5 bg-[#86CD23]/10 text-[#86CD23] text-[10px] font-black uppercase rounded-full tracking-wider whitespace-nowrap">
              CEO Message
            </span>
          )}
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis">
            {notification.title}
          </h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">{openedAt}</p>

        {/* Dynamic content */}
        {isDemo && (
          <>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
              {demoDetails.nameOfProduct}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
              {renderTextWithLinks(demoDetails.description)}
            </p>

            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              How it works
            </h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400 mb-4">
              {demoDetails.howItWorks?.split("\n").map((step, index) => (
                <li key={index}>{renderTextWithLinks(step)}</li>
              ))}
            </ol>

            {Array.isArray(demoDetails.videos) &&
              demoDetails.videos.length > 0 && (
                <div className="flex overflow-x-auto gap-3 pb-2">
                  {demoDetails.videos.map((videoUrl, i) => (
                    <div
                      key={i}
                      className="min-w-[600px] h-40 bg-gray-200 dark:bg-gray-800 transition-colors rounded-lg overflow-hidden relative"
                    >
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-contain bg-black"
                      />
                    </div>
                  ))}
                </div>
              )}
          </>
        )}

        {isAnnouncement && (
          <>
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
              {announcementDetails.title}
            </h3>
            <div 
              className="text-sm text-gray-600 dark:text-gray-400 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:mb-2 [&_a]:text-blue-600 [&_a]:underline [&_a]:break-words"
              dangerouslySetInnerHTML={{ __html: announcementDetails.description }}
            />

            {announcementDetails.fileUrls && announcementDetails.fileUrls.length > 0 && (
              <div className="mt-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">Attached Images</h4>
                <div className="flex flex-wrap gap-3">
                  {announcementDetails.fileUrls.map((fileUrl, i) => (
                    <div key={i} className="relative group">
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-32 h-32 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity"
                      >
                        <img
                          src={fileUrl}
                          alt={`Attachment ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notification.type === "announcement" && (
              <div className="flex items-center gap-3 mb-4 mt-4 p-3 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                <button
                  type="button"
                  onClick={toggleReadStatus}
                  disabled={isUpdatingRead}
                  aria-checked={isRead}
                  role="checkbox"
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                    isRead
                      ? "bg-lime-500 border-lime-500"
                      : "bg-white dark:bg-[#141414] border-gray-300 dark:border-gray-600 hover:border-lime-400"
                  } ${isUpdatingRead ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {isRead && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
                <span className={`text-sm font-medium transition-colors ${
                  isRead ? "text-lime-600 dark:text-lime-400" : "text-gray-600 dark:text-gray-400"
                }`}>
                  {isRead ? "Marked as read ✓" : "Mark as read"}
                </span>
                {isUpdatingRead && (
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">Saving...</span>
                )}
              </div>
            )}
          </>
        )}

        {/* Close Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-lime-500 hover:bg-lime-600 text-white text-sm px-6 py-2 rounded-md font-bold transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
