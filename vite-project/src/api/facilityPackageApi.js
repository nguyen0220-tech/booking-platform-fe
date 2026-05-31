import { GET_FACILITY_PACKAGES } from "../graphql/queries/facilityPackageQueries";
import { getCookie } from "../api/cookie";

const getCsrfHeaders = () => {
  const csrfToken = getCookie("XSRF-TOKEN");
  return csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {};
};

export const fetchFacilityPackagesApi = async (
  facilityId,
  page = 0,
  size = 6,
) => {
  const response = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getCsrfHeaders() },
    credentials: "include",
    body: JSON.stringify({
      query: GET_FACILITY_PACKAGES,
      variables: { facilityId: Number(facilityId), page, size },
    }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.facilityPackages;
};

export const createFacilityPackageApi = async (payload) => {
  const response = await fetch(
    import.meta.env.VITE_API_URL + "/facility-package",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify(payload),
    },
  );
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "패키지 추가 실패");
  }
  return await response.json();
};

// act: "ACTIVE" | "INACTIVE"
export const updateFacilityPackageStatusApi = async (packageId, act) => {
  const response = await fetch(
    import.meta.env.VITE_API_URL + "/facility-package",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ packageId: Number(packageId), act }),
    },
  );
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "상태 변경 실패");
  }
  return await response.json();
};
