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
    error.details = data.data;
    throw error;
  }
  return data;
};

export const verifyApi = async (token) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/verify?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    },
  );

  const data = await res.json();

  return data;
};

export const logoutApi = async () => {
  const res = await fetch(import.meta.env.VITE_API_URL + "/auth/logout", {
    method: "DELETE",
    credentials: "include", // RẤT QUAN TRỌNG: Gửi session cookie lên server để invalidate
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Logout failed");
  }

  return data;
};
