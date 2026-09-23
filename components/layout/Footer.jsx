"use client";
import CustomLink from "@/components/common/CustomLink";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/slices/settingSlice";
import googleDownload from "@/public/assets/Google Download.png";
import appleDownload from "@/public/assets/iOS Download.png";
import CustomImage from "@/components/common/CustomImage";
import Link from "next/link";
import { useState } from "react";
import PackageRequiredModal from "@/components/common/PackageRequiredModal";
import { EnvelopeSimpleIcon, FacebookLogoIcon, InstagramLogoIcon, LinkedinLogoIcon, MapPinIcon, PhoneIcon, PinterestLogoIcon, XLogoIcon } from "@phosphor-icons/react";
import { quickLinks } from "@/lib/constants";
import { useTranslation } from "@/lang/useTranslation";

export default function Footer() {
  const { t } = useTranslation();
  const settings = useSelector(settingsData);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const showGetInTouchSection =
    settings?.company_address ||
    settings?.company_email ||
    settings?.company_tel1 ||
    settings?.company_tel2;

  const showDownloadLinks =
    settings?.play_store_link || settings?.app_store_link;

  const marginTop = showDownloadLinks ? "mt-[150px]" : "mt-20";

  return (
    <footer className={`bg-[#1a1a1a] text-white ${marginTop}`}>
      <div className="container py-12 relative">
        {showDownloadLinks && (
          <div className="relative bg-[#FF7F50] -top-35 lg:-top-31.25 xl:-top-37.5 p-6 xl:p-12 rounded-md flex flex-col lg:flex-row items-center justify-between">
            <h2 className="text-3xl md:text-4xl xl:text-5xl text-center lg:text-left text-balance font-light mb-4 md:mb-0 w-full">
              {t("experienceTheMagic")} {settings?.company_name} {t("app")}
            </h2>
            <div className="flex flex-row lg:flex-row items-center">
              {settings?.play_store_link && (
                <Link href={settings?.play_store_link} target="_blank">
                  <CustomImage
                    src={googleDownload}
                    alt="google"
                    className="storeIcons"
                    width={235}
                    height={85}
                  />
                </Link>
              )}
              {settings?.app_store_link && (
                <Link href={settings?.app_store_link} target="_blank">
                  <CustomImage
                    src={appleDownload}
                    alt="apple"
                    className="storeIcons"
                    width={235}
                    height={85}
                  />
                </Link>
              )}
            </div>
          </div>
        )}

        <div
          className={`grid grid-1 sm:grid-cols-12 gap-12 ${showDownloadLinks && "-mt-17.5 lg:-mt-16 xl:-mt-18.75"
            }`}
        >
          {/* Company Info */}
          <div className="flex flex-col gap-6 sm:col-span-12 lg:col-span-4">
            <CustomLink href="/">
              <CustomImage
                src={settings?.footer_logo}
                alt="eClassify"
                width={195}
                height={52}
                className="w-full h-13 object-contain ltr:object-left rtl:object-right max-w-48.75"
              />
            </CustomLink>
            <p className="text-gray-300 text-sm max-w-md">
              {settings?.footer_description}
            </p>
            <div className="flex items-center flex-wrap gap-6">
              {settings?.facebook_link && (
                <Link
                  href={settings?.facebook_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <FacebookLogoIcon size={22} />
                </Link>
              )}

              {settings?.instagram_link && (
                <Link
                  href={settings?.instagram_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <InstagramLogoIcon size={22} />
                </Link>
              )}

              {settings?.x_link && (
                <Link
                  href={settings?.x_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <XLogoIcon size={22} />
                </Link>
              )}

              {settings?.linkedin_link && (
                <Link
                  href={settings?.linkedin_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <LinkedinLogoIcon size={22} />
                </Link>
              )}

              {settings?.pinterest_link && (
                <Link
                  href={settings?.pinterest_link}
                  target="_blank"
                  className="footerSocialLinks"
                  rel="noopener noreferrer"
                >
                  <PinterestLogoIcon size={22} />
                </Link>
              )}
            </div>
          </div>

          <div className="sm:col-span-12 lg:hidden border-t-2 border-dashed border-gray-500 w-full"></div>

          {/* Quick Links */}
          <div className="lg:ltr:border-l-2 lg:rtl:border-r-2 lg:border-dashed lg:border-gray-500 lg:ltr:pl-6 lg:rtl:pr-6 sm:col-span-6 lg:col-span-4">
            <h3 className="text-xl font-semibold mb-6">{t("quickLinks")}</h3>
            <nav className="space-y-4">
              {quickLinks.map((link) => {
                const isSubscription = link.href === "/subscription";
                const linkContent = (
                  <span className="relative flex items-center">
                    <span className="absolute left-0 top-1/2 transform -translate-y-1/2 h-2.5 w-2.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"></span>
                    <span className="opacity-65 group-hover:text-primary group-hover:opacity-100 group-hover:ml-4 transition-all duration-500">
                      {t(link.labelKey)}
                    </span>
                  </span>
                );
                // Opens a modal, doesn't navigate — rendering it as a real
                // <a href> makes NextTopLoader's document-level click
                // listener start the bar regardless of preventDefault, since
                // it never checks defaultPrevented (see AppBootstrap.jsx).
                if (isSubscription) {
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => setIsPackageModalOpen(true)}
                      className="group block hover:text-primary transition-colors text-left w-full"
                    >
                      {linkContent}
                    </button>
                  );
                }
                return (
                  <CustomLink
                    key={link.id}
                    href={link.href}
                    className="group block hover:text-primary transition-colors"
                  >
                    {linkContent}
                  </CustomLink>
                );
              })}
            </nav>
          </div>

          {/* Contact Information */}

          {showGetInTouchSection && (
            <div className="lg:ltr:border-l-2 lg:rtl:border-r-2 lg:border-dashed lg:border-gray-500 lg:ltr:pl-6 lg:rtl:pr-6 sm:col-span-6 lg:col-span-4">
              <h3 className="text-xl font-semibold mb-6">{t("getInTouch")}</h3>
              <div className="space-y-6">
                {settings?.company_address && (
                  <div className="flex items-center gap-3">
                    <div className="footerContactIcons">
                      <MapPinIcon size={22} />
                    </div>
                    <p className="footerLabel">{settings?.company_address}</p>
                  </div>
                )}

                {settings?.company_email && (
                  <div className="flex items-center gap-3">
                    <div className="footerContactIcons">
                      <EnvelopeSimpleIcon size={22} />
                    </div>
                    <Link
                      href={`mailto:${settings?.company_email}`}
                      className="footerLabel"
                    >
                      {settings?.company_email}
                    </Link>
                  </div>
                )}

                {(settings?.company_tel1 || settings?.company_tel2) && (
                  <div className="flex items-center gap-3">
                    <div className="footerContactIcons">
                      <PhoneIcon size={22} />
                    </div>
                    <div className="flex flex-col gap-1">
                      {settings?.company_tel1 && (
                        <Link
                          href={`tel:${settings?.company_tel1}`}
                          className="footerLabel"
                        >
                          {settings?.company_tel1}
                        </Link>
                      )}
                      {settings?.company_tel2 && (
                        <Link
                          href={`tel:${settings?.company_tel2}`}
                          className="footerLabel"
                        >
                          {settings?.company_tel2}
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Copyright */}
      <div className="container">
        <div className="py-4 flex flex-wrap gap-3 justify-between items-center border-t-2 border-dashed border-gray-500">
          <p className="footerLabel">
            {t("copyright")} © {settings?.company_name} {currentYear}.{" "}
            {t("allRightsReserved")}
          </p>
          <div className="flex flex-wrap gap-4 whitespace-nowrap">
            <CustomLink href="/privacy-policy" className="footerLabel">
              {t("privacyPolicy")}
            </CustomLink>
            <CustomLink href="/terms-and-condition" className="footerLabel">
              {t("termsConditions")}
            </CustomLink>
            <CustomLink href="/refund-policy" className="footerLabel">
              {t("refundPolicy")}
            </CustomLink>
          </div>
        </div>
      </div>
      <PackageRequiredModal
        key={isPackageModalOpen}
        open={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        initialStep={2}
      />
    </footer>
  );
}
