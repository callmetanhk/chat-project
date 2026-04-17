import React, { useMemo } from "react";
import { ChatMessage } from "./ChatMessage";

export const MessageList = ({ messages, user, bottomRef, selectedChat }) => {
  
  // Hàm duy nhất xử lý URL ảnh
  const getAvatarUrl = (url) => {
    if (!url || url === "") return "/default-avatar.png";
    if (url.startsWith("http")) return url;
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:8000${cleanPath}`;
  };

  const renderedMessages = useMemo(() => {
    return messages.map((msg, i) => {
      // Xác định quyền gửi tin nhắn
      const senderUsername = typeof msg.sender === 'object' ? msg.sender?.username : msg.sender;
      const isMe = senderUsername === user.username;

      // Logic ẩn avatar cho tin nhắn liên tiếp
      const prevMsg = messages[i - 1];
      const prevSender = prevMsg 
        ? (typeof prevMsg.sender === 'object' ? prevMsg.sender.username : prevMsg.sender)
        : null;
      const isSameAsPrev = senderUsername === prevSender;

      // Lấy URL ảnh từ nhiều nguồn có thể có (API hoặc WebSocket)
      const rawAvatar = isMe 
        ? user.avatar 
        : (msg.sender?.avatar || msg.sender_avatar || msg.displayAvatar);

      return (
        <ChatMessage 
          key={msg.id || i} 
          msg={{ 
            ...msg, 
            displayAvatar: getAvatarUrl(rawAvatar) // Gắn URL đã xử lý vào đây
          }} 
          isMe={isMe}
          hideAvatar={isSameAsPrev}
          selectedChat={selectedChat}
        />
      );
    });
  }, [messages, user, selectedChat]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 bg-[#f8f9fb] custom-scrollbar">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <p className="text-sm">Chưa có tin nhắn nào.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {renderedMessages}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};