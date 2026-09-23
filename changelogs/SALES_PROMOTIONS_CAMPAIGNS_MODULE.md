# Frontend Changelog: Sales & Offer Page with Promotions, Campaigns & Promote Ad Module

**Date:** 2026-09-09  
**Project:** Eclassify Classified Web Frontend (Next.js 14/15)  
**Version:** 3.2.0  
**Compatibility:** 100% Backward-compatible with existing Ad Card, Details, and Header components. Fully responsive with comprehensive Light & Dark mode support.

---

## 1. Overview of Changes

This release implements a complete, modern, production-grade **Sales & Offer Zone Hub** with active **Campaigns**, categorized **Promotions** (Flash Sales, Daily Deals, Stock Clearance), **Spotlight Deals**, and verified seller promotional tools (**Promote This Ad** and **Join Sale / Flash Deal**).

---

## 2. Modified & Created Files

### 2.1 API Integration Layer
- **[MODIFY] lib/api/index.js**
  - Registered public offer endpoints:
    - GET_OFFER_CAMPAIGNS: /offers/campaigns
    - GET_OFFER_CAMPAIGN_DETAIL: /offers/campaigns/
    - GET_ACTIVE_PROMOTIONS: /offers/promotions
    - GET_FLASH_SALES: /offers/flash-sales
    - GET_CLEARANCE_SALES: /offers/clearance-sales
    - GET_DEALS_OF_THE_DAY: /offers/deals-of-the-day
    - GET_SPOTLIGHT_ADS: /offers/spotlight
    - GET_PROMOTION_ITEMS: /offers/promotions//items
  - Registered seller authenticated promotion endpoints:
    - SELLER_PROMOTIONS_AVAILABLE: /seller/promotions/available
    - SELLER_PROMOTION_OPTIONS: /seller/items//promotions/options
    - SELLER_ITEM_PROMOTE: /seller/items//promote
    - SELLER_ITEM_JOIN_PROMOTION: /seller/items//promotions/join
  - Exported offersApi and sellerPromotionsApi service wrappers with full param serialization (lat/long, city, search, pagination).

### 2.2 Hooks
- **[NEW] hooks/useCountdown.js**
  - Real-time countdown hook computing days, hours, minutes, seconds, and isExpired.
  - Automatically updates every second and terminates safely on component unmount.

### 2.3 Offer Zone UI & Components
- **[NEW] eatures/offers/OfferItemCard.jsx**
  - High-conversion product card with promotional tags (is_spotlight, is_top_ad, is_flash_sale).
  - Real-time countdown badge directly on the image thumbnail.
  - Discount percentage badge (% OFF or flat discount).
  - Strikethrough original price and emphasized promotional sale price.
  - Linear claimed stock progress bar for flash & clearance sales (shows remaining / total stock).
- **[NEW] eatures/offers/OffersDirectory.jsx**
  - Central Offer Zone hub page with:
    - Hero promotional campaign banner with gradient backdrop, highlight badge, and action CTA.
    - Spotlight Deals horizontal carousel with gold flame badge and rapid-scroll navigation.
    - Category tabs (All Offers, Flash Sales, Deals of the Day, Stock Clearance).
    - Integrated Search bar with debounce.
    - Centralized Location selector trigger showing currently selected city / radius.
    - Responsive grid with loading skeletons and zero-state illustrations.
- **[NEW] pp/[lang]/offers/page.jsx**
  - Next.js dynamic route /offers with metadata generation for SEO.
- **[NEW] eatures/offers/CampaignDetail.jsx**
  - Dedicated landing page for major campaigns (e.g., Black Friday, Festival Sale).
  - Top hero banner with campaign schedule dates and live countdown clock.
  - Tabbed filters for child promotions under the campaign.
- **[NEW] pp/[lang]/offers/campaign/[slug]/page.jsx**
  - Next.js dynamic campaign page /offers/campaign/[slug].

### 2.4 Seller Promotion Modals
- **[NEW] eatures/offers/PromoteAdModal.jsx**
  - Dialog for boosting active listings:
    - Daily Bump Up (renews creation timestamp to top of listings).
    - Top Ad (pins ad with badge).
    - Spotlight Deal (features ad in Offer Zone carousel).
  - Inspects user package quotas (emaining_bump_ups, emaining_top_ads, emaining_spotlight_ads).
  - Duration day selector (3, 7, 14, 30 days) and quota validation.
- **[NEW] eatures/offers/AddToPromotionModal.jsx**
  - Allows verified sellers to enroll ads into active admin-created sales (Flash Sales, Deals of the Day, Clearance).
  - Configurable discount percentage / flat discount with live discounted price calculation.
  - Dedicated promotional stock allocation input.

### 2.5 Ad Integration & Navigation
- **[MODIFY] eatures/navigation/home/HomeHeader.jsx**
  - Added "Offers & Sales" navigation item with Flame icon.
