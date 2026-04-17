import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const toastTypes = {
  success: {
    icon: <CheckCircle2 className="text-green-500" size={20} />,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-800",
    bar: "bg-green-500"
  },
  error: {
    icon: <AlertCircle className="text-red-500" size={20} />,
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    bar: "bg-red-500"
  },
  warning: {
    icon: <AlertTriangle className="text-amber-500" size={20} />,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    bar: "bg-amber-500"
  },
  info: {
    icon: <Info className="text-blue-500" size={20} />,
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    bar: "bg-blue-500"
  }
};

export const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  const config = toastTypes[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`fixed top-5 right-5 z-[100] animate-in fade-in slide-in-from-right-10 duration-300`}>
      <div className={`flex items-center gap-3 p-4 min-w-[300px] rounded-xl border shadow-lg ${config.bg} ${config.border} ${config.text}`}>
        {/* Icon */}
        <div className="shrink-0">{config.icon}</div>
        
        {/* Nội dung */}
        <div className="flex-1 text-[14px] font-medium">
          {message}
        </div>

        {/* Nút đóng */}
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/50 rounded-lg transition-colors"
        >
          <X size={16} className="opacity-50" />
        </button>

        {/* Progress Bar (Thanh đếm ngược chạy dưới đáy) */}
        <div className="absolute bottom-0 left-0 h-1 rounded-full w-full bg-black/5 overflow-hidden">
          <div 
            className={`h-full ${config.bar} animate-progress`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      </div>
    </div>
  );
};