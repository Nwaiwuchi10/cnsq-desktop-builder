"use client";
import React from "react";
import Image from "next/image";

type AvatarProps = {
  name?: string; // make optional to avoid runtime crash
  src?: string;
  online?: boolean;
  size?: number; // default: 40
};

const Avatar: React.FC<AvatarProps> = ({
  name = "?",
  src,
  online,
  size = 40,
}) => {
  const initials =
    name
      ?.trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div
          className={`rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold`}
          style={{ width: size, height: size, fontSize: size / 2.5 }}
        >
          {initials}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

export default Avatar;
