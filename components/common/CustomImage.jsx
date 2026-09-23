"use client";

import Image from "next/image";
import { useState } from "react";
import { useSelector } from "react-redux";
import { getPlaceholderImage } from "@/store/slices/settingSlice";

const FALLBACK_IMAGE = "/assets/Transperant_Placeholder.png";

const CustomImage = ({ src, alt = "Image", loading = "lazy", ...props }) => {
  const placeholderImage = useSelector(getPlaceholderImage);
  const [isError, setIsError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (prevSrc !== src) {
    setPrevSrc(src);
    setIsError(false);
  }

  const fallbackSrc = placeholderImage || FALLBACK_IMAGE;
  const finalSrc = !isError && src ? src : fallbackSrc;

  return (
    <Image
      key={typeof finalSrc === "string" ? finalSrc : undefined}
      src={finalSrc}
      alt={alt}
      loading={loading}
      onError={() => setIsError(true)}
      {...props}
    />
  );
};

export default CustomImage;
