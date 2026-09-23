"use client";

import CustomImage from "@/components/common/CustomImage";
import { cn } from "@/lib/utils";

const UserAvatar = ({
  src,
  initial,
  avatarColor,
  alt = "User avatar",
  size = 40,
  className,
  ...props
}) => {
  if (!src && initial) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full text-white font-medium uppercase shrink-0",
          className
        )}
        style={{ width: size, height: size, backgroundColor: avatarColor || "#9ca3af", fontSize: size / 2.2 }}
        title={alt}
      >
        {initial.charAt(0)}
      </div>
    );
  }

  return (
    <CustomImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover aspect-square shrink-0", className)}
      {...props}
    />
  );
};

export default UserAvatar;
