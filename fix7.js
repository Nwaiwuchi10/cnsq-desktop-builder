const fs = require('fs');
const filePath = 'src/pages/chatForum/Channels/ChannelConverationView.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `  const pinnedMessages = messages.filter((m) => m.pinned);
  const latestPinnedMessage = pinnedMessages[pinnedMessages.length - 1];

  return (`,
  `  const pinnedMessages = messages.filter((m) => m.pinned);
  const latestPinnedMessage = pinnedMessages[pinnedMessages.length - 1];

  const currentUserMember = localMembers.find(
    (m: any) => m.user?.id === currentUserId || m.userId === currentUserId
  );
  const isUserAdmin = currentUserMember?.role === "admin" || currentUserMember?.role === "owner" || currentUserMember?.role === "ADMIN" || currentUserMember?.role === "OWNER";
  const isChannelLocked = localIsLocked;
  const canSendMessage = !isChannelLocked || isUserAdmin;

  return (`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed variables');
