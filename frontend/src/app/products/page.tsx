import { Suspense } from "react";
import ProductsClient from "./ProductsClient";
import { ProductCardSkeleton } from "@/components/Skeletons";

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <div className="mb-8">
            <div className="skeleton h-10 w-48 mb-2" />
            <div className="skeleton h-5 w-32" />
          </div>
          <div className="skeleton h-16 rounded-xl mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
