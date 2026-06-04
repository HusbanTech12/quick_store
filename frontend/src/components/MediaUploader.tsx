"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Film, Check, Loader2 } from "lucide-react";
import { uploadAPI } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
  public_id?: string;
  error?: string;
}

interface MediaUploaderProps {
  folder?: string;
  product_id?: string;
  maxFiles?: number;
  accept?: string;
  onUploadComplete?: (results: { url: string; public_id: string }[]) => void;
  className?: string;
}

export default function MediaUploader({
  folder = "shop_pk/uploads",
  product_id,
  maxFiles = 10,
  accept = "image/*,video/mp4,video/webm",
  onUploadComplete,
  className = "",
}: MediaUploaderProps) {
  const { success, error: showError } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const remaining = maxFiles - files.length;
    if (remaining <= 0) {
      showError("Limit reached", `Maximum ${maxFiles} files allowed`);
      return;
    }

    const toAdd = Array.from(newFiles).slice(0, remaining);
    const newUploads: UploadedFile[] = toAdd.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newUploads]);
    uploadFiles(newUploads);
  }, [files.length, maxFiles, showError]);

  const uploadFiles = async (uploads: UploadedFile[]) => {
    const completed: { url: string; public_id: string }[] = [];

    for (const upload of uploads) {
      setFiles((prev) =>
        prev.map((f) => (f.id === upload.id ? { ...f, status: "uploading" } : f))
      );

      try {
        const res = await uploadAPI.upload(upload.file, folder, product_id, (percent) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === upload.id ? { ...f, progress: percent } : f))
          );
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === upload.id
              ? { ...f, status: "done", progress: 100, url: res.data.url, public_id: res.data.public_id }
              : f
          )
        );
        completed.push({ url: res.data.url, public_id: res.data.public_id });
      } catch (err: any) {
        const message = err?.response?.data?.detail || "Upload failed";
        setFiles((prev) =>
          prev.map((f) =>
            f.id === upload.id ? { ...f, status: "error", error: message } : f
          )
        );
        showError("Upload failed", message);
      }
    }

    if (onUploadComplete && completed.length > 0) {
      onUploadComplete(completed);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const isVideo = (file: File) => file.type.startsWith("video/");

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-brand bg-brand/5 scale-[1.02]"
            : "border-border hover:border-brand/50 hover:bg-muted/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full transition-colors ${
            isDragging ? "bg-brand text-white" : "bg-muted text-muted-foreground"
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse - Images & videos up to 50MB
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {files.length}/{maxFiles} files
          </span>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="relative group rounded-lg border border-border overflow-hidden bg-card"
            >
              {/* Preview */}
              <div className="aspect-square relative bg-muted">
                {isVideo(file.file) ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-10 h-10 text-muted-foreground" />
                    <video
                      src={file.preview}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <img
                    src={file.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                    className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Status badge */}
                {file.status === "done" && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                {file.status === "error" && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </div>
                )}
                {file.status === "uploading" && (
                  <div className="absolute top-1 left-1">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {file.status === "uploading" && (
                <div className="h-1 bg-muted">
                  <div
                    className="h-full bg-brand transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}

              {/* Info */}
              <div className="p-2">
                <p className="text-xs truncate text-muted-foreground">
                  {file.file.name}
                </p>
                {file.error && (
                  <p className="text-xs text-red-500 truncate mt-1">{file.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
