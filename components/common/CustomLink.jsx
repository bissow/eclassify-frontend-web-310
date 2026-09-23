"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { getDefaultLanguageCode } from "@/store/slices/settingSlice";

const CustomLink = ({ href, children, ...props }) => {
  const { lang } = useParams();
  const defaultLangCode = useSelector(getDefaultLanguageCode);

  const [basePath, hash] = href.split("#");
  const finalPath = basePath.startsWith("/") ? basePath : `/${basePath}`;

  const newHref = lang === defaultLangCode
    ? `${finalPath}${hash ? `#${hash}` : ""}`
    : `/${lang}${finalPath}${hash ? `#${hash}` : ""}`;

  return (
    <Link href={newHref} {...props}>
      {children}
    </Link>
  );
};

export default CustomLink;
