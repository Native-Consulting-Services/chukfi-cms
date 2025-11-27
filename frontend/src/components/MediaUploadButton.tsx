import React, { useRef } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

interface MediaUploadButtonProps {
  onUpload: (files: FileList) => void;
  uploading?: boolean;
}

export default function MediaUploadButton({
  onUpload,
  uploading = false,
}: MediaUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      // Reset input so same file can be uploaded again
      e.target.value = "";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Uploading...
          </>
        ) : (
          <>
            <ArrowUpTrayIcon className="mr-2 h-4 w-4" />
            Upload Media
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
