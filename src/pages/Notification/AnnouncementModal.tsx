"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Api from "@/utils/api";

interface AnnouncementModalProps {
  notification: {
    id: number;
    type: string;
    title: string;
    message: string;
    relatedProductDemo?: { id: number };
    relatedAnnouncement?: { id: number };
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
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  notification,
  onClose,
}) => {
  const [details, setDetails] = useState<DemoData | AnnouncementData | null>(
    null
  );

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
        }

        if (!endpoint) {
          console.warn(
            "No valid related ID found for notification:",
            notification
          );
          return;
        }

        const res = await Api.get(endpoint);
        setDetails(res.data);
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

  if (!details)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-full max-w-lg text-center">
          <p className="text-gray-500 text-sm">Loading details...</p>
        </div>
      </div>
    );

  const isDemo =
    notification.type === "demo" || notification.type === "new_product";
  const isAnnouncement = notification.type === "announcement";

  const demoDetails = details as DemoData;
  const announcementDetails = details as AnnouncementData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-800 mb-1">
          {notification.title}
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          {new Date().toLocaleTimeString()}
        </p>

        {/* Dynamic content */}
        {isDemo && (
          <>
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              {demoDetails.nameOfProduct}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {demoDetails.description}
            </p>

            <h4 className="text-sm font-medium text-gray-800 mb-2">
              How it works
            </h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 mb-4">
              {demoDetails.howItWorks?.split("\n").map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>

            {/* ✅ Safe check before mapping videos */}
            {Array.isArray(demoDetails.videos) &&
              demoDetails.videos.length > 0 && (
                <div className="flex overflow-x-auto gap-3 pb-2">
                  {demoDetails.videos.map((videoUrl, i) => (
                    <div
                      key={i}
                      className="min-w-[300px] h-40 bg-gray-200 rounded-lg overflow-hidden relative"
                    >
                      <video
                        src={videoUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
          </>
        )}

        {isAnnouncement && (
          <>
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              {announcementDetails.title}
            </h3>
            <p className="text-sm text-gray-600">
              {announcementDetails.description}
            </p>
          </>
        )}

        {/* Close Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="bg-lime-500 hover:bg-lime-600 text-white text-sm px-6 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
