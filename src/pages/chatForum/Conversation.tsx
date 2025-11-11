"use client";
import Footer from "@/component/Footer/Footer";
import Navbar from "@/component/Navbar/Navbar";
import React, { useState } from "react";

// Messages layout for Next.js + Tailwind CSS
// Single-file component with a separate Navbar export as requested.
// Drop this file in your components/ folder (e.g. components/MessagesLayout.tsx)
// Then render <MessagesLayout /> from a page.

type Msg = {
  id: string;
  name: string;
  avatar?: string;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
};

const SAMPLE: Msg[] = [
  {
    id: "1",
    name: "Ezinne Chijioke",
    preview: "I left a message for you on figma, could you ple..",
    time: "5 min ago",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Ebele Okafor",
    preview:
      "Yes, I just pushed the new version to Figma. Want me to share the link",
    time: "5 min ago",
    online: true,
  },
  {
    id: "3",
    name: "Oluwaseun Adebayo",
    preview:
      'Hi Tobi, a user reported a "payment failed" error during subscription',
    time: "2 hrs ago",
  },
  {
    id: "4",
    name: "Emeka Nnaji",
    preview:
      "Hey Tobi, can you check why the analytics dashboard is loading so....",
    time: "5 min ago",
    online: true,
  },
  {
    id: "5",
    name: "Grace Kofo",
    preview: "Are you available for a quick call today?",
    time: "5 min ago",
  },
];

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-transparent p-4">
      {/* Keep this intentionally minimal — you said you already have a navbar. */}
      <div className="max-w-6xl mx-auto flex items-center gap-3">
        <button className="p-2 rounded-md">◀</button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
            TJ
          </div>
          <div>
            <div className="font-semibold">Tobi Jakes</div>
            <div className="text-xs text-green-500">Online</div>
          </div>
        </div>
      </div>
    </header>
  );
};

const Avatar: React.FC<{ name: string; size?: number; online?: boolean }> = ({
  name,
  size = 44,
  online,
}) => {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="relative">
      <div
        className="flex items-center justify-center rounded-full text-sm font-semibold"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg,#f97316,#fb7185)",
          color: "white",
        }}
      >
        {initials}
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -left-0.5 w-3 h-3 rounded-full bg-green-400 ring-2 ring-white" />
      )}
    </div>
  );
};

