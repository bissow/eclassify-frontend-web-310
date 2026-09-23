# Frontend Changelog: Store & Nearby Sellers Discovery Module

**Date:** 2026-09-08  
**Project:** Eclassify Classified Web Frontend (Next.js 14/15)  
**Version:** 3.1.0  
**Compatibility:** Fully integrated with Centralized Location Modal and Light/Dark themes.

---

## 1. Overview of Changes

This update delivers a complete frontend experience for browsing nearby stores, viewing detailed store profiles with item catalogs & reviews, and enabling users to set up / manage their own store profiles.

---

## 2. New Components & Pages Added

### 2.1 API Layer (`lib/api/index.js`)
- Added API endpoints: `GET_STORES`, `GET_STORE_DETAIL`, `GET_STORE_SLUGS`, `SETUP_STORE`, `GET_MY_STORE`, `TOGGLE_STORE_STATUS`.
- Exported `storesApi` methods for fetching nearby stores with geolocation/radius params, store details with catalog pagination, slug fetching, and store setup multipart form submission.

### 2.2 Stores Directory Page (`app/[lang]/stores/page.jsx` & `features/stores/StoresDirectory.jsx`)
- **Route:** `/{lang}/stores`
- **Features:**
  - Search bar with 500ms debouncing.
  - Sorting options (`Nearest`, `Top Rated`, `Most Items`, `Newest`).
  - Radius slider (5 km to 100 km).
  - Integrated location chip connected to the centralized `LocationModal`.
  - Responsive grid of Store cards with Light and Dark mode styling (`dark:bg-card`, `dark:border-border`).

### 2.3 Store Card Component (`features/stores/StoreCard.jsx`)
- Cover banner with hover parallax zoom.
- Store logo avatar overlay.
- Official verification shield checkmark badge (`is_verified`).
- Distance badge with formatted distance (`850 m`, `2.4 km`).
- Star rating summary with total reviews count and active items badge.

### 2.4 Single Store Detail Page (`app/[lang]/stores/[slug]/page.jsx` & `features/stores/StoreDetail.jsx`)
- **Route:** `/{lang}/stores/[slug]`
- **Features:**
  - Parallax cover banner with store avatar.
  - Verification badge and distance indicator.
  - Quick action buttons (Call Store, Email, Follow Seller).
  - Tabs:
    1. **Products / Items**: Grid view of active ads posted by this store.
    2. **About Store**: Full store description, website link, and operating hours table.
    3. **Customer Reviews**: Rating breakdown and buyer review list.

### 2.5 Store Setup & Profile Integration (`features/profile/Profile.jsx` & `features/stores/StoreSetupModal.jsx`)
- Added **Store / Shop Management** section to user profile.
- Store setup dialog allows editing:
  - Store Name & Description
  - Cover Banner & Logo file uploaders with real-time previews
  - Central location selection via `LocationModal`
  - Operating hours (Opening/Closing times and working days)
  - Contact phone, email, and website

### 2.6 Navigation (`features/navigation/home/HomeHeader.jsx` & `HomeMobileMenu.jsx`)
- Added direct **Stores** navigation button in desktop header and mobile menu sheet.
