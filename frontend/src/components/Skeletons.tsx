import { FC } from "react";
import Skeleton from "./Skeleton";

export const ProductCardSkeleton: FC = () => {
  return (
    <div className="overflow-hidden border rounded-lg bg-white border-zinc-200">
      <div className="relative aspect-[4/3] bg-zinc-50">
        <Skeleton className="w-full h-full rounded-none" animation="pulse" />
      </div>
      <div className="p-3.5 space-y-2">
        <Skeleton width="35%" height="8px" />
        <Skeleton width="80%" height="14px" />
        <Skeleton width="50%" height="10px" />
        <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100">
          <Skeleton width="30%" height="16px" />
          <Skeleton width="20%" height="14px" />
        </div>
      </div>
    </div>
  );
};

export const HeroSkeleton: FC = () => {
  return (
    <section className="relative flex items-center justify-center min-h-[60vh] bg-zinc-50">
      <div className="mx-auto px-6 text-center space-y-5 max-w-7xl">
        <Skeleton width="40%" height="40px" className="mx-auto" />
        <Skeleton width="60%" height="20px" className="mx-auto" />
        <div className="flex gap-3 justify-center pt-3">
          <Skeleton width="120px" height="40px" />
          <Skeleton width="120px" height="40px" />
        </div>
      </div>
    </section>
  );
};

export const OrderCardSkeleton: FC = () => {
  return (
    <div className="p-5 space-y-4 border rounded-lg bg-white border-zinc-200">
      <div className="flex items-center justify-between">
        <Skeleton width="40%" height="16px" />
        <Skeleton width="25%" height="16px" />
      </div>
      <Skeleton width="100%" height="1px" />
      <div className="space-y-2">
        <Skeleton width="60%" height="12px" />
        <Skeleton width="50%" height="12px" />
      </div>
    </div>
  );
};

export const CheckoutSkeleton: FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Skeleton width="30%" height="28px" className="mb-6" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 space-y-4 border rounded-lg bg-white border-zinc-200">
              <Skeleton width="30%" height="16px" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton height="40px" />
                <Skeleton height="40px" />
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 space-y-4 border rounded-lg bg-white border-zinc-200">
          <Skeleton width="50%" height="16px" />
          <Skeleton height="1px" />
          <Skeleton width="70%" height="12px" />
          <Skeleton width="60%" height="12px" />
          <Skeleton height="40px" />
        </div>
      </div>
    </div>
  );
};
