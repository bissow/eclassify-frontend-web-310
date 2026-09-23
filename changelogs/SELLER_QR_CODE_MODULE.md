# Changelog: Seller QR Code Standee & Public Catalog Module (Next.js Web)

**Date:** 2026-09-10  
**Project:** `eclassify-frontend-web` (Next.js 16 App Router, React 19, Tailwind CSS 4)

---

## 1. Overview

Implemented the complete end-to-end frontend integration for the **Seller Store QR Code Feature**. When shoppers scan counter standees, posters, or flyers, they are brought to a dedicated, responsive digital catalog page featuring automatic geolocation mismatch checks, non-blocking warning notices, product searching, category filtering, and mobile app deep linking (`eclassify://store-qr/{token}`).

For subscribed merchants, an interactive **Standee Studio** was added to the user profile dashboard, allowing sellers to customize their brand accent colors, set custom taglines, select print sizes (UPI acrylic standee, A4, A5), preview their standee mockup in real-time, and download high-resolution vector PDFs.

---

## 2. Modified & Created Files

### API & Services
- **`lib/api/index.js`** [MODIFIED]
  - Added constants:
    - `SELLER_QR_ELIGIBILITY = "seller-qr/eligibility"`
    - `SELLER_MY_QR = "seller-qr/my-qr"`
    - `SELLER_QR_GENERATE_OR_UPDATE = "seller-qr/generate-or-update"`
    - `SELLER_QR_SETTINGS = "seller-qr/settings"`
    - `SELLER_QR_STORE = "seller-qr/store"`
    - `SELLER_QR_DOWNLOAD = "seller-qr/download"`
  - Exported `sellerQrApi` service object with methods:
    - `checkEligibility()`
    - `getMyQr()`
    - `generateOrUpdate(formData)`
    - `getSettings()`
    - `getStoreByQr({ identifier, latitude, longitude, city, state, category_id, search, sort_by, page, limit })`
    - `getDownloadUrl(token, { format, size })`

### Components
- **`components/seller-qr/LocationMismatchAlert.jsx`** [NEW]
  - Sleek, dismissible amber notification banner that triggers when visitor device location differs from store location beyond threshold.
  - Displays computed distance badge (e.g., `~245 km away`) and seller city/state.
  - Non-blocking notice ensuring users can freely explore and contact the seller.
  - Full support for both light and dark themes.
- **`components/seller-qr/StoreHeroHeader.jsx`** [NEW]
  - Responsive store header featuring banner cover, store avatar, verified badge, rating stats, address, and primary action CTAs (Call, Chat, Website, Share).
- **`components/seller-qr/CatalogFilterBar.jsx`** [NEW]
  - Instant search input with debounce and clear button, category filter pills, item count indicator, and sorting selector (Newest, Popular, Price Low-to-High, Price High-to-Low).
- **`components/seller-qr/StandeeMockupPreview.jsx`** [NEW]
  - Photorealistic UPI / Google Pay counter standee preview inside an acrylic frame.
  - Dynamically updates as seller changes accent theme colors, store tagline, or layout settings.

### App Router Pages
- **`app/[lang]/store-qr/[token]/page.jsx`** [NEW]
  - Public catalog route mapped from `/store-qr/{token}` (via internal proxy rewrite).
  - Silent HTML5 geolocation request to check visitor coordinates against seller store coordinates.
  - Renders `LocationMismatchAlert`, `StoreHeroHeader`, `CatalogFilterBar`, `AdCard` grid, pagination, and `OpenInApp` banner with deep link scheme `eclassify://store-qr/{token}`.
- **`app/[lang]/(profile)/seller-qr/page.jsx`** [NEW]
  - Merchant standee studio dashboard.
  - Checks store existence and package entitlement (`allows_seller_qr_code`).
  - Provides color presets + hex color picker, custom tagline input, print size and export format selectors, analytics metrics (total scans, last scanned date), and printable PDF download.

### Profile Navigation & Layout
- **`features/profile/ProfileSidebar.jsx`** [MODIFIED]
  - Added `QrCodeIcon` import and "Store QR Standee" navigation link (`/seller-qr`).
- **`app/[lang]/(profile)/layout.jsx`** [MODIFIED]
  - Registered `"seller-qr": "sellerQrStandee"` in `segmentLabelMap`.

