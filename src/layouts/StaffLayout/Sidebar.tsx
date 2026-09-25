"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cake,
  Medal,
  UserPlus,
  Briefcase,
  ClipboardList,
  MessageSquare,
  Mail,
  Calendar,
  Settings,
  X,
  PanelLeftClose,
  PanelRightClose,
  Book,
  BookOpen,
  Send,
  ClipboardCheck,
  Printer
} from "lucide-react";

type NavItem = {
  name: string;
  href?: string;
  icon: React.ElementType;
  isCeoOnly?: boolean;
  subItems?: { name: string; href: string; icon?: React.ElementType }[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};
import Image from "next/image";
import imgHome from "../../assests/images/CNSQ.png";

type User = {
  uuid: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  isCeo?: boolean;
  employment?: {
    departmentalRole?: {
      title?: string;
    };
  };
};

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  user?: User | null;
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [{ name: "Dashboard", href: "/staff-dashboard", icon: LayoutDashboard }],
  },

  {
    title: "WORK",
    items: [
      { name: "Projects", href: "/project", icon: Briefcase },
      { name: "Tasks", href: "/task", icon: ClipboardList },
      { name: "Notes", href: "/notes", icon: Book },
    ],
  },
  {
    title: "COMMUNICATION",
    items: [
      { name: "Chat", href: "/chat", icon: MessageSquare },
      { name: "Ticketing", href: "/ticketing", icon: ClipboardCheck },
      { name: "CEO's Corner", href: "/ceos-corner", icon: Mail },
      { name: "CEO's Messaging", href: "/ceo-messaging", icon: Send, isCeoOnly: true },
    ],
  },
  {
    title: "PLANNING",
    items: [
      { name: "Calendar", href: "/calender", icon: Calendar },
      { name: "Leave Management", href: "/leave-management", icon: ClipboardList },
      { name: "Pipeline", href: "/pipeline", icon: Printer },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Documentation", href: "/documentation", icon: BookOpen },
    ],
  },
  {
    title: "CELEBRATIONS",
    items: [
      { name: "Birthdays", href: "/birthday", icon: Cake },
      { name: "Anniversaries", href: "/anniversary", icon: Medal },
      { name: "New Hires", href: "/new-hire", icon: UserPlus },
    ],
  },
  {
    title: "CEO TOOLS",
    items: [
      {
        name: "Governance",
        icon: Settings,
        isCeoOnly: true,
        subItems: [
          { name: "Activity Logs", href: "/ceo-activity-logs", icon: ClipboardCheck }
        ]
      },
    ],
  },
];

import { leaveApi } from "@/modules/LeaveManagement/services/leaveApi";

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen, user }) => {
  // Using a mock path for this implementation since it will be mounted somewhere
  const pathname = usePathname();
  const [isSupervisor, setIsSupervisor] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  const toggleDropdown = (name: string) => {
    setOpenDropdowns(prev => ({ ...prev, [name]: !prev[name] }));
  };

  React.useEffect(() => {
    if (user) {
      // Use lightweight check endpoint to determine supervisor status
      leaveApi.isSupervisorCheck()
        .then(res => setIsSupervisor(res.isSupervisor))
        .catch(() => setIsSupervisor(false));
    }
  }, [user]);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`pwa-sidebar fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-[#141414] border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? "lg:w-[80px]" : "lg:w-[260px]"} w-[260px]`}
      >
        {/* Logo and Toggle Header */}
        <div className="pwa-sidebar-header h-20 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <div className={`flex items-center overflow-hidden transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}>
            <Link href="/">
              <Image src={imgHome} alt="logo" width={110} height={50} unoptimized />
            </Link>
          </div>

          <button onClick={toggleCollapse} className="hidden lg:flex p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            {isCollapsed ? <PanelRightClose className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          {navSections.map((section, idx) => {
            // Filter items based on role and section specific rules
            const filteredItems = section.items.filter(item => {
              if (item.isCeoOnly && !user?.isCeo) return false;

              // Special case for CEO's Corner: hide for CEO
              if (item.name === "CEO's Corner" && user?.isCeo) return false;

              // Supervisor story: (optional logic if needed here, but keeping it simple for now)
              // if (item.name === "Leave Approvals" && !isSupervisor) return false;

              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} className="mb-6">
                {!isCollapsed && (
                  <h3 className="px-6 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider">
                    {section.title}
                  </h3>
                )}
                <ul className="space-y-1">
                  {filteredItems.map((item, itemIdx) => {
                    const isActive = pathname === item.href;
                    const isDropdownOpen = openDropdowns[item.name];
                    const hasSubItems = item.subItems && item.subItems.length > 0;

                    if (hasSubItems) {
                      const isSubActive = item.subItems?.some(sub => pathname === sub.href);
                      return (
                        <li key={itemIdx} className="flex flex-col">
                          <button
                            onClick={() => toggleDropdown(item.name)}
                            className={`flex items-center justify-between w-full px-6 py-2 transition-colors group ${isSubActive
                              ? "text-[#86CD23] font-medium"
                              : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[#86CD23] dark:hover:text-[#86CD23]"
                              }`}
                            title={isCollapsed ? item.name : undefined}
                          >
                            <div className="flex items-center">
                              <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isSubActive ? "text-[#86CD23]" : "text-gray-500 dark:text-gray-400 group-hover:text-[#86CD23] dark:group-hover:text-[#86CD23]"}`} />
                              {!isCollapsed && (
                                <span className="ml-3 truncate">{item.name}</span>
                              )}
                            </div>
                            {!isCollapsed && (
                              <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            )}
                          </button>

                          {/* Dropdown Items */}
                          {isDropdownOpen && !isCollapsed && (
                            <ul className="mt-1 space-y-1 bg-gray-50/50 dark:bg-[#1a1a1a]/50 py-2 border-y border-gray-100 dark:border-gray-800">
                              {item.subItems?.map((sub, subIdx) => {
                                const isSubItemActive = pathname === sub.href;
                                return (
                                  <li key={subIdx}>
                                    <Link
                                      href={sub.href}
                                      className={`flex items-center px-6 pl-12 py-2 transition-colors text-sm group ${isSubItemActive
                                        ? "text-[#86CD23] font-medium"
                                        : "text-gray-500 dark:text-gray-400 hover:text-[#86CD23] dark:hover:text-[#86CD23]"
                                        }`}
                                    >
                                      {sub.icon && <sub.icon className="w-4 h-4 mr-2" />}
                                      <span className="truncate">{sub.name}</span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </li>
                      );
                    }

                    return (
                      <li key={itemIdx}>
                        <Link
                          href={item.href || "#"}
                          className={`flex items-center px-6 py-2 transition-colors group ${isActive
                            ? "text-[#86CD23] font-medium"
                            : "text-gray-600 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-[#86CD23] dark:hover:text-[#86CD23]"
                            }`}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <item.icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-[#86CD23]" : "text-gray-500 dark:text-gray-400 group-hover:text-[#86CD23] dark:group-hover:text-[#86CD23]"}`} />
                          {!isCollapsed && (
                            <span className="ml-3 truncate">{item.name}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">

          <div className="flex items-center border-t border-gray-200 dark:border-gray-800 pt-4 px-2">
            {user?.photoUrl ? (
              <Image src={user.photoUrl} alt="profile" width={40} height={40} className="rounded-full object-cover shrink-0 h-10 w-10" unoptimized />
            ) : (
              <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-full bg-[#a1e508] text-black font-semibold uppercase">
                {user ? `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}` : "U"}
              </div>
            )}
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.employment?.departmentalRole?.title || "Staff"}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
