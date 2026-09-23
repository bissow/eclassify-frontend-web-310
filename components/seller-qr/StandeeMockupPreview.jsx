"use client";

import CustomImage from "@/components/common/CustomImage";
import { QrCodeIcon, StorefrontIcon, CheckCircleIcon } from "@phosphor-icons/react";

export default function StandeeMockupPreview({
  storeName = "Your Store Name",
  storeLocation = "City, State",
  storeLogo = null,
  isVerified = false,
  tagline = "Explore all verified ads, items and exclusive offers",
  themeColor = "#00B2CA",
  headerTitle = "Scan to Browse Store & Catalog",
  badgeText = "DIGITAL STORE & CATALOG",
  footerText = "Powered by Bissow.com",
  footerLogo = null,
  centerLogo = null,
  qrSvgRaw = null,
  qrUrl = null,
  format = "pdf",
  size = "standee",
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Acrylic Standee Physical Frame */}
      <div className="relative mx-auto w-full max-w-[320px] rounded-[24px] bg-neutral-900/90 p-3 shadow-2xl ring-1 ring-white/10 dark:bg-neutral-950">
        {/* Subtle Acrylic Reflection Overlay */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[22px] bg-gradient-to-b from-white/15 to-transparent" />

        {/* Printable Standee Card Inside */}
        <div
          className="relative overflow-hidden rounded-2xl bg-white p-5 text-center shadow-sm"
          style={{
            borderTop: `8px solid ${themeColor}`,
          }}
        >
          {/* Top Pill Badge */}
          <div
            className="inline-block rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider"
            style={{
              backgroundColor: `${themeColor}18`,
              color: themeColor,
            }}
          >
            {badgeText || "DIGITAL STORE & CATALOG"}
          </div>

          {/* Standee Header Title */}
          <h3 className="mt-2.5 text-base font-extrabold text-neutral-900 line-clamp-1">
            {headerTitle || "Scan to Browse Store & Catalog"}
          </h3>

          {/* Tagline */}
          <p className="mt-1 text-[11px] text-neutral-500 line-clamp-2 px-1">
            {tagline || "Explore all verified ads, items and exclusive offers"}
          </p>

          {/* QR Box Wrapper */}
          <div
            className="my-3.5 mx-auto rounded-2xl bg-white p-3 shadow-sm transition-all"
            style={{
              border: `2.5px solid ${themeColor}`,
              maxWidth: "200px",
            }}
          >
            <div className="relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden">
              {qrSvgRaw && typeof qrSvgRaw === "string" && qrSvgRaw.trim().startsWith("<svg") ? (
                <div
                  className="h-full w-full flex items-center justify-center [&_svg]:h-full [&_svg]:w-full [&_svg]:object-contain"
                  dangerouslySetInnerHTML={{ __html: qrSvgRaw }}
                />
              ) : qrSvgRaw && typeof qrSvgRaw === "string" && (qrSvgRaw.startsWith("data:image/") || qrSvgRaw.startsWith("http") || qrSvgRaw.startsWith("/")) ? (
                <img
                  src={qrSvgRaw}
                  alt="Store QR Code"
                  className="h-full w-full object-contain"
                />
              ) : qrUrl ? (
                <div className="relative h-full w-full flex items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=${themeColor ? themeColor.replace('#', '') : '0b57d0'}&data=${encodeURIComponent(qrUrl)}`}
                    alt="Store QR Code Preview"
                    className="h-full w-full object-contain"
                  />
                  {centerLogo && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center overflow-hidden p-1">
                      <img src={centerLogo} alt="Center Logo" className="h-full w-full object-contain" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-400">
                  <QrCodeIcon size={76} weight="duotone" style={{ color: themeColor }} />
                  <span className="mt-1 text-[9px] text-neutral-400">QR Code Preview</span>
                </div>
              )}
            </div>

            {/* Scan Action Pill Badge */}
            <div
              className="mt-2 rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-wide uppercase text-white shadow-xs"
              style={{ backgroundColor: "#0F172A" }}
            >
              SCAN TO VIEW ALL ADS & OFFERS
            </div>
          </div>

          {/* Store Info Card */}
          <div className="mb-3 rounded-xl border border-neutral-200/80 bg-neutral-50/90 p-2.5 text-left flex items-center gap-2.5 shadow-2xs">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200"
              style={{ backgroundColor: `${themeColor}12` }}
            >
              {storeLogo ? (
                <CustomImage
                  src={storeLogo}
                  alt={storeName}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                <StorefrontIcon size={20} weight="duotone" style={{ color: themeColor }} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-neutral-900 truncate">
                  {storeName}
                </span>
                {isVerified && (
                  <CheckCircleIcon size={13} weight="fill" className="text-sky-600 shrink-0" />
                )}
              </div>
              {storeLocation && (
                <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                  {storeLocation}
                </p>
              )}
            </div>
          </div>

          {/* Standee Footer Branding */}
          <div className="border-t border-dashed border-neutral-200 pt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-neutral-400">
            <span>{footerText || "Powered by Bissow.com"}</span>
            {footerLogo && (
              <img
                src={footerLogo}
                alt="Brand Logo"
                className="h-3.5 max-w-[60px] object-contain inline-block"
              />
            )}
          </div>
        </div>
      </div>

      {/* Stand Base Acrylic Representation */}
      <div className="mt-1 h-3 w-44 rounded-full bg-neutral-800/70 blur-[2px] dark:bg-black" />
    </div>
  );
}
