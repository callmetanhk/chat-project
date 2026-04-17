import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, LogIn, ArrowRight, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { Toast } from "../components/ui/Toast";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const showToast = (msg, type) => {
    setNotification({ msg, type });
  };
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
      showToast("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!", "error");
      // alert("Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    console.log(`Đang kết nối đến ${platform}...`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f4f8] relative overflow-hidden p-6">
      {/* Background Decor  */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] rounded-full bg-blue-200/30 blur-[100px]" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full bg-indigo-200/30 blur-[100px]" />

      <div className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[440px] border border-white relative z-10">

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <LogIn size={28} />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Mừng bạn quay lại!</h2>
          <p className="text-gray-500 text-sm mt-1">Đăng nhập để khám phá những điều tuyệt vời</p>
        </div>

        {/* Main Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1 tracking-wider">Tên đăng nhập</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="username"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          {/* password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Mật khẩu</label>
              <button type="button" className="text-[11px] font-bold text-blue-600 hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            <div className="relative group">
              {/* Icon khóa bên trái */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Lock size={18} />
              </div>

              <input
                type={showPassword ? "text" : "password"} // Thay đổi type dựa trên state
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />

              {/* Nút Ẩn/Hiện bên phải */}
              <button
                type="button" // Quan trọng: phải là type="button" để không làm trigger submit form
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-400 font-medium">Hoặc tiếp tục với</span>
          </div>
        </div>

        {/* Social Login Buttons  */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-2 py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <FcGoogle size={20} />
            <span className="text-sm font-semibold text-gray-600">Google</span>
          </button>

          <button
            onClick={() => handleSocialLogin('facebook')}
            className="flex items-center justify-center gap-2 py-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <FaFacebook size={20} className="text-[#1877F2]" />
            <span className="text-sm font-semibold text-gray-600">Facebook</span>
          </button>
        </div>

        {/* Signup Link */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-600 font-bold hover:underline underline-offset-4">
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </div>
  );
}