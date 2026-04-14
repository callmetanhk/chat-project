export const ChatHeader = ({ selectedChat, onBack }) => (
  <div className="px-5 py-3 flex justify-between items-center border-b border-gray-100 bg-white shadow-sm z-10">
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
        <ChevronLeft size={20} />
      </button>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md uppercase">
          {selectedChat.name?.[0]}
        </div>
        <div>
          <div className="font-bold text-gray-800 text-sm leading-tight">{selectedChat.name}</div>
          <div className="text-[10px] text-green-500 flex items-center gap-1 mt-0.5 font-medium">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Trực tuyến
          </div>
        </div>
      </div>
    </div>
    <div className="flex gap-1">
      {[Phone, Video, MoreVertical].map((Icon, idx) => (
        <button key={idx} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
          <Icon size={18} />
        </button>
      ))}
    </div>
  </div>
);