- **[MODIFY] eatures/navigation/home/HomeMobileMenu.jsx**
  - Added "Offers & Sales" entry into mobile drawer menu.
- **[MODIFY] components/common/AdCard.jsx**
  - Added visual badges for is_spotlight and is_top_ad.
- **[MODIFY] eatures/ad-details/AdDetails.jsx**
  - Passes full ad model into MakeFeaturedAd for approved ads.
- **[MODIFY] eatures/ad-details/owner/MakeFeaturedAd.jsx**
  - Added "Promote this Ad" and "Join Sale / Flash Deal" action buttons alongside traditional "Make Featured".
- **[MODIFY] eatures/ad-details/AdDetailCard.jsx**
  - Renders active promotion discount badge and discounted sale price with countdown timer.
- **[MODIFY] lang/locale/en.json**
  - Added localization keys for offers, sales, campaigns, spotlight deals, and seller promotion actions.

- **[MODIFY] lib/utils.js**
  - Added `extractArray(res, nestedKey)` utility: seamlessly extracts arrays from Laravel paginated responses (`res.data.data.data`), standard collections (`res.data.data`), custom nested payloads (`res.data.data.promotions`), or raw array payloads with fallback to `[]`.
- **[MODIFY] features/offers/OffersDirectory.jsx**
  - Uses `extractArray` for campaigns, spotlight ads, and tabbed items.
  - Implemented `safeCampaigns`, `safeSpotlight`, and `safeItems` defensive array checks preventing `.filter` or `.map` runtime exceptions.
- **[MODIFY] features/offers/AddToPromotionModal.jsx**
  - Safely extracts available promotions using `extractArray(res, "promotions")`.
  - Implemented `safePromotions` defensive array checks for `.find` and `.map`, and shows clear empty-state message if no promotions are currently open.
- **[MODIFY] features/offers/CampaignDetail.jsx**
  - Uses `extractArray` to safely unpack items and uses `safeItems` guarding `.map`.

---

## 3. Verification & Quality Assurance

- **Code Quality:** Validated with ESLint across all modified and newly created files with zero lint errors or warnings.
- **Styling:** Fully responsive Tailwind CSS with dark mode tokens (dark:bg-card, dark:border-border, dark:text-muted-foreground).
- **Resilience:** Graceful empty states, skeleton loading placeholders, and error boundaries.

---

## 4. Seller Verification & Subscription Package Handling

- **[MODIFY] features/ad-details/owner/MakeFeaturedAd.jsx**:
  - Checks seller verification before opening `PromoteAdModal` or `AddToPromotionModal`.
  - Unverified sellers receive an informative dialog explaining verification requirements with a direct button navigating to `/user-verification`.
- **[MODIFY] features/offers/PromoteAdModal.jsx**:
  - Displays dedicated verification and subscription warning cards with direct action buttons linking to `/user-verification` and `/user-subscription`.
  - Disables promote submission button if verification is pending or package quota is depleted.
- **[MODIFY] features/offers/AddToPromotionModal.jsx**:
  - Displays verification and package requirement warning cards when `eligibilityData` indicates missing requirements.
  - Action buttons link directly to `/user-verification` and `/user-subscription`.
- **[MODIFY] lang/locale/en.json**:
  - Added translatable strings for verification titles, descriptions, and subscription package navigation prompts.

---

## 5. Promotional & Marketing Perks on Subscription Packages

- **[MODIFY] features/subscription/BuyPackageCard.jsx**:
  - Enhanced package feature listing to display bundled promotional perks whenever a package includes `allows_promotions`, `allows_daily_bump_up`, `allows_top_ad`, or `allows_spotlight`.
  - Displays clear bullet items with checkmarks and quota allowances (e.g. `Sales & Campaign Promotions Included (5 items)` or `(unlimited)`).
- **[MODIFY] lang/locale/en.json**:
  - Added localization keys: `salesCampaignPromotionsIncluded`, `dailyBumpUpIncluded`, `topAdBoostIncluded`, `spotlightCarouselIncluded`, and `times`.

---

## 6. Multi-Campaign Carousel, Campaign Ends In Countdown & Ad Details Link Fix

- **[MODIFY] features/offers/OfferItemCard.jsx**:
  - Fixed ad details click navigation: correctly inspects `item?.item` first before falling back to `item?.ad` or root `item`. Properly resolves item slug, title, image, and price whether the card is rendered from `PromotionItemResource` or spotlight `ItemApiResource`.
- **[MODIFY] features/offers/OffersDirectory.jsx**:
  - Replaced single campaign banner with `CampaignsCarousel`: displays all active campaigns when more than one campaign is active with auto-sliding, infinite looping, and pagination dots.
  - Added styled real-time "CAMPAIGN ENDS IN" countdown box (Days, Hrs, Min, Sec) to each campaign hero slide.
