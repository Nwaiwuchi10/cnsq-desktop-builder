"use client";

import React, { useState } from "react";

interface TruncatedTextProps {
  text: React.ReactNode | string;
  maxLength?: number;
  className?: string;
  isMe?: boolean;
}

export const TruncatedText: React.FC<TruncatedTextProps> = ({
  text,
  maxLength = 300,
  className = "",
  isMe = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const buttonColor = isMe
    ? "text-yellow-200 hover:text-white font-bold"
    : "text-lime-600 hover:text-lime-700 dark:text-lime-400 font-bold";

  if (typeof text === "string") {
    if (text.length <= maxLength) {
      return <span className={className}>{text}</span>;
    }
    const displayText = expanded ? text : `${text.slice(0, maxLength)}...`;
    return (
      <span className={className}>
        <span className="whitespace-pre-wrap">{displayText}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={`text-xs underline ml-1 cursor-pointer inline-block ${buttonColor}`}
        >
          {expanded ? "Show less" : "...Read more"}
        </button>
      </span>
    );
  }

  const textString = extractStringFromNode(text);
  if (textString.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {expanded ? (
        <span>{text}</span>
      ) : (
        <span className="whitespace-pre-wrap">
          {textString.slice(0, maxLength)}...
        </span>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className={`text-xs underline ml-1 cursor-pointer inline-block ${buttonColor}`}
      >
        {expanded ? "Show less" : "...Read more"}
      </button>
    </span>
  );
};

function extractStringFromNode(node: React.ReactNode): string {
  if (!node) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractStringFromNode).join("");
  if (React.isValidElement(node) && (node.props as any)?.children) {
    return extractStringFromNode((node.props as any).children);
  }
  return "";
}

export default TruncatedText;
