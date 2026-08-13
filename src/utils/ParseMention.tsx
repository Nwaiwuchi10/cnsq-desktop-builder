import React, { ReactNode, ReactElement } from "react";

export default function parseMentions(content: ReactNode): ReactNode {
  // 1. STRING
  if (typeof content === "string") {
    return content.split(/(@\w+)/g).map((part, idx) =>
      part.startsWith("@") ? (
        <span key={idx} className="bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-semibold px-1.5 py-0.5 rounded text-[14px] transition-colors cursor-pointer inline-block mx-0.5">
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
