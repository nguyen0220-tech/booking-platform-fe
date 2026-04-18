import { useState, useEffect } from "react";
import { loginApi, registryApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // State cho thông báo thành công
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    role: "USER",
  });

  const navigate = useNavigate();

  // Tự động xóa thông báo thành công sau 5 giây
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");
    setFieldErrors({});
    setLoading(true);

    try {
      if (isRegister) {
        // Xử lý Đăng ký
        const res = await registryApi(form);
        // Hiển thị message từ Backend trả về
        setSuccessMessage(res.message || "Registration successful!");
        setIsRegister(false); // Quay lại màn hình Login

        // Reset form để người dùng đăng nhập
        setForm({ ...form, password: "" });
      } else {
        // Xử lý Đăng nhập
        const res = await loginApi(form.username, form.password);
        localStorage.setItem("user", JSON.stringify(res.data));
        navigate("/home");
      }
    } catch (err) {
      if (err.details) {
        setFieldErrors(err.details);
      } else {
        setGeneralError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>{isRegister ? "Create Account" : "Login"}</h2>

        {/* THÔNG BÁO THÀNH CÔNG ĐẸP MẮT */}
        {successMessage && (
          <div style={styles.successBanner}>
            <span style={{ marginRight: "10px" }}>✅</span>
            {successMessage}
          </div>
        )}

        {/* THÔNG BÁO LỖI CHUNG */}
        {generalError && (
          <div style={styles.errorBanner}>
            <span style={{ marginRight: "10px" }}>⚠️</span>
            {generalError}
          </div>
        )}

        <div style={styles.inputGroup}>
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(fieldErrors.username && styles.borderError),
            }}
          />
          {fieldErrors.username && (
            <span style={styles.errorText}>{fieldErrors.username}</span>
          )}
        </div>

        <div style={styles.inputGroup}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={{
              ...styles.input,
              ...(fieldErrors.password && styles.borderError),
            }}
          />
          {fieldErrors.password && (
            <span style={styles.errorText}>{fieldErrors.password}</span>
          )}
        </div>

        {isRegister && (
          <>
            <div style={styles.inputGroup}>
              <input
                name="fullName"
                placeholder="Full Name (Korean/English)"
                value={form.fullName}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.fullName && styles.borderError),
                }}
              />
              {fieldErrors.fullName && (
                <span style={styles.errorText}>{fieldErrors.fullName}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.email && styles.borderError),
                }}
              />
              {fieldErrors.email && (
                <span style={styles.errorText}>{fieldErrors.email}</span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <input
                name="phone"
                placeholder="Phone (9-11 digits)"
                value={form.phone}
                onChange={handleChange}
                style={{
                  ...styles.input,
                  ...(fieldErrors.phone && styles.borderError),
                }}
              />
              {fieldErrors.phone && (
                <span style={styles.errorText}>{fieldErrors.phone}</span>
              )}
            </div>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="USER">사용자 (User)</option>
              <option value="PROVIDER">제공자 (Provider)</option>
            </select>
          </>
        )}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Processing..." : isRegister ? "Sign Up" : "Login"}
        </button>

        <hr style={styles.hr} />

        <p style={styles.toggleText}>
          {isRegister ? "회원을 가입하셨다면" : "아직 계정이 없으시나요? "}{" "}
          <span
            style={styles.toggleBtn}
            onClick={() => {
              setIsRegister(!isRegister);
              setFieldErrors({});
              setGeneralError("");
              setSuccessMessage("");
            }}
          >
            {isRegister ? "Login here" : "Register now"}
          </span>
        </p>
      </form>
    </div>
  );
}

const styles = {
  // ... các style cũ giữ nguyên ...
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f2f5",
  },
  card: {
    background: "#fff",
    padding: "35px",
    borderRadius: "15px",
    width: "350px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
  title: { textAlign: "center", margin: "0 0 5px 0", color: "#333" },

  // Style cho thông báo thành công
  successBanner: {
    padding: "10px",
    background: "#e6fffa",
    border: "1px solid #38b2ac",
    color: "#2c7a7b",
    borderRadius: "8px",
    fontSize: "13px",
    textAlign: "center",
  },

  // Style cho lỗi chung (thay cho p đơn thuần)
  errorBanner: {
    padding: "10px",
    background: "#fff5f5",
    border: "1px solid #feb2b2",
    color: "#c53030",
    borderRadius: "8px",
    fontSize: "13px",
    textAlign: "center",
  },

  inputGroup: { display: "flex", flexDirection: "column", gap: "3px" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
  },
  borderError: { borderColor: "#ff4d4f" },
  errorText: { color: "#ff4d4f", fontSize: "11px", marginLeft: "5px" },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#4CAF50",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "5px",
  },
  hr: { border: "0", borderTop: "1px solid #eee", margin: "5px 0" },
  toggleText: { textAlign: "center", fontSize: "14px", color: "#666" },
  toggleBtn: {
    color: "#2196F3",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default LoginPage;
