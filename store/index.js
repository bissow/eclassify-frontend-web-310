import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import settingsReducer from "./slices/settingSlice";
import categoryReducer from './slices/categorySlice'
import CurrentLanguageReducer from './slices/languageSlice'
import globalStateReducer from './slices/globalStateSlice';
import authReducer from './slices/authSlice'
import chatReducer from './slices/chatSlice'

const persistConfig = {
  key: 'root',
  storage,
  manualPersisting: true,
  // These come fresh per request via preloadedState (see providers.jsx) —
  // persisting them would let a stale localStorage value win on rehydrate.
  // Chat is blacklisted for the same reason: a rehydrated conversation would
  // show messages that may already be deleted or read on the server.
  // GlobalState is blacklisted because it holds AdsView (grid/list toggle),
  // which the server always renders as "grid" — a persisted value rehydrating
  // after mount caused a hydration mismatch.
  blacklist: ['Settings', 'CurrentLanguage', 'Category', 'Chat', 'GlobalState'],
};

const rootReducer = combineReducers({
  Settings: settingsReducer,
  Category: categoryReducer,
  UserSignup: authReducer,
  CurrentLanguage: CurrentLanguageReducer,
  GlobalState: globalStateReducer,
  Chat: chatReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Factory so each request (and the client tab) can seed its own store from
// server-fetched data instead of starting empty. See providers.jsx.
export const makeStore = (preloadedState) => configureStore({
  reducer: persistedReducer,
  preloadedState,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({ serializableCheck: false }),
  ],
});

// Client-tab singleton lives in ./storeRef (a leaf module) so the slices can
// import it without importing this file, which would create a circular edge.
// Re-exported here so utils/index.jsx, api/AxiosInterceptors.jsx and providers
// keep importing { store, setStore } from "@/store" unchanged.
export { store, persistor, setStore } from "./storeRef";
