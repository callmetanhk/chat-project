import { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Lock, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

// 1. TÁCH BIỆT: Đưa InputField ra ngoài Register để tránh mất focus khi re-render
const InputField = ({ icon: Icon, type = "text", name, placeholder, value, onChange, showPassword, setShowPassword, error }) => {
  const isPassword = name === "password";
  
  return (
    <div className="mb-4 w-full">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300">
          <Icon size={18} />
        </div>
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          name={name}
          className={`w-full pl-11 pr-11 py-3.5 bg-gray-50/50 border rounded-xl outline-none transition-all duration-300 
            ${error 
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
              : "border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
            }`}
          onChange={onChange}
          value={value}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-[11px] mt-1.5 ml-1 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-left-1">
           {error}
        </p>
      )}
    </div>
  );
};

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    full_name: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!form.username) newErrors.username = "Tên đăng nhập không được để trống";
    if (!form.email) newErrors.email = "Email không được để trống";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email không hợp lệ";
    if (!form.full_name) newErrors.full_name = "Họ và tên không được để trống";
    if (!form.phone) newErrors.phone = "Số điện thoại không được để trống";
    if (!form.password) newErrors.password = "Mật khẩu không được để trống";
    else if (form.password.length < 6)
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validateErrors = validate();
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post("/auth/register/", form);
      navigate("/login");
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      if (backendErrors) {
        setErrors(backendErrors);
      } else {
        alert("Đăng ký thất bại. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#fdfdff] p-4 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-purple-50 rounded-full blur-[100px] opacity-60" />
      </div>

      <div className="w-full max-w-[1000px] grid lg:grid-cols-2 bg-white rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100 relative z-10">
        
        {/* Left Side */}
        <div className="hidden lg:flex flex-col justify-between bg-indigo-600 p-12 text-white relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-12">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                        <Sparkles size={24} className="text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">YourBrand</span>
                </div>
                <h1 className="text-4xl font-extrabold leading-tight mb-6">
                    Bắt đầu hành trình <br/> sáng tạo của bạn.
                </h1>
                <p className="text-indigo-100 text-lg font-medium opacity-90 max-w-sm">
                    Tham gia cùng hơn 10.000+ người dùng để trải nghiệm dịch vụ chuyên nghiệp nhất.
                </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Tạo tài khoản</h2>
            <p className="text-gray-500 font-medium">Hoàn thành thông tin bên dưới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-1">
            {/* 2. THAY ĐỔI: Bỏ grid chia cột ở Username & Họ tên để chúng dài ra toàn bộ chiều ngang */}
            <div className="flex flex-col">
              <InputField icon={User} name="username" placeholder="Tên đăng nhập" value={form.username} onChange={handleChange} error={errors.username} />
              <InputField icon={User} name="full_name" placeholder="Họ và tên đầy đủ" value={form.full_name} onChange={handleChange} error={errors.full_name} />
            </div>
            
            <InputField icon={Mail} name="email" type="email" placeholder="Email công việc" value={form.email} onChange={handleChange} error={errors.email} />
            <InputField icon={Phone} name="phone" placeholder="Số điện thoại" value={form.phone} onChange={handleChange} error={errors.phone} />
            <InputField 
              icon={Lock} 
              name="password" 
              placeholder="Mật khẩu (ít nhất 6 ký tự)" 
              value={form.password} 
              onChange={handleChange} 
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              error={errors.password} 
            />

            <button
              disabled={loading}
              className={`group w-full mt-6 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-indigo-200 active:scale-[0.98] ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Đang xử lý...
                </span>
              ) : (
                <>
                  Đăng ký tài khoản
                  <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <p className="text-gray-500 font-medium">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}