"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { uploadAPI } from "@/lib/api";
import MediaUploader from "@/components/MediaUploader";
import Button from "@/components/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Image as ImageIcon, Trash2, Film, HardDrive, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import type { MediaItem, UploadStats } from "@/types";

export default function UploadsPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const fetchedRef = useRef(false);

  const fetchMedia = async () => {
    try {
      const [mediaRes, statsRes] = await Promise.all([
        uploadAPI.list("shop_pk/uploads", 100),
        uploadAPI.stats(),
      ]);
      setMedia(mediaRes.data.images);
      setStats(statsRes.data);
    } catch {
      showError("Failed to load", "Could not fetch media list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchMedia();
  }, []);

  const handleDelete = async (item: MediaItem) => {
    setDeleting(item.public_id);
    try {
      await uploadAPI.delete(item.public_id, item.resource_type);
      setMedia((prev) => prev.filter((m) => m.public_id !== item.public_id));
      success("Deleted", "Media file has been deleted");
      fetchMedia();
    } catch {
      showError("Delete failed", "Could not delete media file");
    } finally {
      setDeleting(null);
    }
  };

  const handleUploadComplete = () => {
    setShowUploader(false);
    fetchMedia();
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upload Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your media files and product gallery images
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowUploader(!showUploader)}
          leftIcon={<ImageIcon className="w-4 h-4" />}
        >
          {showUploader ? "Close Uploader" : "Upload Media"}
        </Button>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total_images}</p>
              <p className="text-sm text-muted-foreground">Total Images</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total_products_with_images}</p>
              <p className="text-sm text-muted-foreground">Products with Images</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <HardDrive className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total_gallery_images}</p>
              <p className="text-sm text-muted-foreground">Gallery Images</p>
            </div>
          </div>
        </div>
      )}

      {/* Uploader */}
      {showUploader && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Upload New Media</h2>
          <MediaUploader
            folder="shop_pk/uploads"
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}

      {/* Media grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          All Media ({media.length})
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : media.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No media files uploaded yet</p>
            <Button
              variant="primary"
              onClick={() => setShowUploader(true)}
              className="mt-4"
            >
              Upload your first file
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {media.map((item) => (
              <div
                key={item.public_id}
                className="group relative rounded-lg border border-border overflow-hidden bg-card"
              >
                <div className="aspect-square relative bg-muted">
                  {item.resource_type === "video" ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-10 h-10 text-muted-foreground" />
                    </div>
                  ) : (
                    <img
                      src={item.secure_url}
                      alt={item.public_id}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a
                      href={item.secure_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-foreground" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deleting === item.public_id}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <p className="text-xs truncate text-muted-foreground">
                    {item.public_id.split("/").pop()}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="capitalize">{item.resource_type}</span>
                    {item.format && <span>.{item.format}</span>}
                    <span className="ml-auto">{formatBytes(item.bytes)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
