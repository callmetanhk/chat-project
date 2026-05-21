export const FilePreview = ({ previews, removeFile }) => {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {previews.map((file, index) => (
        <div
          key={index}
          className="relative bg-gray-100 px-3 py-2 rounded-lg text-sm"
        >
          <p className="max-w-[120px] truncate">
            {file.name}
          </p>

          <button
            onClick={() => removeFile(index)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};