- **[MODIFY] features/offers/CampaignDetail.jsx**:
  - Added prominent "CAMPAIGN ENDS IN" countdown card with styled digit tiles and localized labels.
- **[MODIFY] lang/locale/en.json**:
  - Added translations for `campaignEndsIn`, `days`, `hours`, `minutes`, `seconds`, `exploreCampaign`, `campaignOffers`, and `noCampaignItems`.

---

## 7. Real-Time Promotional Badges, Promotional History & Analytics Dashboard

- **[MODIFY] lib/api/index.js**:
  - Added `sellerPromotionsApi.getPromotionsAnalytics()` and `sellerPromotionsApi.getPromotionsHistory({ filter_type, campaign_id, status, page, limit })`.
- **[MODIFY] features/listing/manage/MyAdsCard.jsx**:
  - Added real-time active promotional badge ribbon:
    - Renders `Top Ad` badge with flame icon, `Spotlight` badge with sparkle icon, and active sale pills (`Flash Sale`, `Clearance`, `Deal of the Day`) displaying campaign name and markdown discount percentage.
- **[MODIFY] features/profile/ProfileSidebar.jsx & app/[lang]/(profile)/layout.jsx**:
  - Added "Promotions & Sales" navigation tab (`/my-promotions`) to the seller user profile dashboard sidebar.
- **[NEW] features/promotions/MyPromotions.jsx & app/[lang]/(profile)/my-promotions/page.jsx**:
  - Comprehensive seller analytics dashboard with KPI overview cards:
    - Active Promotions, Units Sold/Claimed, Estimated Promotional Revenue, Buyer Savings Generated.
  - Promotional type breakdown metrics.
  - Tabbed filterable history table (`All`, `Sales & Promotions`, `Boosts & Highlights`, `Flash Sales`, `Clearance Sales`, `Deals of the Day`).
  - Detailed history item cards showing active duration in days, progress bar of claimed units vs promo stock, estimated revenue generated, and real-time status.
- **[MODIFY] lang/locale/en.json**:
  - Added localization keys for analytics metrics, history filtering, and badges.

---

## 8. Daily Bump Up Active Badge & Boosts History Support

- **[MODIFY] features/listing/manage/MyAdsCard.jsx**:
  - Added `Daily Bump Up` cyan badge (`RocketLaunchIcon`) whenever `data.active_promotions.is_daily_bumped` is active.
- **[MODIFY] features/promotions/MyPromotions.jsx**:
  - Expanded filter tabs to include `Daily Bump Up`, `Top Ad`, and `Spotlight`.
  - Updated record cards to render boost items seamlessly with views/clicks, active duration, placement status, and last bumped timestamp.
- **[MODIFY] lang/locale/en.json**:
  - Added translation keys for `dailyBump`, `boostPlacement`, `lastBumped`, `placement`, `sales`, `boosts`, `views`.

---

## 9. Header User Menu Navigation & Verified Seller Access Gate

- **[MODIFY] features/navigation/home/ProfileDropdown.jsx**:
  - Added `Promotions Analytics` link (`/my-promotions`) under `My Ads`.
- **[MODIFY] features/navigation/home/HomeMobileMenu.jsx**:
  - Added `Promotions Analytics` menu item in mobile sidebar drawer navigation.
- **[NEW] app/[lang]/(profile)/promotions/page.jsx**:
  - Route alias pointing to `MyPromotions`.
- **[MODIFY] features/promotions/MyPromotions.jsx**:
  - Restricts promotion analytics and history access to verified sellers.
  - Displays `VerificationRequiredCard` with feature benefits and direct verification CTA when unverified.

---

## 10. Verification Lifecycle State Management & Locked Screen Views

- **[MODIFY] features/user-verification/UserVerification.jsx**:
  - **Under Review View**: When user's verification status is `pending` or `resubmitted`, hides all input fields, document uploaders, and submission buttons. Shows dedicated review status page with amber clock badge, explanatory notice that documents are under review, and navigation buttons.
  - **Already Verified View**: When user's account is verified (`is_verified == true` or `approved`), hides form inputs and displays "Your Account is Verified" with shield seal, security notice that verified seller details are locked and cannot be edited, and quick navigation links.
  - Form remains accessible and editable only for unsubmitted or rejected users (with rejection reason alert).
- **[MODIFY] features/promotions/MyPromotions.jsx**:
  - Checks verification status: if under review, shows amber "Verification Request Under Review" badge and button "Check Verification Status" (`/user-verification`).
- **[MODIFY] features/offers/PromoteAdModal.jsx & AddToPromotionModal.jsx**:
  - Displays under-review alert banner and "Check Verification Status" CTA button when user is pending approval.
- **[MODIFY] lang/locale/en.json**:
  - Added all matching translation keys for verified status, under review status, locked notices, and status checks.
