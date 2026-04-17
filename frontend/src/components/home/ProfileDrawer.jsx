import React, { useMemo } from "react";
import { X, Pencil, Mail, Phone, LogOut, Camera, User as UserIcon } from "lucide-react";
import { Toast } from "../ui/Toast";

export default function ProfileDrawer({ 
  user, editing, form, onFormChange, onUpdate, 
  onCancel, onClose, onLogout, onEdit, loading 
}) {
  
  // Tạo preview ảnh ngay khi chọn file
  const previewAvatar = useMemo(() => {
    if (form?.avatar instanceof File) {
      return URL.createObjectURL(form.avatar);
    }
    return user?.avatar; 
  }, [form?.avatar, user?.avatar]);

  const renderAvatarContent = () => {
    if (previewAvatar) {
      return <img src={previewAvatar} alt="Avatar" className="w-full h-full object-cover" />;
    }
    const name = user?.full_name || user?.username || "?";
    return name[0].toUpperCase();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40 transition-opacity backdrop-blur-sm" onClick={onClose} />
      
      <div className="fixed right-2 top-2 bottom-2 w-80 bg-white shadow-2xl z-50 rounded-[24px] border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        <div className="p-6 flex justify-between items-center border-b border-gray-50">
          <h2 className="font-bold text-gray-800">Hồ sơ của tôi</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={20}/>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center mb-8 relative">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-full flex items-center justify-center text-4xl font-bold mb-4 shadow-xl overflow-hidden border-4 border-white">
                {renderAvatarContent()}
              </div>
              {editing && (
                <label className="absolute bottom-4 right-0 bg-white p-2 rounded-full shadow-lg border border-gray-100 cursor-pointer hover:bg-gray-50 text-indigo-600 transition-transform active:scale-90">
                  <Camera size={16} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) onFormChange('avatar', e.target.files[0]);
                    }} 
                  />
                </label>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800">{user?.full_name}</h3>
            <p className="text-sm text-gray-400 font-medium italic">@{user?.username}</p>
          </div>

          {!editing ? (
            <div className="space-y-3">
              <ProfileCard label="Họ và tên" value={user?.full_name} icon={<UserIcon size={16}/>} />
              <ProfileCard label="Email" value={user?.email} icon={<Mail size={16}/>} />
              <ProfileCard label="Điện thoại" value={user?.phone} icon={<Phone size={16}/>} />
              
              <button 
                onClick={onEdit}
                className="w-full mt-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Pencil size={16} /> Chỉnh sửa hồ sơ
              </button>
            </div>
          ) : (
            <div className="space-y-4">
               <EditField label="Họ và tên" value={form?.full_name} onChange={(v) => onFormChange('full_name', v)} />
               <EditField label="Số điện thoại" value={form?.phone} onChange={(v) => onFormChange('phone', v)} />
               <EditField label="Email" value={form?.email} onChange={(v) => onFormChange('email', v)} />
               
               <div className="flex gap-3 pt-4">
                 <button 
                    disabled={loading}
                    onClick={onUpdate} 
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:bg-gray-400"
                 >
                    {loading ? "Đang lưu..." : "Lưu"}
                 </button>
                 <button 
                    onClick={onCancel} 
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                 >
                    Hủy
                 </button>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-red-500 font-bold py-3.5 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100">
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
}

function ProfileCard({ label, value, icon }) {
  return (
    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-indigo-100 transition-colors">
      <div className="flex items-center gap-2 text-gray-400 mb-1.5">
        <span className="text-indigo-500/70">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-[14px] font-bold text-gray-700 break-all">{value || "Chưa cập nhật"}</p>
    </div>
  );
}

function EditField({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-black text-gray-400 ml-2 uppercase tracking-tighter">{label}</label>
      <input 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-100 p-3.5 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold text-gray-700 transition-all"
      />
    </div>
  );
}