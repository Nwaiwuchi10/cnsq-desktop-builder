"use client";

import React from "react";
import { useRouter } from "next/navigation";
import MessageCeoCreateForm from "@/component/MessageCEO/MessageCeoCreateForm";
import StaffLayout from "@/layouts/StaffLayout/StaffLayout";

export default function CreateMessagePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/ceos_corner");
  };

  return (
    <StaffLayout>
      <div className="w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Create Message
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Send a direct message to the CEO
          </p>
        </div>

        {/* Form Container */}
        <MessageCeoCreateForm onSuccess={handleSuccess} />
      </div>
    </StaffLayout>
  );
}
