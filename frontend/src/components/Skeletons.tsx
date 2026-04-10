import { FC } from "react";
import Skeleton from "./Skeleton";

export const ProductCardSkeleton: FC = () => {
  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden card-interactive">
      {/* Image Skeleton */}
      <div className="relative h-56 bg-muted">
        <Skeleton className="w-full h-full rounded-none" animation="pulse" />
      </div>

      {/* Content Skeleton */}
      <div className="p-5 space-y-3">
        <Skeleton width="75%" height="20px" />
        <Skeleton width="50%" height="16px" />
        <Skeleton width="100%" height="40px" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton width="30%" height="24px" />
          <Skeleton width="35%" height="36px" />
        </div>
      </div>
    </div>
  );
};

export const HeroSkeleton: FC = () => {
  return (
    <section className="relative min-h-[60vh] bg-muted flex items-center justify-center">
      <div className="container mx-auto px-4 text-center space-y-6">
        <Skeleton width="60%" height="48px" className="mx-auto" />
        <Skeleton width="80%" height="24px" className="mx-auto" />
        <div className="flex gap-4 justify-center pt-4">
          <Skeleton width="150px" height="48px" />
          <Skeleton width="150px" height="48px" />
        </div>
      </div>
    </section>
  );
};

export const OrderCardSkeleton: FC = () => {
  return (
    <div className="bg-card rounded-xl shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width="40%" height="20px" />
        <Skeleton width="25%" height="20px" />
      </div>
      <Skeleton width="100%" height="1px" />
      <div className="space-y-2">
        <Skeleton width="60%" height="16px" />
        <Skeleton width="50%" height="16px" />
      </div>
    </div>
  );
};

export const CheckoutSkeleton: FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Skeleton width="40%" height="32px" className="mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl shadow-md p-6 space-y-4">
              <Skeleton width="30%" height="20px" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton height="44px" />
                <Skeleton height="44px" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-card rounded-xl shadow-md p-6 space-y-4">
          <Skeleton width="50%" height="20px" />
          <Skeleton height="1px" />
          <Skeleton width="70%" height="16px" />
          <Skeleton width="60%" height="16px" />
          <Skeleton height="44px" />
        </div>
      </div>
    </div>
  );
};
