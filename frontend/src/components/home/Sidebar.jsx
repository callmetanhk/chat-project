import { useRef, useState } from "react";
import axios from "../../api/axios";

import {
  MessageSquare,
  Hash,
  ChevronDown,
  Plus,
  LogOut,
  Search,
  Users,
  X,
  ImagePlus
} from "lucide-react";

export default function Sidebar({
  user,
  rooms,
  selectedChat,
  onSelectChat,
  onLogout,
  refreshRooms,
  isCollapsed
}) {

  const fileInputRef = useRef(null);

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // GROUP CHAT
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // =========================
  // GET FULL IMAGE URL
  // =========================
  const getFullUrl = (path) => {

    if (!path) return null;

    if (path.startsWith("http")) {
      return path;
    }

    return `http://localhost:8000${path}`;
  };

  // =========================
  // SEARCH USER
  // =========================
  const handleSearch = async (e) => {

    const val = e.target.value;

    setSearch(val);

    if (!val.trim()) {
      setUsers([]);
      return;
    }

    try {

      const res = await axios.get(
        `/chat/search-user/?q=${val}`
      );

      setUsers(res.data.data || []);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // START PRIVATE CHAT
  // =========================
  const startChat = async (u) => {

    try {

      const res = await axios.post(
        "/chat/conversations/private/",
        {
          email: u.email
        }
      );

      await refreshRooms();

      onSelectChat({
        id: res.data.data.conversation_id,
        name: u.full_name || u.username,
        avatar: getFullUrl(u.avatar),
        username: u.username,
        email: u.email,
        type: "PRIVATE"
      });

      setShowSearch(false);
      setSearch("");
      setUsers([]);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // SELECT USER FOR GROUP
  // =========================
  const toggleSelectUser = (u) => {

    const exists = selectedUsers.find(
      (item) => item.id === u.id
    );

    if (exists) {

      setSelectedUsers((prev) =>
        prev.filter((item) => item.id !== u.id)
      );

    } else {

      setSelectedUsers((prev) => [...prev, u]);
    }
  };

  // =========================
  // CREATE GROUP CHAT
  // =========================
  const createGroupChat = async () => {

    if (!groupName.trim()) {
      return alert("Nhập tên nhóm");
    }

    if (selectedUsers.length < 2) {
      return alert("Chọn ít nhất 2 thành viên");
    }

    try {

      const formData = new FormData();

      formData.append("name", groupName);

      selectedUsers.forEach((u) => {
        formData.append("participants", u.id);
      });

      if (groupAvatar) {
        formData.append("avatar", groupAvatar);
      }

      const res = await axios.post(
        "/chat/conversations/group/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      await refreshRooms();

      onSelectChat({
        id: res.data.data.conversation_id,
        name: res.data.data.name,
        avatar: res.data.data.avatar,
        type: "GROUP"
      });

      // RESET
      setShowGroupModal(false);
      setGroupName("");
      setGroupAvatar(null);
      setSelectedUsers([]);
      setSearch("");
      setUsers([]);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>

      <div
        className={`
          bg-[#f0f4f9]
          flex
          flex-col
          shrink-0
          h-full
          transition-all
          duration-300
          ease-in-out
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >

        {/* ================= NEW CHAT ================= */}
        <div className="p-4 flex flex-col items-center">

          <div className="flex gap-2 w-full">

            {/* PRIVATE CHAT */}
            <button
              onClick={() =>
                !isCollapsed &&
                setShowSearch(!showSearch)
              }
              className="
                flex-1
                flex
                items-center
                justify-center
                bg-[#c2e7ff]
                hover:shadow-md
                rounded-xl
                font-bold
                transition-all
                py-3
                px-4
                gap-2
              "
            >

              <Plus size={20} />

              {!isCollapsed && (
                <span className="text-sm">
                  Chat
                </span>
              )}

            </button>

            {/* GROUP CHAT */}
            <button
              onClick={() => setShowGroupModal(true)}
              className="
                flex
                items-center
                justify-center
                bg-indigo-500
                hover:bg-indigo-600
                text-white
                rounded-xl
                px-4
                transition-all
              "
            >

              <Users size={20} />

            </button>

          </div>

          {/* SEARCH USER */}
          {showSearch && !isCollapsed && (

            <div className="w-full mt-3 relative">

              <div
                className="
                  flex
                  items-center
                  bg-white
                  px-3
                  py-2
                  rounded-xl
                  shadow-sm
                  border
                  border-blue-100
                "
              >

                <Search
                  size={16}
                  className="text-gray-400"
                />

                <input
                  value={search}
                  onChange={handleSearch}
                  autoFocus
                  placeholder="Nhập email hoặc username..."
                  className="
                    ml-2
                    outline-none
                    text-sm
                    w-full
                    bg-transparent
                  "
                />

              </div>

              {users.length > 0 && (

                <div
                  className="
                    absolute
                    top-12
                    inset-x-0
                    bg-white
                    rounded-xl
                    shadow-xl
                    z-[100]
                    max-h-60
                    overflow-y-auto
                    border
                    border-gray-100
                  "
                >

                  {users.map((u) => (

                    <div
                      key={u.id}
                      onClick={() => startChat(u)}
                      className="
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        hover:bg-blue-50
                        cursor-pointer
                        transition-colors
                        border-b
                        last:border-0
                        border-gray-50
                      "
                    >

                      {u.avatar ? (

                        <img
                          src={getFullUrl(u.avatar)}
                          className="
                            w-8
                            h-8
                            rounded-full
                            object-cover
                          "
                          alt=""
                        />

                      ) : (

                        <div
                          className="
                            w-8
                            h-8
                            bg-indigo-500
                            text-white
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-[10px]
                            font-bold
                            uppercase
                          "
                        >
                          {(u.full_name || u.username)?.[0]}
                        </div>

                      )}

                      <div className="flex flex-col min-w-0">

                        <span className="text-[13px] font-bold truncate">
                          {u.full_name || u.username}
                        </span>

                        <span className="text-[10px] text-gray-500 truncate">
                          {u.email}
                        </span>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          )}

        </div>

        {/* ================= NAV ================= */}
        <nav className="flex flex-col gap-1 px-4">

          <SidebarNavItem
            icon={<MessageSquare size={20} />}
            label="Tin nhắn"
            active
            isCollapsed={isCollapsed}
          />

          <SidebarNavItem
            icon={<Hash size={20} />}
            label="Không gian"
            isCollapsed={isCollapsed}
          />

        </nav>

        {/* ================= CHAT LIST ================= */}
        <div className="flex-1 overflow-y-auto mt-4 px-2">

          {/* PRIVATE CHAT */}
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-4 py-2 text-gray-500">
              <ChevronDown size={14} />

              <span className="text-[11px] font-bold uppercase opacity-70">
                Tin nhắn riêng
              </span>
            </div>
          )}

          <div className="mt-1 space-y-1">

            {rooms
              .filter((room) => room.type === "PRIVATE")
              .map((room) => {

                const isLastMsgFromMe =
                  room.last_msg_sender === user.username;

                const displayLastMsg =
                  room.lastMsg
                    ? `${isLastMsgFromMe ? "Bạn: " : ""}${room.lastMsg}`
                    : "Bắt đầu cuộc trò chuyện";

                return (

                  <ConversationItem
                    key={room.id}
                    room={room}
                    selectedChat={selectedChat}
                    onSelectChat={onSelectChat}
                    displayLastMsg={displayLastMsg}
                    getFullUrl={getFullUrl}
                    isCollapsed={isCollapsed}
                  />

                );
              })}

          </div>

          {/* GROUP CHAT */}
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-4 py-2 mt-5 text-gray-500">
              <ChevronDown size={14} />

              <span className="text-[11px] font-bold uppercase opacity-70">
                Nhóm chat
              </span>
            </div>
          )}

          <div className="mt-1 space-y-1">

            {rooms
              .filter((room) => room.type === "GROUP")
              .map((room) => {

                const isLastMsgFromMe =
                  room.last_msg_sender === user.username;

                const displayLastMsg =
                  room.lastMsg
                    ? `${isLastMsgFromMe ? "Bạn: " : ""}${room.lastMsg}`
                    : "Chưa có tin nhắn";

                return (

                  <ConversationItem
                    key={room.id}
                    room={room}
                    selectedChat={selectedChat}
                    onSelectChat={onSelectChat}
                    displayLastMsg={displayLastMsg}
                    getFullUrl={getFullUrl}
                    isCollapsed={isCollapsed}
                  />

                );
              })}

          </div>

        </div>

        {/* ================= PROFILE ================= */}
        <div
          className={`
            p-4
            bg-gray-100/80
            border-t
            flex
            ${isCollapsed
              ? "flex-col items-center gap-4"
              : "items-center gap-3"}
          `}
        >

          {user.avatar ? (

            <img
              src={getFullUrl(user.avatar)}
              className="
                w-9
                h-9
                rounded-full
                object-cover
              "
              alt=""
            />

          ) : (

            <div
              className="
                w-9
                h-9
                bg-indigo-600
                text-white
                rounded-full
                flex
                items-center
                justify-center
                font-bold
              "
            >
              {user.username?.[0]}
            </div>

          )}

          {!isCollapsed && (

            <div className="flex-1 min-w-0">

              <p className="text-xs font-bold truncate">
                {user.full_name}
              </p>

              <p className="text-[10px] text-green-600">
                Đang hoạt động
              </p>

            </div>

          )}

          <button
            onClick={onLogout}
            className="
              p-2
              hover:bg-red-50
              hover:text-red-600
              text-gray-400
              rounded-lg
            "
          >

            <LogOut size={18} />

          </button>

        </div>

      </div>

      {/* ================= GROUP MODAL ================= */}
      {showGroupModal && (

        <div
          className="
            fixed
            inset-0
            bg-black/40
            z-[999]
            flex
            items-center
            justify-center
          "
        >

          <div
            className="
              bg-white
              rounded-2xl
              w-full
              max-w-md
              p-6
              shadow-2xl
            "
          >

            <div className="flex items-center justify-between mb-5">

              <h2 className="text-lg font-bold">
                Tạo nhóm chat
              </h2>

              <button
                onClick={() => setShowGroupModal(false)}
              >
                <X size={20} />
              </button>

            </div>

            <input
              value={groupName}
              onChange={(e) =>
                setGroupName(e.target.value)
              }
              placeholder="Tên nhóm..."
              className="
                w-full
                border
                rounded-xl
                px-4
                py-3
                outline-none
                mb-4
              "
            />

            <button
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                w-full
                border
                border-dashed
                rounded-xl
                py-4
                flex
                items-center
                justify-center
                gap-2
                mb-4
              "
            >

              <ImagePlus size={18} />

              <span className="text-sm">
                {groupAvatar
                  ? groupAvatar.name
                  : "Chọn ảnh nhóm"}
              </span>

            </button>

            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={(e) =>
                setGroupAvatar(
                  e.target.files?.[0]
                )
              }
            />

            <input
              value={search}
              onChange={handleSearch}
              placeholder="Tìm thành viên..."
              className="
                w-full
                border
                rounded-xl
                px-4
                py-3
                outline-none
                mb-4
              "
            />

            <div className="max-h-52 overflow-y-auto space-y-2">

              {users.map((u) => {

                const selected =
                  selectedUsers.find(
                    (item) => item.id === u.id
                  );

                return (

                  <div
                    key={u.id}
                    onClick={() => toggleSelectUser(u)}
                    className={`
                      flex
                      items-center
                      gap-3
                      p-2
                      rounded-xl
                      cursor-pointer
                      border
                      transition-all
                      ${selected
                        ? "bg-indigo-50 border-indigo-400"
                        : "hover:bg-gray-50"}
                    `}
                  >

                    {u.avatar ? (

                      <img
                        src={getFullUrl(u.avatar)}
                        className="
                          w-9
                          h-9
                          rounded-full
                          object-cover
                        "
                        alt=""
                      />

                    ) : (

                      <div
                        className="
                          w-9
                          h-9
                          rounded-full
                          bg-indigo-500
                          text-white
                          flex
                          items-center
                          justify-center
                          font-bold
                        "
                      >
                        {(u.full_name || u.username)?.[0]}
                      </div>

                    )}

                    <div>

                      <p className="text-sm font-semibold">
                        {u.full_name || u.username}
                      </p>

                      <p className="text-xs text-gray-500">
                        {u.email}
                      </p>

                    </div>

                  </div>

                );
              })}

            </div>

            <button
              onClick={createGroupChat}
              className="
                mt-5
                w-full
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                rounded-xl
                py-3
                font-semibold
              "
            >
              Tạo nhóm
            </button>

          </div>

        </div>

      )}

    </>
  );
}

function SidebarNavItem({
  icon,
  label,
  active,
  isCollapsed
}) {

  return (
    <div
      className={`
        flex
        items-center
        rounded-lg
        cursor-pointer
        transition-all
        ${isCollapsed
          ? "justify-center h-12 w-12 mx-auto"
          : "gap-3 px-3 py-2"}
        ${active
          ? "bg-[#d3e3fd] text-[#041e49] font-bold"
          : "hover:bg-gray-200 text-gray-600"}
      `}
    >

      <div className="shrink-0">
        {icon}
      </div>

      {!isCollapsed && (
        <span className="text-sm">
          {label}
        </span>
      )}

    </div>
  );
}

function ConversationItem({
  room,
  selectedChat,
  onSelectChat,
  displayLastMsg,
  getFullUrl,
  isCollapsed
}) {

  return (

    <div
      onClick={() => onSelectChat(room)}
      className={`
        flex
        items-center
        rounded-xl
        cursor-pointer
        transition-all
        ${isCollapsed
          ? "justify-center h-14 w-14 mx-auto"
          : "gap-3 px-4 py-3"}
        ${selectedChat?.id === room.id
          ? "bg-[#d3e3fd]"
          : "hover:bg-[#e1e5ea]"}
      `}
    >

      {/* AVATAR */}
      <div className="relative shrink-0">

        {room.avatar ? (

          <img
            src={getFullUrl(room.avatar)}
            className="
              w-10
              h-10
              rounded-full
              object-cover
            "
            alt=""
          />

        ) : (

          <div
            className="
              w-10
              h-10
              bg-indigo-100
              text-indigo-700
              flex
              items-center
              justify-center
              rounded-full
              text-sm
              font-bold
              uppercase
            "
          >

            {room.type === "GROUP"
              ? <Users size={18} />
              : room.name?.[0]}

          </div>

        )}

      </div>

      {!isCollapsed && (

        <div className="flex-1 min-w-0">

          <div className="flex justify-between mb-0.5">

            <p className="text-sm truncate font-bold">
              {room.name}
            </p>

            <span className="text-[9px] opacity-60">

              {room.updated_at
                ? new Date(
                    room.updated_at
                  ).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit"
                    }
                  )
                : ""}

            </span>

          </div>

          <p className="text-[12px] truncate text-gray-500">
            {displayLastMsg}
          </p>

        </div>

      )}

    </div>

  );
}