export const MessageInput = ({ 
  input, setInput, sendMessage, handleFileChange, fileInputRef, 
  previews, removeFile, hasContentOrFiles 
}) => (
  <div className="p-4 bg-white border-t border-gray-100">
    {/* File Preview Sub-component */}
    {previews.length > 0 && <FilePreview previews={previews} removeFile={removeFile} />}

    <div className="flex items-end gap-3 bg-gray-100/80 rounded-2xl px-4 py-2.5 focus-within:bg-white shadow-inner">
      <button className="text-gray-400 hover:text-indigo-600 mb-1"><Smile size={22} /></button>
      
      <textarea 
        className="flex-1 bg-transparent outline-none text-sm py-1.5 resize-none max-h-32" 
        placeholder="Viết tin nhắn..." 
        rows="1"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
      />

      <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
      
      <button onClick={() => fileInputRef.current.click()} className="mb-1 text-gray-400"><Paperclip size={21} /></button>

      <button 
        onClick={sendMessage} 
        disabled={!hasContentOrFiles}
        className={`mb-1 p-1.5 rounded-full ${hasContentOrFiles ? "bg-indigo-600 text-white" : "text-gray-300 cursor-not-allowed"}`}
      >
        <Send size={18} strokeWidth={2.5} />
      </button>
    </div>
  </div>
);