import React from 'react';
import { Paperclip, Download } from 'lucide-react';

export const ChatMessage = ({ msg, isMe, hideAvatar, selectedChat }) => {

  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  const avatarUrl = getAvatarUrl(selectedChat.avatar);

  const formatChatTime = (isoString) => {
    const date = new Date(isoString);

    if (!isoString || isNaN(date.getTime())) return "Vừa xong";

    const now = new Date();

    const timeStr = date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const isToday = date.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const isSameYear = date.getFullYear() === now.getFullYear();

    if (isToday) {
      return timeStr;
    }

    if (isYesterday) {
      return `${timeStr} Hôm qua`;
    }

    if (isSameYear) {
      const dateStr = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
      return `${timeStr} ${dateStr}`;
    }

    const fullDateStr = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${timeStr} ${fullDateStr}`;
  };

  const displayName = isMe ? "Bạn" : (msg.sender?.full_name || msg.full_name || selectedChat?.name || "Người dùng");

  return (
    <div className={`flex w-full ${hideAvatar ? "mb-1" : "mb-6"} ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-start gap-3 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>

        {/* Avatar đối phương */}
        {!isMe && (
          <div className="shrink-0 w-9">
            {!hideAvatar && (
              avatarUrl && avatarUrl !== "/default-avatar.png" ? (
                <img
                  src={avatarUrl}
                  className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100"
                  alt="avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/default-avatar.png";
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white bg-gradient-to-br from-indigo-500 to-purple-500 uppercase">
                  {displayName?.[0]}
                </div>
              )
            )}
          </div>
        )}

        {/* Nội dung tin nhắn */}
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
          {!hideAvatar && (
            <div className={`flex items-center gap-2 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && <span className="text-[12px] font-bold text-gray-700">{displayName}</span>}
              <span className="text-[10px] text-gray-400">{formatChatTime(msg.created_at)}</span>
            </div>
          )}

          <div className={`flex flex-col gap-1.5 ${isMe ? "items-end" : "items-start"}`}>
            {msg.message && (
              <div className={`px-4 py-2 rounded-2xl text-[14.5px] shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                }`}>
                {msg.message}
              </div>
            )}

            {/* File đính kèm */}
            {msg.attachments?.map((file, idx) => (
              <AttachmentItem key={idx} file={file} isMe={isMe} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component hỗ trợ xử lý ảnh/file đính kèm
const AttachmentItem = ({ file, isMe }) => {
  const getFileUrl = (u) => (u?.startsWith('http') ? u : `http://localhost:8000${u}`);
  const url = getFileUrl(file.file_url || file.file);
  const isImage = file.file_type?.includes('image');

  if (isImage) {
    return (
      <img
        src={url}
        className="max-h-60 rounded-xl border border-gray-100 shadow-sm cursor-pointer"
        onClick={() => window.open(url, '_blank')}
        alt="attachment"
      />
    );
  }

  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-xl border shadow-sm ${isMe ? "bg-indigo-50 border-indigo-100" : "bg-white border-gray-100"}`}>
      <Paperclip size={16} className="text-gray-500" />
      <span className="text-xs font-medium truncate max-w-[120px]">{file.file_name}</span>
      <a href={url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800">
        <Download size={16} />
      </a>
    </div>
  );
};