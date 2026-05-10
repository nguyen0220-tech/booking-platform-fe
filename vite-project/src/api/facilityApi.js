import {
  GET_FACILITIES,
  GET_FACILITIES_BY_KEYWORD,
  GET_FACILITY_DETAIL,
  GET_FACILITY_REGISTRATION_LIST,
  GET_FACILITY_REGISTRATION_DETAIL,
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

// Thêm ảnh vào DB cho facility
export const addFacilityImagesApi = async (facilityId, imageUrls) => {
  const response = await fetch(
    import.meta.env.VITE_API_URL + "/facility/add-images",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ facilityId: Number(facilityId), imageUrls }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Thêm ảnh thất bại");
  }
  return await response.json();
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

export const updateFacilityOptionApi = async (facilityId, options) => {
  const optionStates = [
    { option: "ACTIVE", state: options.active ?? false },
    { option: "CAR_PARK", state: options.carPark ?? false },
    { option: "HAS_WIFI", state: options.hasWifi ?? false },
  ];

  const response = await fetch(
    import.meta.env.VITE_API_URL + "/facility/option",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({ facilityId: Number(facilityId), optionStates }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "옵션 업데이트 실패");
  }
  return await response.json();
};

// Cập nhật info của facility (tùy type)
export const updateFacilityInfoApi = async (
  facilityId,
  facilityType,
  infoData,
) => {
  const response = await fetch(
    import.meta.env.VITE_API_URL + "/facility/info",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        facilityId: Number(facilityId),
        type: facilityType, // "SPORT" | "MOTEL" | "RESTAURANT"
        ...infoData,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "정보 업데이트 실패");
  }
  return await response.json();
};

export const fetchFacilityRegistrationListApi = async (
  status,
  page = 0,
  size = 5,
) => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        query: GET_FACILITY_REGISTRATION_LIST,
        variables: { status, page, size },
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.facilityRegistrationList;
  } catch (error) {
    console.error("Lỗi fetchFacilityRegistrationListApi:", error);
    throw error;
  }
};

export const fetchFacilityRegistrationDetailApi = async (id) => {
  try {
    const response = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
      body: JSON.stringify({
        query: GET_FACILITY_REGISTRATION_DETAIL,
        variables: { id },
      }),
    });

    if (!response.ok) throw new Error(`HTTP $\{response.status\}`);
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);

    return result.data.facilityRegistration;
  } catch (error) {
    console.error("Lỗi fetchFacilityRegistrationDetailApi:", error);
    throw error;
  }
};

export const handleFacilityRegistrationApi = async ({ id, status, note }) => {
  try {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "/facility-registration",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getCsrfHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ id, status, note }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error("BE error body:", errBody); // <-- xem log này
      throw new Error(`HTTP ${response.status}`);
    }
    const result = await response.json();
    if (result.error) throw new Error(result.message || "처리 실패");
    return result;
  } catch (error) {
    console.error("Lỗi handleFacilityRegistrationApi:", error);
    throw error;
  }
};
