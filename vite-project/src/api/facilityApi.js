import {
  GET_FACILITIES,
  GET_FACILITIES_BY_KEYWORD,
  GET_FACILITY_DETAIL,
} from "../graphql/queries/facilityQueries";
import { getCookie } from "../api/cookie";

const getCsrfHeaders = () => {
  const csrfToken = getCookie("XSRF-TOKEN");
  return csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {};
};

export const fetchFacilityDetailApi = async (id) => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        query: GET_FACILITY_DETAIL,
        variables: { id },
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.facility;
  } catch (error) {
    console.error("Lỗi fetchFacilityDetailApi:", error);
    throw error;
  }
};

export const fetchFacilitiesApi = async (page = 0, size = 5) => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        query: GET_FACILITIES,
        variables: { page, size },
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.facilities;
  } catch (error) {
    console.error("Lỗi fetchFacilitiesApi:", error);
    throw error;
  }
};

export const searchFacilitiesApi = async (keyword, page = 0, size = 5) => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        query: GET_FACILITIES_BY_KEYWORD,
        variables: { keyword, page, size },
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.facilitiesByKeyword;
  } catch (error) {
    console.error("Lỗi searchFacilitiesApi:", error);
    throw error;
  }
};

// 1. API Upload ảnh - Trả về List<String>
export const uploadImagesApi = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch(
    import.meta.env.VITE_API_URL + "/facility/upload-images",
    {
      method: "POST",
      headers: { ...getCsrfHeaders() },
      credentials: "include",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorMsg = await response.text();
    throw new Error(`Upload ảnh thất bại: ${errorMsg}`);
  }

  const result = await response.json();
  return result.data;
};

// 2. API Tạo Facility
export const createFacilityApi = async (facilityData) => {
  const response = await fetch(import.meta.env.VITE_API_URL + "/facility", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaders(),
    },
    credentials: "include",
    body: JSON.stringify(facilityData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Lỗi khi tạo cơ sở");
  }
  return await response.json();
};
