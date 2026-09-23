import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Flattens one key/value into the search bag. Nested keys become
// custom_fields[26]=v, arrays custom_fields[27][0]=v, and undefined/null/""
// are dropped rather than sent as empty params.
const appendParam = (search, key, value) => {
  if (value === undefined || value === null || value === "") return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => appendParam(search, `${key}[${index}]`, item));
  } else if (typeof value === "object") {
    Object.entries(value).forEach(([k, v]) => appendParam(search, `${key}[${k}]`, v));
  } else {
    search.append(key, value);
  }
};

// Query-string serializer for the server fetchers. Mirrors axios' default
// serialization (lib/api sets no paramsSerializer) so a server-rendered page
// and the client request that continues it stay in agreement. One known
// difference: axios keeps empty-string params, this drops them — no current
// caller produces one.
export const toQueryString = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => appendParam(search, key, value));
  return search.toString();
};


// Lives here rather than in lib/format.js: that module is "use client" (it reads
// the store for locale-aware formatting), so importing this from a server
// component threw "Attempted to call truncate() from the server". This one is
// pure — safe on both sides.
export const truncate = (text, maxLength) => {
  if (!text) return "";
  const stringText = String(text);
  return stringText.length <= maxLength
    ? text
    : stringText.slice(0, maxLength) + "...";
};
