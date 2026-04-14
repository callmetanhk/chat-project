import { Archive, MoreHorizontal, CheckCheck } from "lucide-react";

export const ChatListItem = ({ room, isMe, onSelectChat }) => {
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `http://localhost:8000${path}`;
  };

  // Logic hiển thị thời gian rút gọn
  const formatShortTime = (isoString) => {
    if (!isoString) return "Vừa xong";
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    return isToday 
      ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
      : `${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div 
      onClick={() => onSelectChat(room)}
      className="group flex items-center px-5 py-3.5 hover:bg-indigo-50/40 cursor-pointer transition-all duration-200 border-b border-gray-50 last:border-0 relative"
    >
      {/* Cụm Avatar & Status */}
      <div className="relative shrink-0 mr-3.5">
        {room.avatar ? (
          <img 
            src={getFullUrl(room.avatar)} // Đã thêm getFullUrl ở đây
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm border border-gray-100" 
            alt={room.name} 
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-sm uppercase">
            {room.name?.[0]}
          </div>
        )}
        {/* Chấm trạng thái online */}
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
      </div>

      {/* Nội dung tin nhắn */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="font-bold text-[15px] text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
            {room.name}
          </span>
          <span className="text-[11px] font-medium text-gray-400 shrink-0 group-hover:hidden">
            {formatShortTime(room.create || room.updated_at)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="text-[13px] text-gray-500 truncate leading-snug flex-1">
            {isMe && (
              <span className="inline-flex mr-1 text-indigo-500">
                <CheckCheck size={14} /> 
              </span>
            )}
            <span className={`${!isMe && room.unread ? "font-bold text-gray-900" : "text-gray-500"}`}>
              {room.lastMsg || "Bắt đầu cuộc trò chuyện mới"}
            </span>
          </div>
          
          {/* Badge tin nhắn chưa đọc */}
          {!isMe && room.unread > 0 && (
            <div className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              {room.unread}
            </div>
          )}
        </div>
      </div>

      {/* Nút chức năng khi Hover */}
      <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-2 animate-in fade-in slide-in-from-right-2">
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="p-2 hover:bg-white hover:text-indigo-600 rounded-full text-gray-400 transition-all shadow-sm border border-transparent hover:border-gray-100"
          title="Lưu trữ"
        >
          <Archive size={16} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="p-2 hover:bg-white hover:text-indigo-600 rounded-full text-gray-400 transition-all shadow-sm border border-transparent hover:border-gray-100"
          title="Thêm"
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
    </div>
  );
};