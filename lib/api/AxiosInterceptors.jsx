import { logoutSuccess } from "@/store/slices/authSlice";
import { setIsUnauthorized } from "@/store/slices/globalStateSlice";
import { store } from "@/store";
import { GET_REELS_PATH, SEED_COOKIE, SEED_HEADER } from "@/lib/constants";
import axios from "axios";

const getLangCode = () => {
  const match = document.cookie.match(/(?:^|;\s*)lang=([^;]*)/);
  return match?.[1] || "fnsdkjfghnsdkjnf";
};

// Per-session seed minted in proxy.js. Not httpOnly precisely so this can read
// it — the server-side reels fetches read the same value via seedHeader().
const getSeedKey = () => {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${SEED_COOKIE}=([^;]*)`)
  );
  return match?.[1] || undefined;
};

const Api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}`,
});

let isUnauthorizedToastShown = false;

Api.interceptors.request.use(function (config) {
  let token = undefined;
  let langCode = undefined;
  let seedKey = undefined;

  if (typeof window !== "undefined") {
    const state = store?.getState();
    token = state?.UserSignup?.data?.token;
    langCode = getLangCode();
    // Guests only, get-reels only — an authenticated call seeds off the user.
    if (!token && config.url?.startsWith(GET_REELS_PATH)) seedKey = getSeedKey();
  }

  if (token) config.headers.authorization = `Bearer ${token}`;
  if (langCode) config.headers["Content-Language"] = langCode;
  if (seedKey) config.headers[SEED_HEADER] = seedKey;

  return config;
});

// Add a response interceptor
Api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      // Call the logout function if the status code is 401
      logoutSuccess();
      if (!isUnauthorizedToastShown) {
        store?.dispatch(setIsUnauthorized(true));
        isUnauthorizedToastShown = true;
        // Reset the flag after a certain period
        setTimeout(() => {
          isUnauthorizedToastShown = false;
        }, 3000); // 3 seconds delay before allowing another toast
      }
    }
    return Promise.reject(error);
  }
);

export default Api;
