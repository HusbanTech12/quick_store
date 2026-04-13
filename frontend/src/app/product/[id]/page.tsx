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
import Button from "@/components/Button";
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
} from "lucide-react";

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
  const addItem = useCartStore((state) => state.addItem);
  const { success, error: showError } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [productRes, allProductsRes] = await Promise.all([
          productsAPI.getById(id),
          productsAPI.getAll({ limit: 20 }),
        ]);

        setProduct(productRes.data);

        // Get related products (same category, exclude current product)
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
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="skeleton h-96 rounded-xl" />
          <div className="space-y-4">
            <div className="skeleton h-10 w-3/4" />
            <div className="skeleton h-8 w-1/3" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-12 w-1/2" />
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

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => router.push("/products")}
          className="hover:text-foreground transition-colors"
        >
          Products
        </button>
        <ChevronRight className="w-4 h-4" />
        <button
          onClick={() => router.push(`/products?category=${product.category}`)}
          className="hover:text-foreground transition-colors"
        >
          {product.category}
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground line-clamp-1">{product.title}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-muted rounded-xl overflow-hidden aspect-square flex items-center justify-center">
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <Package className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No image available</p>
              </div>
            )}
          </div>

          {/* Thumbnail placeholders */}
          {product.image && (
            <div className="grid grid-cols-4 gap-3">
              {[product.image, product.image, product.image, product.image].map((img, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-colors ${
                    i === 0 ? "border-brand" : "border-border hover:border-brand/50"
                  }`}
                >
                  <img src={img} alt={`${product.title} view ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category & Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-brand uppercase tracking-wide">
              {product.category}
            </span>
            {product.is_featured && (
              <span className="bg-gradient-to-r from-brand to-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                ⭐ Featured
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            {product.title}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-warning text-warning" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">(4.5 rating)</span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Stock Status */}
          <div className="mb-6">
            {isOutOfStock ? (
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Out of Stock</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Only {product.stock} left in stock!</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-success">
                <Package className="w-5 h-5" />
                <span className="font-semibold">In Stock ({product.stock} available)</span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-16 text-center font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                  className="w-10 h-10 flex items-center justify-center border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            variant="primary"
            size="lg"
            fullWidth
            loading={isAdding}
            leftIcon={<ShoppingCart className="w-5 h-5" />}
            className="mb-4"
          >
            {isOutOfStock ? "Out of Stock" : isAdding ? "Added!" : `Add to Cart - $${(product.price * quantity).toFixed(2)}`}
          </Button>

          {/* Trust Signals */}
          <div className="grid grid-cols-1 gap-3 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-3 text-sm">
              <Truck className="w-5 h-5 text-brand" />
              <div>
                <p className="font-semibold">Free Shipping</p>
                <p className="text-muted-foreground">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-5 h-5 text-brand" />
              <div>
                <p className="font-semibold">Secure Checkout</p>
                <p className="text-muted-foreground">SSL encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <RefreshCw className="w-5 h-5 text-brand" />
              <div>
                <p className="font-semibold">Easy Returns</p>
                <p className="text-muted-foreground">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16" aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl lg:text-3xl font-bold mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