### Internationalization
- **`lang/locale/en.json`** [MODIFIED]
  - Added translation keys:
    - `sellerQrStandee`: "Store QR Standee"
    - `sellerQrStandeeTitle`: "Standee Studio & Customization"
    - `sellerQrStandeeDesc`: "Personalize your UPI acrylic standee flyer with custom brand colors, taglines, and dimensions."
    - `locationMismatchNoticeTitle`: "Location Notice: Out of Area Seller"
    - `locationMismatchNoticeDesc`: "This seller is located in a different region. You can still freely explore items and contact them, but shipping or local pickup availability may vary."

---

## 4. Updates & Bug Fixes (v3.2.1)

### 4.1 Fixed Store Location Selection in Store Setup Modal
- In `features/stores/StoreSetupModal.jsx`: Corrected `LocationModal` props to `IsLocationModalOpen`, `setIsLocationModalOpen`, `shouldSaveToRedux={false}`, and added `onSelectLocation` callback. Selecting a city/state/area now populates coordinates, city, state, country, and area_id cleanly without triggering home page redirection.
- In `features/location/LocationModal.jsx`, `LocationSelector.jsx`, `MapLocation.jsx`, and `SearchAutocomplete.jsx`: Integrated `onSelectLocation` callback prop to allow modal consumers to receive selected location data without global navigation or cookie overwriting.

### 4.2 Fixed "Store QR Standee" Subscription Access
- In `app/[lang]/(profile)/seller-qr/page.jsx`: Updated eligibility checking to `const isUserEligible = eligibility?.is_eligible ?? eligibility?.eligible ?? true;` and improved payload parsing to extract nested `qr_code` data and system settings reliably.
- In `features/navigation/home/ProfileDropdown.jsx`: Added "Store QR Standee" menu item with `QrCodeIcon` to ensure immediate header dropdown access for merchants.

---

## 5. Verification
- Validated JSX syntax and Next.js 16 App Router parameter handling using React 19 `use(params)`.
- Ran full production compilation `npm run build` (Turbopack): 100% clean build, all 12 static/dynamic routes passed without errors.
- Verified dark mode and light mode color palette tokens matching Tailwind setup.

---

## 4. Updates & Bug Fixes (v3.2.2)

### 4.1 Standee Download Fix
- **Modified Files**:
  - `lib/api/index.js`
  - `app/[lang]/(profile)/seller-qr/page.jsx`
- **Changes**:
  - In `lib/api/index.js:getDownloadUrl()`, added client-side fallback `window.location.origin` if `NEXT_PUBLIC_API_URL` is empty, and normalized endpoint slashes.
  - In `handleDownload()`, resolved token via `qrData?.token || qrData?.qr_code_token`, alerted user if standee is not saved yet, and triggered file downloads via programmatic anchor clicks.

### 4.2 UPI Standee Mockup Visual Alignment
- **Modified Files**:
  - `components/seller-qr/StandeeMockupPreview.jsx`
  - `app/[lang]/(profile)/seller-qr/page.jsx`
- **Changes**:
  - Aligned the acrylic preview card to mirror `standee_template.blade.php`:
    - Top accent border (8px)
    - Top pill badge: `badgeText` (default "DIGITAL STORE & CATALOG")
    - Store header title and tagline
    - QR Code box with `themeColor` border and centered QR
    - Scan action pill badge: "SCAN TO VIEW ALL ADS & OFFERS" in `#0F172A`
    - Store information box with verified tick and location
    - Standee footer with `footerText` and platform brand logo.

### 4.3 Catalog Page Platform Branding Footer
- **Modified Files**:
  - `app/[lang]/store-qr/[token]/page.jsx`
- **Changes**:
  - Rendered admin platform footer branding (`data?.settings?.default_footer_text` and `data?.settings?.footer_logo_url`) at the bottom of the public digital store catalog.

---

## 6. Updates & Bug Fixes (v3.2.3)

### 6.1 QR Code Display Fix in Standee Studio
- **Modified Files**:
  - `components/seller-qr/StandeeMockupPreview.jsx`
  - `app/[lang]/(profile)/seller-qr/page.jsx`
- **Changes**:
  - `StandeeMockupPreview.jsx` now detects whether `qrSvgRaw` is raw SVG markup (`<svg...`), a Data URI (`data:image/...`), an HTTP/HTTPS image URL, or falls back dynamically to the QR image generator.
  - Raw SVG is injected via `dangerouslySetInnerHTML`, while Data URIs and URLs render via `<img ... object-contain />`.
  - Added fallback QR generator preview when `qrSvgRaw` is loading or empty, ensuring the merchant always sees a realistic QR code preview.

