import { ChevronLeft, Phone, Video, MoreVertical } from "lucide-react";

export const ChatHeader = ({ selectedChat, onBack }) => {
  // console.log("selectedChat in ChatHeader:", selectedChat);
  // Hàm bổ trợ để đảm bảo URL ảnh chính xác (giống như ChatArea)
  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:8000${url}`;
  };

  const avatarUrl = getAvatarUrl(selectedChat.avatar);

  return (
    <div className="px-5 py-3 flex justify-between items-center border-b border-gray-100 bg-white shadow-sm z-10">
      <div className="flex items-center gap-3">
        {/* Nút Back */}
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-3">
          {/* Avatar Container */}
          <div className="relative w-10 h-10">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={selectedChat.name}
                className="w-full h-full rounded-full object-cover border border-gray-100 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png"; // Đường dẫn ảnh mặc định trong thư mục public
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md uppercase">
                {selectedChat.name?.[0] || "?"}
              </div>
            )}

            {/* Chấm xanh trạng thái */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          {/* Thông tin tên & trạng thái */}
          <div>
            <div className="font-bold text-gray-800 text-[15px] leading-tight">
              {selectedChat.name}
            </div>
            <div className="text-[11px] text-green-500 flex items-center gap-1.5 mt-0.5 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Trực tuyến
            </div>
          </div>
        </div>
      </div>

      {/* Các nút chức năng */}
      <div className="flex gap-1">
        {[Phone, Video, MoreVertical].map((Icon, idx) => (
          <button
            key={idx}
            className="p-2.5 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-indigo-600 transition-all active:scale-90"
          >
            <Icon size={20} strokeWidth={2.2} />
          </button>
        ))}
      </div>
    </div>
  );
};