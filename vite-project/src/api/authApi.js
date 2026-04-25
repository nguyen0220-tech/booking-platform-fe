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

export const checkExistInfoApi = async (checkType, keyword) => {
  const res = await fetch(import.meta.env.VITE_API_URL + "/auth/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ checkType, keyword }),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Check failed");
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

export const forgotUsernameApi = async (email, phone) => {
  const res = await fetch(
    import.meta.env.VITE_API_URL + "/auth/find-username",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone }),
    },
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    const error = new Error(data.message || "Không thể tìm thấy tài khoản");
    error.details = data.data; // Bắt field errors từ @Valid nếu có
    throw error;
  }
  return data;
};

export const forgotPasswordApi = async (username) => {
  const res = await fetch(
    import.meta.env.VITE_API_URL + "/auth/find-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    },
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    const error = new Error(data.message || "Yêu cầu thất bại");
    error.details = data.data;
    throw error;
  }
  return data;
};

export const resetPasswordApi = async (resetData) => {
  // resetData: token, newPassword, confirmPassword
  const res = await fetch(
    import.meta.env.VITE_API_URL + "/auth/reset-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(resetData),
    },
  );

  const data = await res.json();

  if (!res.ok || !data.success) {
    const error = new Error(data.message || "비밀번호 재설정 실패");
    error.details = data.data;
    throw error;
  }

  return data;
};