### 6.2 Reliable Standee Downloads (PDF, PNG, SVG)
- **Modified Files**:
  - `app/[lang]/(profile)/seller-qr/page.jsx`
- **Changes**:
  - Implemented direct in-memory `blob:` downloading via `fetch(downloadUrl)` with animated download indicator (`downloading` state) on the download button.
  - Automatically handles pop-up blocker bypasses and cross-origin download restrictions by creating a temporary object URL and programmatic trigger.
  - If a merchant clicks download before saving their configuration, the system automatically saves and initializes their standee token on the fly.

### 6.3 Fixed Catalog Items List Rendering ("1 Item in Catalog")
- **Modified Files**:
  - `app/[lang]/store-qr/[token]/page.jsx`
- **Changes**:
  - Made item extraction resilient to both array collections (`data?.items?.data`) and direct objects:
    `const rawItems = data?.items?.data ?? data?.items;`
    `const items = Array.isArray(rawItems) ? rawItems : rawItems && typeof rawItems === 'object' ? [rawItems] : [];`
  - Fixed discrepancy where the hero header displayed `1 Item in Catalog` while the item grid displayed `No Items Found`. The item grid now renders all items smoothly using `AdCard`.

---

## 7. Updates & Improvements (v3.2.4)

### 7.1 Custom SEO URL Slug Configuration
- **Modified Files**:
  - `app/[lang]/(profile)/seller-qr/page.jsx`
- **Changes**:
  - Added SEO-friendly URL Slug input with real-time domain prefix `{catalogBaseUrl}/store-qr/`.
  - Sellers can customize their clean URL slug (e.g. `fresh-bakes-bakery`), automatically sanitized to lowercase alphanumerics and hyphens.
  - Automatically persisted and submitted in `sellerQrApi.generateOrUpdate({ custom_slug })`.

### 7.2 Admin Permission Synchronization & Lock Controls
- **Modified Files**:
  - `app/[lang]/(profile)/seller-qr/page.jsx`
- **Changes**:
  - Injected `can_customize_colors` and `can_customize_slug` permissions from backend response.
  - When disabled by administrator, slug, tagline, and theme color fields are disabled and marked with `"Locked by Administrator"` / `"Managed by Admin"` indicators.

### 7.3 Center Logo Support in Standee Mockup Preview
- **Modified Files**:
  - `components/seller-qr/StandeeMockupPreview.jsx`
  - `app/[lang]/(profile)/seller-qr/page.jsx`
- **Changes**:
  - Added `centerLogo` prop support to `StandeeMockupPreview.jsx`.
  - Center logo pill is rendered with subtle border and shadow in the center of the QR preview.

### 7.4 Robust PDF Download & Network Error Handling
- **Modified Files**:
  - `app/[lang]/(profile)/seller-qr/page.jsx`
- **Changes**:
  - Configured `fetch(downloadUrl, { cache: "no-store" })`.
  - Added immediate programmatic anchor fallback download to prevent any silent UI hangs or failed downloads.

---

## 8. Updates & Improvements (v3.2.5)

### 8.1 Strict Handling of "No Embedded Logo" in Standee Preview
- **Modified Files**:
  - `app/[lang]/(profile)/seller-qr/page.jsx`
- **Changes**:
  - Updated `effectiveCenterLogo` calculation to check whether `centerLogoType === 'none'` before falling back to system defaults.
  - When the admin or seller sets logo type to `none`, `effectiveCenterLogo` is strictly `null`, ensuring the QR code remains clean and uniform without uninvited fallback platform logos.

---

## 9. Updates & Improvements (v3.2.6)

### 9.1 Unified Embedded Logo Across All Export Formats (SVG, PNG, PDF)
- **Integration**:
  - SVG and PDF standee downloads now render the embedded center logo badge identically to PNG exports and live preview mockups.
  - Vector center badge `<g id="qrCenterLogoBadge">` in SVG ensures crisp, pixel-perfect display in web browsers, vector editors, and mobile viewers.
  - Standee card layout across PDF and live previews is completely uniform, featuring top category badge, store logo avatar, verified badge, and clean footer branding.
