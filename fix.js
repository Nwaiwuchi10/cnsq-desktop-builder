const fs = require('fs');
const path = require('path');

const filePath = 'src/pages/chatForum/Channels/ChannelConverationView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add states at line 81
content = content.replace(
  '  const [messages, setMessages] = useState<Msg[]>([]);',
  `  const [messages, setMessages] = useState<Msg[]>([]);
  const [localIsLocked, setLocalIsLocked] = useState((conversation as any)?.isLocked || false);
  const [localMembers, setLocalMembers] = useState((conversation as any)?.members || []);

  useEffect(() => {
    setLocalIsLocked((conversation as any)?.isLocked || false);
    setLocalMembers((conversation as any)?.members || []);
  }, [conversation]);`
);

// 2. Add socket events at line 720
content = content.replace(
  `    socketRef.current.on("thread:reply_delete", (data: any) => {
      setThreadMessages((prev) => prev.filter((m: any) => m.id !== data.id));
      // Decrement reply count on main message
      setMessages((prev) =>
        prev.map((m) => {
          // We don't have messageId in delete payload from gateway, 
          // but we can find which message had this reply if we kept a mapping.
          // Alternatively, we can just assume it was the current thread if open.
          if (threadParentRef.current && m.id === threadParentRef.current.id) {
            return { ...m, repliesInThreadCount: Math.max(0, (m.repliesInThreadCount || 0) - 1) };
          }
          return m;
        }),
      );
    });

    return () => {`,
  `    socketRef.current.on("thread:reply_delete", (data: any) => {
      setThreadMessages((prev) => prev.filter((m: any) => m.id !== data.id));
      // Decrement reply count on main message
      setMessages((prev) =>
        prev.map((m) => {
          // We don't have messageId in delete payload from gateway, 
          // but we can find which message had this reply if we kept a mapping.
          // Alternatively, we can just assume it was the current thread if open.
          if (threadParentRef.current && m.id === threadParentRef.current.id) {
            return { ...m, repliesInThreadCount: Math.max(0, (m.repliesInThreadCount || 0) - 1) };
          }
          return m;
        }),
      );
    });

    socketRef.current.on("channel:lockedStatusChanged", (data: any) => {
      if (conversation?.id === data.channelId) {
        setLocalIsLocked(data.isLocked);
      }
    });

    socketRef.current.on("channel:memberRoleUpdated", (data: any) => {
      if (conversation?.id === data.channelId) {
        setLocalMembers((prev: any) =>
          prev.map((m: any) =>
            m.id === data.memberId ? { ...m, role: data.role } : m
          )
        );
      }
    });

    return () => {`
);

// 3. Update variables around line 1227
content = content.replace(
  `  const currentUserMember = (conversation as any)?.members?.find(
    (m: any) => m.user?.id === currentUserId || m.userId === currentUserId
  );
  const isUserAdmin = currentUserMember?.role === "admin" || currentUserMember?.role === "owner" || currentUserMember?.role === "ADMIN" || currentUserMember?.role === "OWNER";
  const isChannelLocked = (conversation as any)?.isLocked;`,
  `  const currentUserMember = localMembers.find(
    (m: any) => m.user?.id === currentUserId || m.userId === currentUserId
  );
  const isUserAdmin = currentUserMember?.role === "admin" || currentUserMember?.role === "owner" || currentUserMember?.role === "ADMIN" || currentUserMember?.role === "OWNER";
  const isChannelLocked = localIsLocked;`
);

// 4. Wrap the four input blocks using regex correctly
// Mobile block 1:
content = content.replace(
  '<div className="p-4 pb-safe pb-6 border-t bg-white dark:bg-[#141414] transition-colors md:hidden flex-shrink-0">',
  `{canSendMessage ? (
        <div className="p-4 pb-safe pb-6 border-t bg-white dark:bg-[#141414] transition-colors md:hidden flex-shrink-0">`
);

// We need to replace the exact </div> block at line ~2093.
content = content.replace(
  `                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= DESKTOP VIEW (unchanged) ================= */}`,
  `                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="p-4 pb-safe pb-6 border-t bg-white dark:bg-[#141414] transition-colors md:hidden flex-shrink-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">Only admins can send messages</span>
          </div>
        )}

        {/* ================= DESKTOP VIEW (unchanged) ================= */}`
);

// Desktop block 2:
content = content.replace(
  '<div className="p-4 border-t bg-white dark:bg-[#141414] transition-colors hidden md:flex flex-col gap-2">',
  `{canSendMessage ? (
        <div className="p-4 border-t bg-white dark:bg-[#141414] transition-colors hidden md:flex flex-col gap-2">`
);

content = content.replace(
  `                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Thread Side Panel */}`,
  `                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        ) : (
          <div className="p-4 border-t bg-white dark:bg-[#141414] transition-colors hidden md:flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">Only admins can send messages</span>
          </div>
        )}
      </div>

      {/* Thread Side Panel */}`
);

// Desktop Thread block 3:
content = content.replace(
  `            {/* Thread Input */}
            <div className="p-4 border-t bg-white dark:bg-[#141414]">`,
  `            {canSendMessage ? (
            <div className="p-4 border-t bg-white dark:bg-[#141414]">`
);

content = content.replace(
  `                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Thread Panel (Full-screen Overlay on sm/md) */}`,
  `                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            ) : (
              <div className="p-4 border-t bg-white dark:bg-[#141414] text-center text-sm text-gray-500">
                Only admins can send messages
              </div>
            )}
          </div>
        </>
      )}

      {/* Mobile Thread Panel (Full-screen Overlay on sm/md) */}`
);

// Mobile Thread block 4:
content = content.replace(
  `          {/* Mobile Thread Input */}
          <div className="p-3 pb-safe pb-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0">`,
  `          {canSendMessage ? (
          <div className="p-3 pb-safe pb-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0">`
);

content = content.replace(
  `                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forwarding Modal */}`,
  `                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            ) : (
              <div className="p-3 pb-safe pb-5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] flex-shrink-0 text-center text-sm text-gray-500">
                Only admins can send messages
              </div>
            )}
          </div>
        </div>
      )}

      {/* Forwarding Modal */}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed syntax');
