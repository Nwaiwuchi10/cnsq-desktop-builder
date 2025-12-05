import React, { ReactNode } from "react";

interface MessageBubbleProps {
  text: ReactNode;
  me?: boolean;
  time?: string;
  selected?: boolean;
  authorName?: string;
  avatar?: string | null;
  onClick?: () => void;
}

const ChannelMessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  me,
  time,
  selected,
  authorName,
  avatar,
  onClick,
}) => {
  return (
    <div
      className={`flex ${
        me ? "justify-end" : "justify-start"
      } gap-2 items-start`}
    >
      {/* Avatar */}
      {avatar && (
        <img
          src={avatar}
          alt="avatar"
          className={`w-8 h-8 rounded-full object-cover ${
            me ? "order-last ml-2" : "mr-2"
          }`}
        />
      )}

      {/* Bubble + Author */}
      <div className="flex flex-col">
        {/* Author name */}
        {authorName && (
          <div className="text-xs font-semibold text-gray-600 mb-1">
            {authorName}
          </div>
        )}

        {/* Message bubble */}
        <div
          onClick={onClick}
          className={`p-4 max-w-[100%] shadow-sm break-words relative cursor-pointer
            ${selected ? "ring-2 ring-green-500" : ""}
            ${
              me
                ? "bg-[#10b981] text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl"
                : "bg-[#E6EEF7] text-gray-800 rounded-br-xl rounded-tr-xl rounded-tl-xl"
            }`}
        >
          <div className="text-sm leading-relaxed">{text}</div>

          {time && (
            <div
              className={`text-xs mt-2 ${
                me ? "text-green-50/80" : "text-gray-500"
              }`}
            >
              {time}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelMessageBubble;

// import React, { ReactNode } from "react";

// interface MessageBubbleProps {
//   text: ReactNode;
//   me?: boolean;
//   time?: string;
//   selected?: boolean; // NEW
//   authorName?: string;
//   avatar?: string | null;
//   onClick?: () => void;
// }

// const ChannelMessageBubble: React.FC<MessageBubbleProps> = ({
//   text,
//   me,
//   time,
//   selected,
//   onClick,
// }) => {
//   return (
//     <div className={`flex ${me ? "justify-end" : "justify-start"} `}>
//       <div
//         onClick={onClick}
//         className={`p-4 max-w-[70%] shadow-sm break-words relative cursor-pointer
//       ${selected ? "ring-2 ring-green-500 cursor-pointer" : ""}
//       ${
//         me
//           ? "bg-[#10b981] text-white rounded-bl-xl rounded-tl-xl rounded-tr-xl"
//           : "bg-[#E6EEF7] text-gray-800 rounded-br-xl rounded-tr-xl rounded-tl-xl"
//       }`}
//       >
//         <div className="text-sm leading-relaxed">{text}</div>
//         {time && (
//           <div
//             className={`text-xs mt-2 ${
//               me ? "text-green-50/80" : "text-gray-500"
//             }`}
//           >
//             {time}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChannelMessageBubble;
