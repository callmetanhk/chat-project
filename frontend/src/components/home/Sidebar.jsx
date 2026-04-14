import { useState } from "react";
import axios from "../../api/axios";
import { MessageSquare, Hash, ChevronDown, Plus, LogOut, Search } from "lucide-react";

export default function Sidebar({ user, rooms, selectedChat, onSelectChat, onLogout, refreshRooms, isCollapsed }) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // --- HÀM XỬ LÝ URL ẢNH TUYỆT ĐỐI ---
  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    // Thay đổi PORT8000 nếu Backend của bạn chạy ở cổng khác
    return `http://localhost:8000${path}`;
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    if (!val.trim()) return setUsers([]);
    try {
      const res = await axios.get(`/chat/search-user/?q=${val}`);
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const startChat = async (u) => {
    try {
      const res = await axios.post("/chat/start-chat/", { email: u.email });
      await refreshRooms();
      // u.avatar có thể là tương đối hoặc tuyệt đối tùy Backend
      onSelectChat({ 
        id: res.data.conversation_id, 
        name: u.full_name, 
        avatar: getFullUrl(u.avatar) 
      });
      setShowSearch(false); 
      setSearch("");
    } catch (err) { console.error(err); }
  };

  return (
    <div className={`bg-[#f0f4f9] flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-72"}`}>
      
      {/* Nút New Chat */}
      <div className="p-4 flex flex-col items-center">
        <button
          onClick={() => !isCollapsed && setShowSearch(!showSearch)}
          className={`flex items-center justify-center bg-[#c2e7ff] hover:shadow-md rounded-xl font-bold transition-all overflow-hidden ${isCollapsed ? "w-12 h-12" : "w-full py-3 px-4 gap-2"}`}
          title={isCollapsed ? "Cuộc trò chuyện mới" : ""}
        >
          <Plus size={24} className="shrink-0" />
          {!isCollapsed && <span className="text-sm whitespace-nowrap">Cuộc trò chuyện mới</span>}
        </button>

        {showSearch && !isCollapsed && (
          <div className="w-full mt-3 relative">
            <div className="flex items-center bg-white px-3 py-2 rounded-xl shadow-sm border border-blue-100">
              <Search size={16} className="text-gray-400" />
              <input 
                value={search} 
                onChange={handleSearch} 
                autoFocus
                placeholder="Nhập email..." 
                className="ml-2 outline-none text-sm w-full bg-transparent" 
              />
            </div>
            {users.length > 0 && (
              <div className="absolute top-12 inset-x-0 bg-white rounded-xl shadow-xl z-[100] max-h-60 overflow-y-auto border border-gray-100 animate-in fade-in slide-in-from-top-2">
                {users.map(u => (
                  <div key={u.id} onClick={() => startChat(u)} className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors border-b last:border-0 border-gray-50">
                    {u.avatar ? (
                      <img src={getFullUrl(u.avatar)} className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-100" alt="" />
                    ) : (
                      <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm uppercase">
                        {(u.full_name || u.username)?.[0]}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-gray-800 truncate">{u.full_name}</span>
                      <span className="text-[10px] text-gray-500 truncate">{u.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 px-4">
        <SidebarNavItem icon={<MessageSquare size={20} />} label="Tin nhắn" active isCollapsed={isCollapsed} />
        <SidebarNavItem icon={<Hash size={20} />} label="Không gian" isCollapsed={isCollapsed} />
      </nav>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto mt-4 custom-scrollbar px-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
            <ChevronDown size={14} />
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap opacity-70">Tin nhắn trực tiếp</span>
          </div>
        )}

        <div className="mt-1 space-y-1">
          {rooms.map((room) => {
            const isLastMsgFromMe = room.last_msg_sender === user.username;
            const displayLastMsg = room.lastMsg 
              ? `${isLastMsgFromMe ? "Bạn: " : ""}${room.lastMsg}`
              : "Bắt đầu cuộc trò chuyện";

            return (
              <div
                key={room.id}
                onClick={() => onSelectChat(room)}
                className={`flex items-center rounded-xl cursor-pointer transition-all ${isCollapsed ? "justify-center h-14 w-14 mx-auto" : "gap-3 px-4 py-3"} ${selectedChat?.id === room.id ? "bg-[#d3e3fd] text-[#041e49] font-bold shadow-sm" : "hover:bg-[#e1e5ea] text-gray-700"}`}
              >
                <div className="relative shrink-0">
                  {room.avatar ? (
                    <img src={getFullUrl(room.avatar)} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" alt="" />
                  ) : (
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 flex items-center justify-center rounded-full text-sm font-bold uppercase border border-indigo-200">
                      {room.name?.[0]}
                    </div>
                  )}
                  {/* Status Indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-sm truncate font-bold text-gray-800">{room.name}</p>
                        <span className="text-[9px] opacity-60 font-medium ml-2 shrink-0">14:20</span>
                    </div>
                    <p className={`text-[12px] truncate ${selectedChat?.id === room.id ? "text-[#041e49]/70" : "text-gray-500"}`}>
                      {displayLastMsg}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile */}
      <div className={`p-4 bg-gray-100/80 border-t border-gray-200/50 flex transition-all ${isCollapsed ? "flex-col items-center gap-4" : "items-center gap-3"}`}>
        <div className="relative shrink-0">
          {user.avatar ? (
            <img src={getFullUrl(user.avatar)} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md" alt="My avatar" />
          ) : (
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold uppercase shadow-md">
              {user.username?.[0]}
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-gray-800">{user.full_name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-tighter">Đang hoạt động</p>
            </div>
          </div>
        )}
        
        <button 
          onClick={onLogout} 
          title="Đăng xuất"
          className="p-2 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded-lg transition-all active:scale-95"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );
}

function SidebarNavItem({ icon, label, active, isCollapsed }) {
  return (
    <div 
      className={`flex items-center rounded-lg cursor-pointer transition-all ${isCollapsed ? "justify-center h-12 w-12 mx-auto" : "gap-3 px-3 py-2"} ${active ? "bg-[#d3e3fd] text-[#041e49] font-bold" : "hover:bg-gray-200 text-gray-600"}`}
      title={isCollapsed ? label : ""}
    >
      <div className="shrink-0">{icon}</div>
      {!isCollapsed && <span className="text-sm whitespace-nowrap">{label}</span>}
    </div>
  );
}