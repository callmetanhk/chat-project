import React from 'react';
import { Paperclip, Download } from 'lucide-react';

export const ChatMessage = ({ msg, isMe, currentUser, chatPartnerName }) => {
  // --- HÀM XỬ LÝ URL TUYỆT ĐỐI ---
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:8000${path}`;
  };

  /**
   * Logic xử lý thời gian
   */
  const formatChatTime = (isoString) => {
    if (!isoString) return "Vừa xong";
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    
    if (isToday) {
      return date.toLocaleTimeString('vi-VN', timeOptions);
    } else {
      const datePart = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      const timePart = date.toLocaleTimeString('vi-VN', timeOptions);
      return `${datePart} ${timePart}`;
    }
  };

  const displayName = isMe 
    ? (currentUser?.full_name || "") 
    : (msg.sender?.full_name || msg.full_name || chatPartnerName || msg.sender?.username || (typeof msg.sender === 'string' ? msg.sender : "Người dùng"));

  // Logic lấy avatar
  const rawAvatar = msg.avatar || msg.sender?.avatar || null;
  const avatarUrl = getFullUrl(rawAvatar);

  return (
    <div className={`flex w-full mb-6 ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-start gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar người gửi */}
        {!isMe && (
          <div className="shrink-0 mt-1">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-gray-100" 
                alt="avatar" 
              />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-sm bg-gradient-to-br from-indigo-400 to-purple-500 uppercase">
                {displayName?.[0]}
              </div>
            )}
          </div>
        )}

        {/* Nội dung tin nhắn */}
        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
          
          {/* Header (Hiện FULL_NAME & Thời gian) */}
          <div className={`flex items-center gap-2 mb-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
            {!isMe && (
              <span className="text-[12px] font-bold text-gray-700">
                {displayName}
              </span>
            )}
            <span className="text-[10px] text-gray-400 font-medium">
              {formatChatTime(msg.created_at || msg.timestamp)}
            </span>
          </div>

          {/* Cụm bong bóng tin nhắn */}
          <div className={`flex flex-col gap-2 ${isMe ? "items-end" : "items-start"}`}>
            {msg.message && (
              <div className={`px-4 py-2.5 text-[14.5px] shadow-sm leading-relaxed ${
                isMe 
                ? "bg-indigo-600 text-white rounded-2xl rounded-tr-none" 
                : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none"
              }`}>
                {msg.message}
              </div>
            )}

            {/* File đính kèm (nếu có) */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className={`flex flex-col gap-2 ${isMe ? "items-end" : "items-start"}`}>
                {msg.attachments.map((file, idx) => {
                  const isImage = file.file_type?.includes('image');
                  const fileUrl = getFullUrl(file.file_url);
                  return (
                    <div key={file.id || idx} className="group relative max-w-sm">
                      {isImage ? (
                        <div className="relative overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-transform hover:scale-[1.01] bg-gray-50">
                          <img 
                            src={fileUrl} 
                            alt="attachment" 
                            className="max-h-80 w-full object-contain cursor-zoom-in"
                            onClick={() => window.open(fileUrl, '_blank')}
                          />
                        </div>
                      ) : (
                        <div className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${isMe ? "bg-indigo-50 border-indigo-100" : "bg-white border-gray-100"}`}>
                          <div className={`p-2 rounded-lg ${isMe ? "bg-indigo-200" : "bg-gray-100"}`}>
                            <Paperclip size={18} className={isMe ? "text-indigo-700" : "text-gray-500"} />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[13px] font-medium text-gray-800 truncate max-w-[150px]">
                              {file.file_name || "Tài liệu"}
                            </span>
                            <span className="text-[10px] text-gray-400 uppercase font-black">
                              {file.file_type?.split('/')[1] || 'FILE'}
                            </span>
                          </div>
                          <a href={fileUrl} target="_blank" rel="noreferrer" className="ml-2 p-1.5 text-gray-400 hover:text-indigo-600">
                            <Download size={16} />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};