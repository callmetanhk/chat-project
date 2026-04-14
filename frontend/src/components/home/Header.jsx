import { Menu, Search, HelpCircle, ChevronDown } from "lucide-react";

export default function Header({ user, onShowProfile, toggleSidebar }) { 
  return (
    <header className="h-16 bg-[#f0f4f9] flex items-center justify-between px-4 shrink-0">
      {/* Bên trái: Menu & Logo */}
      <div className="flex items-center gap-3 w-72 transition-all">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600 active:bg-gray-300"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <img 
            src="src/assets/img/logo.png" 
            alt="Logo" className="w-8 h-8"
          />
          <span className="text-xl text-[#5f6368] font-medium tracking-tight">Chat</span>
        </div>
      </div>

      {/* Ở giữa: Thanh tìm kiếm */}
      <div className="flex-1 max-w-[720px]">
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
            <Search size={20} />
          </div>
          <input 
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện"
            className="w-full bg-[#eaf1fb] hover:bg-white hover:shadow-md focus:bg-white focus:shadow-md py-3 pl-12 pr-4 rounded-full outline-none transition-all text-gray-700 placeholder-gray-500 border border-transparent focus:border-gray-100"
          />
        </div>
      </div>

      {/* Bên phải: Trạng thái & Icons */}
      <div className="flex items-center gap-1 justify-end w-80">
        <div 
          onClick={onShowProfile}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-200 rounded-full cursor-pointer transition-colors border border-gray-300 mr-2 hidden md:flex"
        >
          <div className="w-2.5 h-2.5 bg-green-600 rounded-full shadow-[0_0_8px_rgba(22,163,74,0.5)]"></div>
          <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
          <ChevronDown size={14} className="text-gray-600" />
        </div>

        <div className="flex items-center gap-0.5 text-gray-600 mr-1">
          <button title="Trợ giúp" className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <HelpCircle size={22} />
          </button>
        </div>

        {/* User Avatar */}
        <div className="ml-2">
          <button 
            onClick={onShowProfile} 
            className="w-10 h-10 relative group cursor-pointer transition-all duration-300 active:scale-90 focus:outline-none"
          >
            {user?.avatar ? (
              <div className="w-full h-full rounded-full p-0.5 border-2 border-transparent group-hover:border-indigo-500 transition-all">
                <img 
                  src={user.avatar} alt="User" 
                  className="w-full h-full rounded-full object-cover shadow-sm"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#f4511e] to-[#ff8a65] text-white rounded-full flex items-center justify-center font-bold shadow-md group-hover:shadow-lg transition-all text-lg">
                {user?.full_name?.[0].toUpperCase() || "U"}
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </button>
        </div>
      </div>
    </header>
  );
}