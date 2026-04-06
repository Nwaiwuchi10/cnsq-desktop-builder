"use client";

import React from "react";
import MessageCeoModal from "@/component/MessageCEO/MessageCEO";

export default function CeosCornerPage() {
  return (
    <MessageCeoModal
      isOpen={true}
      onClose={() => {
        if (typeof window !== "undefined") {
          window.history.back();
        }
      }}
    />
  );
}
