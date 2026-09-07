"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lang/useTranslation";
import { storesApi } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CircleNotchIcon, LockIcon, MapPinIcon, ShieldCheckIcon, StorefrontIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import LocationModal from "@/features/location/LocationModal";
import { toast } from "sonner";
import CustomImage from "@/components/common/CustomImage";

const StoreSetupModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    contact: "",
    address: "",
    latitude: "",
    longitude: "",
    city: "",
    state: "",
    country: "",
    area_id: "",
    website: "",
    tax_number: "",
    opening_time: "09:00 AM",
    closing_time: "08:00 PM",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [selectedLocationDisplay, setSelectedLocationDisplay] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const fetchMyStore = async () => {
    try {
      setIsFetching(true);
      const res = await storesApi.getMyStore();
      if (res?.data?.error === false && res?.data?.data?.has_store) {
        const s = res.data.data.store;
        setIsVerified(!!s.is_verified);
        setFormData({
          name: s.name || "",
          description: s.description || "",
          email: s.email || "",
          contact: s.contact || "",
          address: s.address || "",
          latitude: s.latitude || "",
          longitude: s.longitude || "",
          city: s.city || "",
          state: s.state || "",
          country: s.country || "",
          area_id: s.area_id || "",
          website: s.website || "",
          tax_number: s.tax_number || "",
          opening_time: s.opening_time || "09:00 AM",
          closing_time: s.closing_time || "08:00 PM",
        });
        setLogoPreview(s.logo || "");
        setBannerPreview(s.banner || "");
        setSelectedLocationDisplay([s.area?.name, s.city, s.state, s.country].filter(Boolean).join(", "));
      }
    } catch (error) {
      console.error("Error fetching my store:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyStore();
    }
  }, [isOpen]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("storeNameRequired") || "Store Name is required");
      return;
    }

    try {
      setIsLoading(true);
      const body = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
          body.append(key, formData[key]);
        }
      });

      if (logoFile) body.append("logo", logoFile);
      if (bannerFile) body.append("banner", bannerFile);

      const res = await storesApi.setupStore(body);
      if (res?.data?.error === false) {
        toast.success(res?.data?.message || "Store updated successfully");
        onSuccess?.(res?.data?.data);
        onClose();
      } else {
        toast.error(res?.data?.message || "Failed to save store");
      }
    } catch (error) {
      console.error("Store save error:", error);
      toast.error("Something went wrong saving store.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <StorefrontIcon className="h-6 w-6 text-primary" />
              {t("setupStore") || "Store / Shop Management"}
            </DialogTitle>
          </DialogHeader>

          {isFetching ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <CircleNotchIcon className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              {isVerified && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400">
                  <ShieldCheckIcon className="h-6 w-6 shrink-0 text-emerald-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold flex items-center gap-1.5">
                      {t("storeVerifiedTitle") || "Verified Official Store"}
                      <LockIcon className="h-3.5 w-3.5" />
                    </p>
                    <p className="text-xs mt-0.5 text-muted-foreground">
                      {t("storeVerifiedNotice") || "This store has been officially verified by the administrator. Store details and location are locked and cannot be modified. Please contact support if you need to update any information."}
                    </p>
                  </div>
                </div>
              )}

              {/* Banner & Logo Upload Row */}
              <div className="space-y-2">
                <Label>{t("storeCoverBanner") || "Store Cover Banner"}</Label>
                <div className={`relative h-28 w-full rounded-xl border border-dashed border-border bg-muted overflow-hidden flex items-center justify-center ${isVerified ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}>
                  {bannerPreview ? (
                    <CustomImage src={bannerPreview} alt="Cover" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground text-xs">
                      <UploadSimpleIcon className="h-6 w-6 mb-1" />
                      <span>{t("uploadBanner") || "Click to upload banner (max 7MB)"}</span>
                    </div>
                  )}
                  {!isVerified && (
                    <input type="file" accept="image/*" onChange={handleBannerChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("storeLogo") || "Store Logo / Avatar"}</Label>
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-xl border border-dashed border-border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                    {logoPreview ? (
                      <CustomImage src={logoPreview} alt="Logo" fill className="object-cover" />
                    ) : (
                      <StorefrontIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  {!isVerified && (
                    <label className="cursor-pointer">
                      <span className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                        {t("changeLogo") || "Choose Logo"}
                      </span>
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Store Name & Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("storeName") || "Store Name"} *</Label>
                  <Input
                    id="name"
                    required
                    disabled={isVerified}
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Apex Electronics"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contact">{t("storePhone") || "Store Phone"}</Label>
                  <Input
                    id="contact"
                    disabled={isVerified}
                    value={formData.contact}
                    onChange={(e) => setFormData((prev) => ({ ...prev, contact: e.target.value }))}
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description">{t("storeDescription") || "Store Description"}</Label>
                <Textarea
                  id="description"
                  rows={3}
                  disabled={isVerified}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Tell buyers what products and services you offer..."
                />
              </div>

              {/* Location Picker (Central Location Modal Integration) */}
              <div className="space-y-1.5">
                <Label>{t("storeLocation") || "Store Location / City"} *</Label>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isVerified}
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full justify-start text-left font-normal gap-2"
                >
                  <MapPinIcon weight="fill" className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate">
                    {selectedLocationDisplay || t("selectStoreLocation") || "Click to choose Store Location"}
                  </span>
                </Button>
              </div>

              {/* Street Address */}
              <div className="space-y-1.5">
                <Label htmlFor="address">{t("streetAddress") || "Street Address"}</Label>
                <Input
                  id="address"
                  disabled={isVerified}
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="e.g. 124 Main Street, Shop No. 4"
                />
              </div>

              {/* Operating Hours */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="opening_time">{t("openingTime") || "Opening Time"}</Label>
                  <Input
                    id="opening_time"
                    disabled={isVerified}
                    value={formData.opening_time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, opening_time: e.target.value }))}
                    placeholder="09:00 AM"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="closing_time">{t("closingTime") || "Closing Time"}</Label>
                  <Input
                    id="closing_time"
                    disabled={isVerified}
                    value={formData.closing_time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, closing_time: e.target.value }))}
                    placeholder="08:00 PM"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <Label htmlFor="website">{t("website") || "Website (Optional)"}</Label>
                <Input
                  id="website"
                  type="url"
                  disabled={isVerified}
                  value={formData.website}
                  onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                  {t("cancel") || "Close"}
                </Button>
                {!isVerified && (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <CircleNotchIcon className="h-4 w-4 animate-spin mr-2" />}
                    {t("saveStore") || "Save Store Setup"}
                  </Button>
                )}
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Central Location Modal for Store */}
      <LocationModal
        IsOpen={isLocationModalOpen}
        OnHide={() => {
          setIsLocationModalOpen(false);
          // Sync location from cookie
          if (typeof document !== "undefined") {
            const match = document.cookie.match(new RegExp(`(?:^|;\\s*)eclassify_city_data=([^;]*)`));
            if (match) {
              try {
                const parsed = JSON.parse(decodeURIComponent(match[1]));
                setFormData((prev) => ({
                  ...prev,
                  latitude: parsed.lat || "",
                  longitude: parsed.long || "",
                  city: parsed.city || "",
                  state: parsed.state || "",
                  country: parsed.country || "",
                  area_id: parsed.areaId || "",
                }));
                setSelectedLocationDisplay([parsed.area, parsed.city, parsed.state, parsed.country].filter(Boolean).join(", "));
              } catch (err) {
                console.error(err);
              }
            }
          }
        }}
      />
    </>
  );
};

export default StoreSetupModal;
