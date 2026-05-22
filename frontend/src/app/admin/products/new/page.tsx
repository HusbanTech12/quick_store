"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ToastProvider";
import { productsAPI, uploadAPI } from "@/lib/api";
import Button from "@/components/Button";
import MediaUploader from "@/components/MediaUploader";
import { ArrowLeft, Save, Package, Upload, Image as ImageIcon, X, Plus } from "lucide-react";
import type { ProductImage } from "@/types";

export default function NewProductPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showGalleryUploader, setShowGalleryUploader] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
    is_featured: false,
  });

  const [galleryImages, setGalleryImages] = useState<ProductImage[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = "Valid stock quantity is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const productData = {
        title: formData.title,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.image || undefined,
        stock: parseInt(formData.stock),
        is_featured: formData.is_featured,
      };

      await productsAPI.create(productData);
      success("Product created", "Product has been added successfully");
      router.push("/admin/products");
    } catch (err: any) {
      const message = err?.response?.data?.detail || "Failed to create product";
      showError("Creation failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Invalid file", "Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("File too large", "Image must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const res = await uploadAPI.upload(file);
      setFormData((prev) => ({ ...prev, image: res.data.url }));
      success("Image uploaded", "Image has been uploaded successfully");
    } catch (err: any) {
      showError("Upload failed", err?.response?.data?.detail || "Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleGalleryComplete = (results: { url: string; public_id: string }[]) => {
    const newImages: ProductImage[] = results.map((r, i) => ({
      id: crypto.randomUUID(),
      product_id: "",
      secure_url: r.url,
      public_id: r.public_id,
      resource_type: "image",
      is_primary: false,
      sort_order: galleryImages.length + i,
      created_at: new Date().toISOString(),
    }));
    setGalleryImages((prev) => [...prev, ...newImages]);
    if (!formData.image && newImages.length > 0) {
      setFormData((prev) => ({ ...prev, image: newImages[0].secure_url }));
    }
    setShowGalleryUploader(false);
    success("Gallery updated", "Images added to gallery");
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (isLoaded && !user) {
      window.location.href = "/login?redirect_url=" + encodeURIComponent("/admin/products/new");
    }
  }, [isLoaded, user]);

  if (!isLoaded || !user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="mb-4"
        >
          Back
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-light rounded-xl">
            <Package className="w-8 h-8 text-brand" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
              Add New Product
            </h1>
            <p className="text-muted-foreground">
              Create a new product in your catalog
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Product Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
                errors.title ? "border-error" : "border-border"
              }`}
              placeholder="Enter product title"
            />
            {errors.title && (
              <p className="text-sm text-error mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Enter product description"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium mb-2">
                Price ($) *
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
                  errors.price ? "border-error" : "border-border"
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-error mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium mb-2">
                Stock Quantity *
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
                  errors.stock ? "border-error" : "border-border"
                }`}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-sm text-error mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category *
            </label>
            <input
              id="category"
              name="category"
              type="text"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand ${
                errors.category ? "border-error" : "border-border"
              }`}
              placeholder="e.g., Electronics, Clothing, Books"
            />
            {errors.category && (
              <p className="text-sm text-error mt-1">{errors.category}</p>
            )}
          </div>

          {/* Thumbnail Image */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Product Thumbnail
            </label>
            <div className="flex items-start gap-4">
              {formData.image ? (
                <div className="relative group">
                  <img
                    src={formData.image}
                    alt="Product"
                    className="w-32 h-32 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 space-y-3">
                <label className="flex items-center justify-center w-full px-4 py-3 border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {uploading ? "Uploading..." : "Upload Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground">
                  Upload an image or paste a URL below. Max 5MB.
                </p>
              </div>
            </div>
            <div className="mt-3">
              <input
                id="image"
                name="image"
                type="url"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
                placeholder="Or paste image URL: https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Gallery Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Gallery Images
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowGalleryUploader(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Images
              </Button>
            </div>

            {galleryImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {galleryImages.map((img, index) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.secure_url}
                      alt={`Gallery ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showGalleryUploader && (
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <MediaUploader
                  folder="shop_pk/products"
                  onUploadComplete={handleGalleryComplete}
                  className="mb-2"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGalleryUploader(false)}
                  className="mt-2"
                >
                  Cancel
                </Button>
              </div>
            )}

            {galleryImages.length === 0 && !showGalleryUploader && (
              <p className="text-sm text-muted-foreground">
                No gallery images yet. Click "Add Images" to add product photos.
              </p>
            )}
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              id="is_featured"
              name="is_featured"
              type="checkbox"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-5 h-5 text-brand border-border rounded focus:ring-2 focus:ring-brand"
            />
            <label htmlFor="is_featured" className="text-sm font-medium cursor-pointer">
              Mark as featured product
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            leftIcon={<Save className="w-5 h-5" />}
            fullWidth
          >
            Create Product
          </Button>
        </div>
      </form>
    </div>
  );
}
