export const SEO_REVALIDATE_SECONDS =
    (Number(process.env.NEXT_PUBLIC_SEO_REVALIDATE_MINUTES) || 60) * 60;
export const SITEMAP_REVALIDATE_SECONDS = 604800;

export const VISITED_LANDING_COOKIE = "visited_landing_page";
export const VISITED_LANDING_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const LOCATION_COOKIE = "location";
export const LOCATION_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

// Review text longer than this collapses behind See More / See Less.
export const REVIEW_CLAMP_LENGTH = 180;

// Per-session key the backend uses to keep the public reels shuffle stable
// across pages. Minted in proxy.js, carried as a session cookie (dies with the
// browser session) plus a request header so the very first server render — which
// cannot see a cookie it just set on the response — still has it.
// Sent only on get-reels, and only for unauthenticated callers: with a token the
// backend seeds off the user instead.
export const SEED_COOKIE = "seed_key";
export const SEED_HEADER = "x-seed-key";
export const GET_REELS_PATH = "get-reels";

export const EXPLORE_VIDEOS_PER_PAGE = 10;

export const IMAGE_ACCEPT = { "image/jpeg": [".jpeg", ".jpg"], "image/png": [".png"] };

export const VIDEO_ACCEPT = {
    "video/mp4": [".mp4"],
};

// Videos above this resolution (either dimension) are ~4K+, too heavy for mid-range mobile devices to process.
export const MAX_VIDEO_DIMENSION = 3840;


export const knownParams = [
    "country",
    "state",
    "city",
    "area",
    "areaId",
    "lat",
    "lng",
    "min_price",
    "max_price",
    "date_posted",
    "km_range",
    "sort_by",
    "query",
    "location",
];

export const workProcessSteps = [
    {
        id: 1,
        title: 'listingMadeEasy',
        description: 'createAds',
    },
    {
        id: 2,
        title: "instantReach",
        description: "connectVastAudience",
    },
    {
        id: 3,
        title: "effortlessConnection",
        description: "interactSecureMessaging",
    },
    {
        id: 4,
        title: "enjoyBenefits",
        description: "reapRewards",
    },
];

export const quickLinks = [
    {
        id: 6,
        href: "/reel/latest",
        labelKey: "videoAds",
    },
    {
        id: 3,
        href: "/subscription",
        labelKey: "subscription",
    },
    {
        id: 4,
        href: "/blogs",
        labelKey: "ourBlog",
    },
    {
        id: 5,
        href: "/faqs",
        labelKey: "faqs",
    },
    {
        id: 1,
        href: "/about-us",
        labelKey: "aboutUs",
    },
    {
        id: 2,
        href: "/contact-us",
        labelKey: "contactUs",
    },
];