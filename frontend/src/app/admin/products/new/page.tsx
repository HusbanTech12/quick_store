"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { productsAPI } from "@/lib/api";
import Button from "@/components/Button";
import { ArrowLeft, Save, Package } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
    is_featured: false,
  });

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

  if (!user || !user.is_admin) {
    router.push("/");
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

          {/* Image URL */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-2">
              Image URL
            </label>
            <input
              id="image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="https://example.com/image.jpg"
            />
            {formData.image && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
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