const ConversationItem: React.FC<{ item: Msg; onClick: () => void }> = ({
  item,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-3 flex gap-4 items-start shadow-md cursor-pointer hover:shadow-lg transition-shadow"
    >
      <Avatar name={item.name} online={item.online} />
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="font-semibold text-gray-800">{item.name}</div>
          <div className="text-xs text-gray-400">{item.time}</div>
        </div>
        <div className="text-sm text-gray-500 mt-1 truncate">
          {item.preview}
        </div>
      </div>
      {item.unread ? (
        <div className="flex items-center">
          <div className="text-xs bg-orange-400 text-white rounded-full px-2 py-0.5">
            {item.unread}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const ConversationList: React.FC<{
  items: Msg[];
  onSelect: (id: string) => void;
}> = ({ items, onSelect }) => {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div>
        <label className="relative block">
          <span className="sr-only">Search</span>
          <input
            className="placeholder-gray-400 block w-full rounded-lg border border-gray-200 bg-white p-3 shadow-inner"
            placeholder="Search by name or conversation.........."
          />
        </label>
      </div>

      {/* Filter pills */}
      <div className="flex gap-3">
        <button className="px-4 py-1 rounded-full bg-lime-500 text-white text-sm">
          All
        </button>
        <button className="px-4 py-1 rounded-full bg-gray-100 text-sm">
          Unread
        </button>
        <button className="px-4 py-1 rounded-full bg-gray-100 text-sm">
          Archived
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <ConversationItem
            key={it.id}
            item={it}
            onClick={() => onSelect(it.id)}
          />
        ))}
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{
  text: string;
  me?: boolean;
  time?: string;
}> = ({ text, me, time }) => {
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div
        className={`${
          me
            ? "rounded-bl-xl rounded-tl-xl rounded-tr-xl"
            : "rounded-br-xl rounded-tr-xl rounded-tl-xl"
        } p-4 max-w-[70%]`}
        style={{
          background: me ? "#10b981" : "#E6EEF7",
          color: me ? "white" : "#1f2937",
        }}
      >
        <div className="text-sm leading-relaxed">{text}</div>
        {time && (
          <div
            className={`text-xs mt-2 ${
              me ? "text-green-50/80" : "text-gray-400"
            }`}
          >
            {time}
          </div>
        )}
      </div>
    </div>
  );
};

const ConversationView: React.FC<{
  id: string | null;
  onBack?: () => void;
}> = ({ id, onBack }) => {
  // static messages to mimic the screenshot
  const messages = [
    {
      id: "m1",
      text: "Hello! Thank you for reaching out to Lagos Tech Solutions. How can we assist you with your business technology needs today?",
      me: false,
      time: "10:30 AM",
    },
    {
      id: "m2",
      text: "Hi there! I'm interested in your cloud services for my business. Do you offer any packages specifically for small businesses?",
      me: true,
      time: "10:32 AM",
    },
    {
      id: "m3",
      text: 'Yes, we do! We have several packages tailored for small businesses in Nigeria. Our "StartUp Cloud" package includes:\n\n• 5TB secure cloud storage\n• Business email accounts\n• Basic website hosting\n• 24/7 technical support',
      me: false,
      time: "10:35 AM",
    },
    {
      id: "m4",
      text: "That sounds perfect for what we need! Yes, please send the brochure. Also, do you offer any discounts for annual subscriptions?",
      me: true,
      time: "10:36 AM",
    },
    {
      id: "m5",
      text: "Great! I'll email the brochure to you right away. And yes, we do offer a 15% discount for annual subscriptions, plus an additional 5% for ClubConnect members 😊",
      me: false,
      time: "10:38 AM",
    },
    {
      id: "m6",
      text: "That's excellent news! I'm already a ClubConnect member, so that additional discount would be very helpful.",
      me: true,
      time: "10:40 AM",
    },
    {
      id: "m7",
      text: "Would it be possible to schedule a demo of your services sometime this week?",
      me: true,
      time: "10:41 AM",
    },
    {
      id: "m8",
      text: "Absolutely! We have availability on Thursday and Friday this week. Would either of those days work for you? We can do a virtual demo via Zoom or an in-person demonstration at our office in Victoria Island.",
      me: false,
      time: "10:45 AM",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 px-4 py-3 border-b">
        <button onClick={onBack} className="md:hidden p-2">
          ◀
        </button>
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          TJ
        </div>
        <div className="flex-1">
          <div className="font-semibold">Tobi Jakes</div>
          <div className="text-xs text-green-500">Online</div>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button className="p-2">👤</button>
          <button className="p-2">⋮</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white/5">
        <div className="flex items-center justify-center text-sm text-gray-400">
          You connected with Lagos Tech Solutions on July 2
        </div>
        <div className="flex items-center justify-center text-sm text-gray-400">
          Today
        </div>

        <div className="space-y-4 mt-6">
          {messages.map((m) => (
            <MessageBubble key={m.id} text={m.text} me={m.me} time={m.time} />
          ))}
        </div>
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex items-center gap-3">
          <button className="p-2">＋</button>
          <input
            className="flex-1 rounded-full border px-4 py-2"
            placeholder="Type a message..."
          />
          <button className="p-3 rounded-full bg-green-500 text-white">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

const MessagesLayout: React.FC = () => {
  const [selected, setSelected] = useState<string | null>("1");

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#0b0b0b] text-gray-100 p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Left column: list (desktop) */}
          <div className="col-span-1 lg:col-span-1">
            <h1 className="text-3xl font-semibold text-slate-300">
              Your Messages
            </h1>
            <p className="text-sm text-slate-400 mt-2">
              Manage your conversations and connect with fellow members.
            </p>

            <div className="mt-6">
              <ConversationList
                items={SAMPLE}
                onSelect={(id) => setSelected(id)}
              />
            </div>
          </div>

          {/* Middle column: a spacer to match layout and responsiveness */}
          <div className="hidden lg:block lg:col-span-1" />

          {/* Right column: conversation view on large screens, or full-screen on mobile */}
          <div className="col-span-1 lg:col-span-1 bg-white rounded-lg h-[80vh] overflow-hidden">
            <ConversationView id={selected} onBack={() => setSelected(null)} />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MessagesLayout;
