import { FC } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "shimmer";
}

const Skeleton: FC<SkeletonProps> = ({
  className = "",
  variant = "rounded",
  width,
  height,
  animation = "shimmer",
}) => {
  const variantClasses = {
    text: "rounded-none",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-md",
  };

  const style: React.CSSProperties = {
    width: width ? (typeof width === "number" ? `${width}px` : width) : undefined,
    height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
  };

  if (animation === "pulse") {
    return (
      <div
        className={`bg-muted animate-pulse-slow ${variantClasses[variant]} ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`skeleton ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;
