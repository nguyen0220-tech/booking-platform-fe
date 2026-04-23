import { getCookie } from "../api/cookie";

// Lấy thông tin profile
export const getProfileApi = async () => {
  const res = await fetch(import.meta.env.VITE_API_URL + "/profile", {
    method: "GET",
    credentials: "include", // Quan trọng để gửi kèm session/cookie/token
  });
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Lỗi tải profile");
  return data;
};

// Upload Avatar
export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(import.meta.env.VITE_API_URL + "/profile", {
    method: "POST",
    credentials: "include",
    headers: {
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Lỗi upload avatar");
  return data;
};

export const updateProfileApi = async (payload) => {
  const res = await fetch(import.meta.env.VITE_API_URL + "/profile", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data.message || "Lỗi cập nhật thông tin");
  return data;
};

export const verifyUpdateEmailApi = async (token) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/profile/verify?token=${token}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
      },
    },
  );

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "이메일 인증 실패 (Lỗi xác thực email)");
  }
  return data;
};
