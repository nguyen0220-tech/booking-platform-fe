import {
  SEARCH_FACILITIES_WITH_KEYWORD,
  GET_FACILITY_PUBLIC_DETAIL,
  GET_FACILITIES_SUGGESTION,
} from "../graphql/queries/facilityQueries";

// ─── Query dành cho USER (public, không cần auth) ───────────────────────────

export const searchFacilitiesApi = async ({
  keyword = "",
  page = 0,
  size = 12,
}) => {
  const response = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      query: SEARCH_FACILITIES_WITH_KEYWORD,
      variables: { keyword, page, size },
    }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.facilitiesWithKeyword;
};

// ─── Facility detail + packages (public) ─────────────────────────────────────
export const fetchFacilityPublicDetailApi = async ({
  id,
  page = 0,
  size = 5,
}) => {
  const response = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: GET_FACILITY_PUBLIC_DETAIL,
      variables: { id, page, size },
    }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.facility;
};

// ─── Facility suggestion (public) ────────────────────────────────────────────
export const fetchFacilitiesSuggestionApi = async () => {
  const response = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: GET_FACILITIES_SUGGESTION,
    }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.facilitiesSuggestion;
};
