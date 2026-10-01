"use client";

import { useState } from "react";

type Props = {
  label: string;
  type: "resume" | "profilePic" | "offerLetter";
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  accept: string;
};

export default function FileUpload({ label, type, currentUrl, onUploaded, accept }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    setUploading(false);

    if (data.error) {
      setError(data.error);
    } else {
      onUploaded(data.url);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-1 block text-sm text-blue-600 hover:underline"
        >
          View current file
        </a>
      )}
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        className="mt-1 w-full text-sm"
      />
      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}