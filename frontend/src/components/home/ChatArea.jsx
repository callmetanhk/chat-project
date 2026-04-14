import { useEffect, useState, useRef } from "react";
import axios from "../../api/axios";
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, ChevronLeft, FileText, X } from "lucide-react";
import { ChatListItem } from "../chat/ChatListItem";
import { ChatMessage } from "../chat/ChatMessage";

export default function ChatArea({ selectedChat, user, onBack, rooms, onSelectChat }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const isFirstLoad = useRef(true); // Kiểm soát hiệu ứng cuộn

  // --- 0. KHÔI PHỤC PHIÊN LÀM VIỆC (F5) ---
  useEffect(() => {
    if (!selectedChat && rooms.length > 0) {
      const savedChatId = localStorage.getItem("active_chat_id");
      if (savedChatId) {
        const lastRoom = rooms.find(r => String(r.id) === savedChatId);
        if (lastRoom) {
          onSelectChat(lastRoom);
        }
      }
    }
  }, [rooms, selectedChat, onSelectChat]);

  // --- 1. QUẢN LÝ KẾT NỐI (SOCKET & API) ---
  useEffect(() => {
    if (!selectedChat?.id) return;
    
    // Reset flag để khi vào phòng mới sẽ nhảy thẳng xuống tin nhắn cuối
    isFirstLoad.current = true;
    localStorage.setItem("active_chat_id", selectedChat.id);

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/chat/messages/${selectedChat.id}/`);
        setMessages(res.data);
      } catch (err) { 
        console.error("Lỗi tải tin nhắn:", err); 
      }
    };
    fetchMessages();
    
    const token = localStorage.getItem("access");
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${selectedChat.id}/?token=${token}`);
    
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const formattedMsg = {
        ...data,
        attachments: data.attachments || []
      };
      setMessages((prev) => [...prev, formattedMsg]);
    };
    
    socketRef.current = ws;

    return () => {
      ws.close();
      // Cleanup URLs preview để tránh rò rỉ bộ nhớ
      previews.forEach(p => p.url && URL.revokeObjectURL(p.url));
    };
  }, [selectedChat?.id]);

  // --- 2. LOGIC CUỘN THÔNG MINH ---
  useEffect(() => {
    if (messages.length > 0) {
      if (isFirstLoad.current) {
        // Nhảy tức thì xuống cuối khi mới load phòng
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
        isFirstLoad.current = false;
      } else {
        // Cuộn mượt khi có tin nhắn mới phát sinh trong lúc chat
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  // --- 3. XỬ LÝ FILE & PREVIEW ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map(f => {
      const isImage = f.type.startsWith("image/");
      return {
        id: Math.random(),
        url: isImage ? URL.createObjectURL(f) : null,
        name: f.name,
        type: f.type
      };
    });
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index) => {
    if (previews[index]?.url) URL.revokeObjectURL(previews[index].url);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- 4. GỬI TIN NHẮN ---
  const sendMessage = async () => {
    const hasContent = input.trim().length > 0;
    const hasFiles = selectedFiles.length > 0;

    if (!hasContent && !hasFiles) return;

    if (hasFiles) {
      const formData = new FormData();
      formData.append("conversation_id", selectedChat.id);
      formData.append("content", input);
      selectedFiles.forEach(file => formData.append("files", file));

      try {
        await axios.post("/chat/send-message/", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        // Reset state sau khi gửi thành công
        setInput("");
        setSelectedFiles([]);
        setPreviews([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        console.error("Lỗi gửi tin nhắn kèm file:", err);
      }
    } else {
      socketRef.current?.send(JSON.stringify({ message: input }));
      setInput("");
    }
  };

  const handleBack = () => {
    localStorage.removeItem("active_chat_id");
    onBack();
  };

  // Giao diện khi chưa chọn chat (Trang chủ/Danh sách phòng)
  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col bg-white rounded-[16px] m-2 overflow-hidden shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
          <h3 className="text-xl font-medium text-gray-800">Trang chủ</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {rooms.map(room => (
            <ChatListItem 
              key={room.id} 
              room={room} 
              isMe={room.last_msg_sender === user.username} 
              onSelectChat={onSelectChat} 
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-[16px] m-2 overflow-hidden shadow-sm border border-gray-200">
      <ChatHeader selectedChat={selectedChat} onBack={handleBack} />
      
      <MessageList 
        messages={messages} 
        user={user} 
        bottomRef={bottomRef} 
        chatPartnerName={selectedChat.name} 
      />

      <MessageInput 
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        handleFileChange={handleFileChange}
        fileInputRef={fileInputRef}
        previews={previews}
        removeFile={removeFile}
        hasContentOrFiles={input.trim() || selectedFiles.length > 0}
      />
    </div>
  );
}