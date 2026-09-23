import { persistStore } from "redux-persist";

// Client-tab store singleton, kept in its own leaf module (imports only
// redux-persist, nothing app-side). Slices dispatch via store?.dispatch by
// importing THIS instead of store/index.js — importing store/index created a
// circular edge (store/index → slice → store/index) that intermittently threw
// "Cannot access '{default export}' before initialization" (TDZ), depending on
// which module the bundler evaluated first.
//
// Set once on the client by <Providers> (see providers.jsx). Undefined on the
// server, where the optional chaining in the slices' dispatch helpers no-ops.
export let store;
export let persistor;

export const setStore = (s) => {
  store = s;
  persistor = persistStore(s);
};
