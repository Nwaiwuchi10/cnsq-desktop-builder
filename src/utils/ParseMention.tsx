import React, { ReactNode, ReactElement } from "react";

export default function parseMentions(content: ReactNode): ReactNode {
  // 1. STRING
  if (typeof content === "string") {
    return content.split(/(@\w+)/g).map((part, idx) =>
      part.startsWith("@") ? (
        <span key={idx} className="text-lime-900 font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
  }

  // 2. ARRAY
  if (Array.isArray(content)) {
    return content.map((child, i) => (
      <React.Fragment key={i}>{parseMentions(child)}</React.Fragment>
    ));
  }

  // 3. REACT ELEMENT
  if (React.isValidElement(content)) {
    const el = content as ReactElement<any>; // <-- FIX: force element with typed props

    const children = el.props?.children;

    return React.cloneElement(
      el,
      { ...el.props }, // props are now a real object, not {}
      parseMentions(children)
    );
  }

  // 4. EVERYTHING ELSE
  return content;
}
