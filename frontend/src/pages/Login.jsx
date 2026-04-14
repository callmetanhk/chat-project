import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, LogIn, ArrowRight, Sparkles } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/auth/login/", form);
      const data = res.data.data;

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      alert("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafc] relative overflow-hidden p-4">
      {/* Background Decor - Giữ hiệu ứng đốm màu giống Register */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px]" />

      <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] w-full max-w-[420px] border border-white/60 relative z-10">
        
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-2xl mb-6 shadow-lg shadow-blue-200 rotate-3">
            <LogIn size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2">Chào mừng trở lại</h2>
          <p className="text-gray-500 font-medium">Vui lòng đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 ml-1 uppercase tracking-widest">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập..."
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mật khẩu</label>
              <a href="#" className="text-[11px] font-bold text-blue-600 hover:text-blue-700">Quên mật khẩu?</a>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-gray-200 rounded-2xl outline-none transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-sm"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            className="group w-full mt-4 flex items-center justify-center gap-3 bg-gray-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-blue-200 active:scale-[0.97] disabled:opacity-70"
          >
            {loading ? "Đang xác thực..." : (
              <>
                Đăng nhập ngay
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 text-center">
          <p className="text-gray-500 font-medium">
            Mới đến với chúng tôi?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:text-blue-700 transition-colors decoration-2 underline-offset-4 hover:underline"
            >
              Tạo tài khoản
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}