import { useState, useEffect, useCallback } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import Header from "../components/home/Header"; 
import Sidebar from "../components/home/Sidebar";
import ChatArea from "../components/home/ChatArea";
import ProfileDrawer from "../components/home/ProfileDrawer";

export default function Home() {
  const [user, setUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // States cho Profile
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 1. Lấy dữ liệu người dùng và phòng chat khi vào trang
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [profileRes, chatRes] = await Promise.all([
          axios.get("/auth/profile/"),
          axios.get("/chat/conversations/")
        ]);
        if (isMounted) {
          setUser(profileRes.data.data);
          setForm(profileRes.data.data); // Khởi tạo form từ dữ liệu user
          setRooms(chatRes.data);
        }
      } catch (err) {
        if (isMounted) navigate("/login");
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [navigate]);

  // 2. Logic xử lý Profile Drawer
  const handleEdit = () => setIsEditing(true);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setForm(user); // Trả dữ liệu form về lại trạng thái user ban đầu
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // SỬ DỤNG FORMDATA ĐỂ CÓ THỂ GỬI ĐƯỢC FILE (ẢNH)
      const formData = new FormData();
      formData.append("full_name", form.full_name || "");
      formData.append("phone", form.phone || "");
      formData.append("email", form.email || "");

      // Nếu avatar là một File mới được chọn từ input, ta mới gửi lên
      if (form.avatar instanceof File) {
        formData.append("avatar", form.avatar);
      }

      const res = await axios.put("/auth/profile/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Cập nhật lại state cục bộ sau khi lưu thành công
      setUser(res.data.data);
      setForm(res.data.data);
      setIsEditing(false);
      alert("Cập nhật hồ sơ thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert(err.response?.data?.message || "Lỗi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // 3. Logic xử lý Chat
  const handleSelectChat = useCallback((chat) => {
    if (chat && typeof chat === "object") setSelectedChat(chat);
  }, []);

  const refreshRooms = async () => {
    try {
      const res = await axios.get("/chat/conversations/");
      setRooms(res.data);
    } catch (err) { console.error(err); }
  };

  if (!user) return <div className="h-screen flex items-center justify-center bg-[#f0f4f9]">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-[#f0f4f9] overflow-hidden text-[#1f1f1f]">
      {/* HEADER */}
      <Header 
        user={user} 
        onShowProfile={() => setShowProfile(true)} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar 
          user={user} 
          rooms={rooms}
          isCollapsed={!isSidebarOpen}
          selectedChat={selectedChat} 
          onSelectChat={handleSelectChat} 
          onLogout={handleLogout}
          refreshRooms={refreshRooms}
        />
        
        {/* CHAT AREA */}
        <ChatArea 
          user={user} 
          rooms={rooms}
          selectedChat={selectedChat} 
          onSelectChat={handleSelectChat}
          onBack={() => setSelectedChat(null)} 
        />
      </div>

      {/* PROFILE DRAWER (Slide từ phải sang) */}
      {showProfile && (
        <ProfileDrawer 
          user={user} 
          editing={isEditing}
          form={form}
          onEdit={handleEdit}
          onCancel={handleCancelEdit}
          onFormChange={handleFormChange}
          onUpdate={handleUpdateProfile}
          onClose={() => { 
            setShowProfile(false); 
            setIsEditing(false); 
            setForm(user); // Reset form khi đóng drawer
          }}
          onLogout={handleLogout}
          loading={loading}
        />
      )}
    </div>
  );
}