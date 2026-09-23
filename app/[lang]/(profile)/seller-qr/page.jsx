"use client";

import { useEffect, useState } from "react";
import { sellerQrApi } from "@/lib/api";
import StandeeMockupPreview from "@/components/seller-qr/StandeeMockupPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QrCodeIcon,
  DownloadSimpleIcon,
  FloppyDiskIcon,
  CopyIcon,
  CheckIcon,
  StorefrontIcon,
  CrownIcon,
  CircleNotchIcon,
  ChartBarIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COLOR_PRESETS = [
  { label: "Google Blue", hex: "#0b57d0" },
  { label: "Teal Green", hex: "#0f766e" },
  { label: "Royal Purple", hex: "#6b21a8" },
  { label: "Crimson Red", hex: "#b91c1c" },
  { label: "Slate Navy", hex: "#1e293b" },
  { label: "Amber Gold", hex: "#b45309" },
];

export default function SellerQrManagementPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [settings, setSettings] = useState(null);

  // Permissions and Base URL
  const [canCustomizeColors, setCanCustomizeColors] = useState(true);
  const [canCustomizeLogo, setCanCustomizeLogo] = useState(true);
  const [canCustomizeSlug, setCanCustomizeSlug] = useState(true);
  const [catalogBaseUrl, setCatalogBaseUrl] = useState("");

  // Form Fields
  const [customSlug, setCustomSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [themeColor, setThemeColor] = useState("#0b57d0");
  const [format, setFormat] = useState("pdf");
  const [size, setSize] = useState("standee");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eligRes, qrRes, setRes] = await Promise.all([
        sellerQrApi.checkEligibility().catch(() => null),
        sellerQrApi.getMyQr().catch(() => null),
        sellerQrApi.getSettings().catch(() => null),
      ]);

      if (eligRes?.data?.data) {
        setEligibility(eligRes.data.data);
      }

      if (qrRes?.data?.data) {
        const qrResponseData = qrRes.data.data;
        const qr = qrResponseData.qr_code || qrResponseData;
        setQrData(qr);

        if (qr.custom_slug || qr.slug || qr.qr_code_token || qr.token) {
          setCustomSlug(qr.custom_slug || qr.slug || qr.qr_code_token || qr.token);
        }
        if (qr.custom_tagline || qr.tagline) setTagline(qr.custom_tagline || qr.tagline);
        if (qr.custom_color || qr.primary_color) setThemeColor(qr.custom_color || qr.primary_color);
        if (qr.format || qr.qr_style) setFormat(qr.format || qr.qr_style);
        if (qr.size) setSize(qr.size);

        if (typeof qrResponseData.can_customize_colors === "boolean") {
          setCanCustomizeColors(qrResponseData.can_customize_colors);
        }
        if (typeof qrResponseData.can_customize_logo === "boolean") {
          setCanCustomizeLogo(qrResponseData.can_customize_logo);
        }
        if (typeof qrResponseData.can_customize_slug === "boolean") {
          setCanCustomizeSlug(qrResponseData.can_customize_slug);
        }
        if (qrResponseData.catalog_base_url) {
          setCatalogBaseUrl(qrResponseData.catalog_base_url.replace(/\/+$/, ""));
        }

        if (qrResponseData.default_settings && !setRes?.data?.data) {
          setSettings(qrResponseData.default_settings);
        }
      }

      if (setRes?.data?.data) {
        const adminSettings = setRes.data.data;
        setSettings(adminSettings);
        if (typeof adminSettings.allow_user_customization === "boolean") {
          setCanCustomizeColors((prev) => prev && adminSettings.allow_user_customization);
          setCanCustomizeSlug((prev) => prev && adminSettings.allow_user_customization);
        }
        if (typeof adminSettings.allow_user_logo === "boolean") {
          setCanCustomizeLogo((prev) => prev && adminSettings.allow_user_logo);
        }
        if (adminSettings.catalog_base_url) {
          setCatalogBaseUrl(adminSettings.catalog_base_url.replace(/\/+$/, ""));
        }
      }
    } catch (err) {
      console.error("Error loading Seller QR data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await sellerQrApi.generateOrUpdate({
        custom_slug: customSlug,
        slug: customSlug,
        custom_tagline: tagline,
        custom_color: themeColor,
        format,
        size,
      });

      if (res?.data && res.data.error === false) {
        toast.success(res.data.message || "Standee updated successfully!");
        const savedQr = res.data.data?.qr_code || res.data.data;
        setQrData((prev) => ({ ...prev, ...savedQr }));
        if (savedQr?.custom_slug || savedQr?.slug || savedQr?.qr_code_token) {
          setCustomSlug(savedQr.custom_slug || savedQr.slug || savedQr.qr_code_token);
        }
      } else {
        toast.error(res?.data?.message || "Failed to update standee.");
      }
    } catch (err) {
      console.error("Error updating QR standee:", err);
      toast.error(err?.response?.data?.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const url = qrData?.qr_url || "";
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Catalog QR link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    let token = qrData?.token || qrData?.qr_code_token || customSlug;
    if (!token) {
      toast.info("Generating your QR code standee first...");
      try {
        setSubmitting(true);
        const res = await sellerQrApi.generateOrUpdate({
          custom_slug: customSlug,
          slug: customSlug,
          custom_tagline: tagline,
          custom_color: themeColor,
          format,
          size,
        });
        if (res?.data && res.data.error === false) {
          const savedQr = res.data.data?.qr_code || res.data.data;
          setQrData((prev) => ({ ...prev, ...savedQr }));
          token = savedQr?.custom_slug || savedQr?.slug || savedQr?.token || savedQr?.qr_code_token;
        }
      } catch (e) {
        console.error("Auto-generate standee failed:", e);
      } finally {
        setSubmitting(false);
      }
    }

    if (!token) {
      toast.error("Please click 'Save Standee Config' first to generate your QR code.");
      return;
    }

    const downloadUrl = sellerQrApi.getDownloadUrl(token, {
      format,
      size,
    });

    setDownloading(true);
    const toastId = toast.loading(`Preparing ${format.toUpperCase()} download...`);

    try {
      const response = await fetch(downloadUrl, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const errJson = await response.json();
        throw new Error(errJson?.message || "Failed to download standee");
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const ext = format === "svg" ? "svg" : format === "png" ? "png" : "pdf";
      const fileName = `Standee-${store?.slug || token}-${size}.${ext}`;

      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
      }, 300);

      toast.success(`${format.toUpperCase()} downloaded successfully!`, { id: toastId });
    } catch (err) {
      console.warn("Direct fetch download fallback triggering:", err);
      // Fallback: direct browser navigation
      const fallbackLink = document.createElement("a");
      fallbackLink.href = downloadUrl;
      fallbackLink.setAttribute("download", `Standee-${store?.slug || token}-${size}.${format}`);
      fallbackLink.target = "_blank";
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      setTimeout(() => document.body.removeChild(fallbackLink), 300);
      toast.dismiss(toastId);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[380px] items-center justify-center">
        <CircleNotchIcon className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Case 1: Merchant has no store setup yet
  if (!eligibility?.has_store) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <StorefrontIcon size={32} weight="duotone" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Store Profile Required
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          You need an active Store profile to generate your unique store QR code
          and printable UPI-style counter standees.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/stores">
            <StorefrontIcon size={18} weight="bold" />
            Set Up Your Store
          </Link>
        </Button>
      </div>
    );
  }

  // Case 2: Store exists but package does not include QR entitlement
  const isUserEligible = eligibility?.is_eligible ?? eligibility?.eligible ?? true;
  if (eligibility && !isUserEligible) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <CrownIcon size={32} weight="duotone" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-foreground">
          Subscription Upgrade Required
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {eligibility.message ||
            "Your current plan does not include the Seller QR Standee feature. Upgrade to a business plan to print acrylic standees for your shop counters and walls."}
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/subscription">
            <CrownIcon size={18} weight="bold" />
            View Subscription Plans
          </Link>
        </Button>
      </div>
    );
  }

  const store = eligibility?.store || qrData?.store;
  const resolvedBaseUrl = catalogBaseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const centerLogoType = qrData?.center_logo_type || settings?.default_center_logo_type || 'platform_logo';
  const effectiveCenterLogo = centerLogoType === 'none'
    ? null
    : (qrData?.effective_center_logo_url || qrData?.center_logo_url || settings?.center_logo_url || settings?.footer_logo_url);

  return (
    <div className="space-y-6">
      {/* Analytics KPI Bar */}
      {qrData && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Standee Scans</span>
              <ChartBarIcon size={18} className="text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              {qrData.scans_count || 0}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Standee Status</span>
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  qrData.is_active ? "bg-emerald-500" : "bg-destructive"
                )}
              />
            </div>
            <p className="mt-2 text-base font-semibold capitalize text-foreground">
              {qrData.is_active ? "Active & Scannable" : "Inactive"}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Last Scanned</span>
              <EyeIcon size={18} className="text-muted-foreground" />
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              {qrData.last_scanned_at
                ? new Date(qrData.last_scanned_at).toLocaleDateString()
                : "No scans yet"}
            </p>
          </div>
        </div>
      )}

      {/* Main Customizer Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Controls */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm lg:col-span-7">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-foreground">
              Standee Studio & Customization
            </h2>
            <p className="text-xs text-muted-foreground">
              Personalize your UPI acrylic standee flyer with custom brand colors,
              taglines, and dimensions.
            </p>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-5">
            {/* Custom SEO URL Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="customSlug" className="text-xs font-semibold">
                  Custom Catalog URL Slug (SEO Friendly)
                </Label>
                {!canCustomizeSlug && (
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Locked by Administrator
                  </span>
                )}
              </div>
              <div className="flex rounded-md shadow-xs">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground select-none">
                  {resolvedBaseUrl}/store-qr/
                </span>
                <Input
                  id="customSlug"
                  value={customSlug}
                  disabled={!canCustomizeSlug}
                  onChange={(e) =>
                    setCustomSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-_]/g, "")
                    )
                  }
                  placeholder="my-store-name"
                  maxLength={64}
                  className="rounded-l-none font-mono text-xs"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Customize this clean URL so buyers and search engines can easily find your store catalog.
              </p>
            </div>

            {/* Custom Tagline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="tagline" className="text-xs font-semibold">
                  Custom Standee Tagline
                </Label>
                {!canCustomizeColors && (
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Locked by Administrator
                  </span>
                )}
              </div>
              <Input
                id="tagline"
                value={tagline}
                disabled={!canCustomizeColors}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g., Scan to explore our catalog & daily specials!"
                maxLength={90}
                className="text-sm"
              />
              <p className="text-[11px] text-muted-foreground">
                Printed prominently beneath your store name on counter standees.
              </p>
            </div>

            {/* Theme Color Presets & Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">
                  Standee Accent Theme Color
                </Label>
                {!canCustomizeColors && (
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Managed by Admin
                  </span>
                )}
              </div>
              {canCustomizeColors && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setThemeColor(preset.hex)}
                        className={cn(
                          "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all",
                          themeColor === preset.hex
                            ? "border-foreground ring-2 ring-foreground/20"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded-lg border bg-transparent p-1"
                    />
                    <Input
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="#0b57d0"
                      className="h-9 max-w-[140px] font-mono text-xs uppercase"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Standee Size & Format Selectors */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Print Size</Label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standee">
                      UPI Standee (148 x 210 mm)
                    </SelectItem>
                    <SelectItem value="a4">Standard A4 Poster</SelectItem>
                    <SelectItem value="a5">Table Flyer (A5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">Vector PDF (Print Ready)</SelectItem>
                    <SelectItem value="png">High-Res PNG Image</SelectItem>
                    <SelectItem value="svg">Vector SVG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <Button type="submit" disabled={submitting} className="gap-2">
                {submitting ? (
                  <CircleNotchIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <FloppyDiskIcon size={16} weight="bold" />
                )}
                Save Standee Config
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleDownload}
                disabled={downloading}
                className="gap-2"
              >
                {downloading ? (
                  <CircleNotchIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <DownloadSimpleIcon size={16} weight="bold" />
                )}
                {downloading ? "Downloading..." : `Download ${format.toUpperCase()} (${size.toUpperCase()})`}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCopyLink}
                className="gap-2"
              >
                {copied ? (
                  <CheckIcon size={16} className="text-emerald-500" />
                ) : (
                  <CopyIcon size={16} />
                )}
                Copy Link
              </Button>
            </div>
          </form>
        </div>

        {/* Live Mockup Preview Column */}
        <div className="flex flex-col items-center justify-start rounded-2xl border bg-muted/30 p-6 lg:col-span-5">
          <span className="mb-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Live Standee Mockup Preview
          </span>
          <StandeeMockupPreview
            storeName={store?.name || "Your Store"}
            storeLocation={[store?.city, store?.state].filter(Boolean).join(", ")}
            storeLogo={store?.logo_image || store?.image}
            isVerified={Boolean(store?.is_verified)}
            tagline={tagline}
            themeColor={themeColor}
            headerTitle={settings?.default_title || settings?.header_title || "Scan to Browse Store & Catalog"}
            badgeText={settings?.badge_text || "DIGITAL STORE & CATALOG"}
            footerText={settings?.default_footer_text || "Powered by Bissow.com"}
            footerLogo={settings?.footer_logo_url}
            centerLogo={effectiveCenterLogo}
            qrSvgRaw={qrData?.svg_raw || qrData?.raw_svg || qrData?.qr_base64_svg || qrData?.qr_png_url}
            qrUrl={qrData?.qr_url}
            format={format}
            size={size}
          />
        </div>
      </div>
    </div>
  );
}
