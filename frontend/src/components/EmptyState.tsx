"use client";

import { FC, ReactNode } from "react";
import { Package, ShoppingCart, Search, AlertTriangle, Ban } from "lucide-react";
import Link from "next/link";
import Button from "./Button";

export type EmptyStateType = "cart" | "products" | "orders" | "search" | "general";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

const icons = {
  cart: ShoppingCart,
  products: Package,
  orders: Package,
  search: Search,
  general: AlertTriangle,
};

const EmptyState: FC<EmptyStateProps> = ({
  type = "general",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
}) => {
  const Icon = icon || icons[type];

  const defaultContent = {
    cart: {
      title: "Your cart is empty",
      description: "Looks like you haven't added anything to your cart yet.",
      actionLabel: "Start Shopping",
      actionHref: "/products",
    },
    products: {
      title: "No products found",
      description: "Try adjusting your filters or search terms.",
      actionLabel: "Clear Filters",
      actionHref: "/products",
    },
    orders: {
      title: "No orders yet",
      description: "You haven't placed any orders yet. Start shopping to see them here!",
      actionLabel: "Browse Products",
      actionHref: "/products",
    },
    search: {
      title: "No results found",
      description: "We couldn't find what you're looking for. Try a different search term.",
      actionLabel: "View All Products",
      actionHref: "/products",
    },
    general: {
      title: "Nothing here yet",
      description: "There's nothing to display at the moment.",
    },
  };

  const content = {
    title: title || defaultContent[type].title,
    description: description || defaultContent[type].description,
    actionLabel: actionLabel || defaultContent[type].actionLabel,
    actionHref: actionHref || defaultContent[type].actionHref,
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
        {typeof Icon === "function" ? (
          <Icon className="w-10 h-10 text-muted-foreground" />
        ) : (
          Icon
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{content.description}</p>
      {content.actionLabel && (
        actionHref ? (
          <Link href={content.actionHref}>
            <Button variant="primary">{content.actionLabel}</Button>
          </Link>
        ) : onAction ? (
          <Button variant="primary" onClick={onAction}>
            {content.actionLabel}
          </Button>
        ) : null
      )}
    </div>
  );
};

export default EmptyState;
