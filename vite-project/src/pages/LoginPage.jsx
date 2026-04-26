import { useState, useEffect } from "react";
import { loginApi, registryApi, checkExistInfoApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [checkStatus, setCheckStatus] = useState({
    username: null,
    email: null,
    phone: null,
  });

  const [form, setForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    role: "USER",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
    if (checkStatus[name]) {
      setCheckStatus({ ...checkStatus, [name]: null });
    }
  };

  const handleCheckExist = async (field, typeEnum) => {
    const keyword = form[field];
    if (!keyword) {
      setCheckStatus({
        ...checkStatus,
        [field]: {
          success: false,
          message: "Vui lòng nhập thông tin trước khi kiểm tra!",
        },
      });
      return;
    }

    try {
      const res = await checkExistInfoApi(typeEnum, keyword);
      setCheckStatus({
        ...checkStatus,
        [field]: {
          success: true,
          message: res.message || "Hợp lệ, có thể sử dụng!",
        },
      });
    } catch (err) {
      setCheckStatus({
        ...checkStatus,
        [field]: {
          success: false,
          message: err.message || "Thông tin này đã tồn tại!",
        },
      });
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
        const res = await registryApi(form);
        setSuccessMessage(res.message || "Registration successful!");
        setIsRegister(false);
        setForm({ ...form, password: "" });
        setCheckStatus({ username: null, email: null, phone: null });
      } else {
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

        {successMessage && (
          <div style={styles.successBanner}>
            <span style={{ marginRight: "10px" }}>✅</span>
            {successMessage}
          </div>
        )}

        {generalError && (
          <div style={styles.errorBanner}>
            <span style={{ marginRight: "10px" }}>⚠️</span>
            {generalError}
          </div>
        )}

        <div style={styles.inputGroup}>
          <div style={styles.inputRow}>
            <input
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              style={{
                ...styles.input,
                flex: 1,
                ...(fieldErrors.username && styles.borderError),
              }}
            />
            {isRegister && (
              <button
                type="button"
                style={styles.checkBtn}
                onClick={() => handleCheckExist("username", "USERNAME")}
              >
                Check
              </button>
            )}
          </div>
          {fieldErrors.username && (
            <span style={styles.errorText}>{fieldErrors.username}</span>
          )}
          {isRegister && checkStatus.username && (
            <span
              style={
                checkStatus.username.success
                  ? styles.statusTextSuccess
                  : styles.errorText
              }
            >
              {checkStatus.username.message}
            </span>
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

        {!isRegister && (
          <div style={{ textAlign: "right", marginTop: "5px" }}>
            <span
              style={{
                ...styles.toggleBtn,
                fontSize: "12px",
                textDecoration: "none",
              }}
              onClick={() => navigate("/forgot-account")}
            >
              아이디/비밀번호 찾기 (Forgot ID/PW?)
            </span>
          </div>
        )}

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
              <div style={styles.inputRow}>
                <input
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    flex: 1,
                    ...(fieldErrors.email && styles.borderError),
                  }}
                />
                <button
                  type="button"
                  style={styles.checkBtn}
                  onClick={() => handleCheckExist("email", "EMAIL")}
                >
                  Check
                </button>
              </div>
              {fieldErrors.email && (
                <span style={styles.errorText}>{fieldErrors.email}</span>
              )}
              {checkStatus.email && (
                <span
                  style={
                    checkStatus.email.success
                      ? styles.statusTextSuccess
                      : styles.errorText
                  }
                >
                  {checkStatus.email.message}
                </span>
              )}
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.inputRow}>
                <input
                  name="phone"
                  placeholder="Phone (9-11 digits)"
                  value={form.phone}
                  onChange={handleChange}
                  style={{
                    ...styles.input,
                    flex: 1,
                    ...(fieldErrors.phone && styles.borderError),
                  }}
                />
                <button
                  type="button"
                  style={styles.checkBtn}
                  onClick={() => handleCheckExist("phone", "PHONE")}
                >
                  Check
                </button>
              </div>
              {fieldErrors.phone && (
                <span style={styles.errorText}>{fieldErrors.phone}</span>
              )}
              {checkStatus.phone && (
                <span
                  style={
                    checkStatus.phone.success
                      ? styles.statusTextSuccess
                      : styles.errorText
                  }
                >
                  {checkStatus.phone.message}
                </span>
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
              setCheckStatus({ username: null, email: null, phone: null });
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
  wrapper: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // CẬP NHẬT Ở ĐÂY:
    backgroundImage: "url('/cuk-booking.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#f0f2f5", // Fallback màu nếu ảnh lỗi
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)", // Thêm một chút trong suốt cho card đẹp hơn
    padding: "35px",
    borderRadius: "15px",
    width: "350px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  title: { textAlign: "center", margin: "0 0 5px 0", color: "#333" },
  successBanner: {
    padding: "10px",
    background: "#e6fffa",
    border: "1px solid #38b2ac",
    color: "#2c7a7b",
    borderRadius: "8px",
    fontSize: "13px",
    textAlign: "center",
  },
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
  inputRow: { display: "flex", gap: "8px" },
  checkBtn: {
    padding: "0 15px",
    borderRadius: "8px",
    border: "none",
    background: "#2196F3",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  statusTextSuccess: { color: "#38b2ac", fontSize: "11px", marginLeft: "5px" },
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
