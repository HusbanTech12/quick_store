"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useToast } from "@/components/ToastProvider";
import { productsAPI } from "@/lib/api";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/Skeletons";
import EmptyState from "@/components/EmptyState";
import {
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  ChevronRight,
  Package,
  AlertTriangle,
  ArrowLeft,
  Heart,
  Share2,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const { success } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [productRes, allProductsRes] = await Promise.all([
          productsAPI.getById(id),
          productsAPI.getAll({ limit: 20 }),
        ]);

        setProduct(productRes.data);

        const related = allProductsRes.data
          .filter((p: Product) => p.category === productRes.data.category && p.id !== id)
          .slice(0, 4);
        setRelatedProducts(related);

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load product";
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;

    setIsAdding(true);
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    success("Added to cart", `${quantity}x ${product.title}`);
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleQuantityChange = (newQty: number) => {
    if (newQty >= 1 && newQty <= (product?.stock || 1)) {
      setQuantity(newQty);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-6 py-12 max-w-7xl lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="skeleton aspect-square rounded-lg" />
          <div className="space-y-4">
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-5 w-1/3" />
            <div className="skeleton h-16 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <EmptyState
        type="general"
        title="Product not found"
        description={error || "This product doesn't exist"}
        actionLabel="Back to Products"
        actionHref="/products"
      />
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const images = product.image ? [product.image, product.image, product.image, product.image] : [];

  return (
    <div className="mx-auto px-6 py-8 max-w-7xl lg:px-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 mb-8 text-xs text-zinc-400" aria-label="Breadcrumb">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>
        <ChevronRight className="w-2.5 h-2.5" />
        <button
          onClick={() => router.push("/products")}
          className="transition-colors hover:text-zinc-900"
        >
          Products
        </button>
        <ChevronRight className="w-2.5 h-2.5" />
        <button
          onClick={() => router.push(`/products?category=${product.category}`)}
          className="transition-colors hover:text-zinc-900"
        >
          {product.category}
        </button>
        <ChevronRight className="w-2.5 h-2.5" />
        <span className="font-medium truncate text-zinc-600 line-clamp-1">{product.title}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 gap-8 mb-16 lg:gap-12 lg:grid-cols-2">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-3"
        >
          <div className="overflow-hidden border rounded-lg border-zinc-200 bg-zinc-50">
            {product.image ? (
              <img
                src={images[activeImage]}
                alt={product.title}
                className="object-cover w-full transition-transform duration-500 aspect-square hover:scale-[1.02]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center w-full aspect-square">
                <Package className="w-12 h-12 mb-2 text-zinc-300" />
                <p className="text-sm text-zinc-400">No image available</p>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden transition-all border rounded-md aspect-square ${
                    i === activeImage
                      ? "border-zinc-900"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <img src={img} alt={`${product.title} view ${i + 1}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex flex-col"
        >
          {/* Category & Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-sm bg-zinc-100 text-zinc-500">
              {product.category}
            </span>
            {product.is_featured && (
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-sm bg-zinc-900 text-white">
                Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="mb-3 text-h1 text-zinc-900">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-px">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-zinc-900 text-zinc-900" />
              ))}
            </div>
            <span className="text-sm text-zinc-500">4.5 (128 reviews)</span>
          </div>

          {/* Price */}
          <div className="mb-5">
            <span className="text-2xl font-semibold text-zinc-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="mb-5 text-sm leading-relaxed text-zinc-500">
              {product.description}
            </p>
          )}

          {/* Stock Status */}
          <div className="p-3 mb-5 rounded-md bg-zinc-50">
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Only {product.stock} left</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-zinc-600">
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">In Stock ({product.stock} available)</span>
              </div>
            )}
          </div>

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="mb-5">
              <label className="block mb-2 text-xs font-medium text-zinc-500">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="flex items-center justify-center w-8 h-8 transition-colors border rounded-md border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-sm font-medium text-center text-zinc-900">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="flex items-center justify-center w-8 h-8 transition-colors border rounded-md border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 mb-8 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAdding}
              className="flex items-center justify-center flex-1 gap-2 px-5 py-2.5 text-sm font-medium text-white transition-colors rounded-md bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className={`w-4 h-4 ${isAdding ? "animate-spin" : ""}`} />
              {isOutOfStock ? "Out of Stock" : isAdding ? "Added!" : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`flex items-center justify-center p-2.5 transition-colors border rounded-md ${
                isWishlisted
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
              }`}
              aria-label="Add to wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-white" : ""}`} />
            </button>
            <button
              className="p-2.5 transition-colors border rounded-md border-zinc-200 text-zinc-500 hover:bg-zinc-50"
              aria-label="Share product"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Trust Signals */}
          <div className="pt-5 mt-auto space-y-3 border-t border-zinc-200">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
              { icon: Shield, title: "Secure Checkout", desc: "SSL encrypted payments" },
              { icon: RefreshCw, title: "Easy Returns", desc: "30-day return policy" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-md bg-zinc-100">
                  <item.icon className="w-4 h-4 text-zinc-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-12 border-t border-zinc-200" aria-labelledby="related-heading">
          <div className="mb-8">
            <h2 id="related-heading" className="text-h2 text-zinc-900">
              You May Also Like
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct, i) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
