export const loginApi = async (username, password) => {
  const res = await fetch(import.meta.env.VITE_API_URL + "/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // QUAN TRỌNG nếu dùng cookie/session
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const registryApi = async (registryRequest) => {
  const res = await fetch(import.meta.env.VITE_API_URL + "/auth/registry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(registryRequest),
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || "Registry failed");
    error.details = data.data; // Lưu thông tin lỗi validation (data field từ BE)
    throw error;
  }
  return data;
};
