// ForgotAccountPage.jsx
import { useState, useEffect } from "react";
import { forgotUsernameApi, forgotPasswordApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";

function ForgotAccountPage() {
  // isFindUsername = true -> Form tìm Username (ID)
  // isFindUsername = false -> Form tìm Password
  const [isFindUsername, setIsFindUsername] = useState(true);

  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [foundUsername, setFoundUsername] = useState(""); // Lưu Username tìm được
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    email: "",
    phone: "",
    username: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setSuccessMessage("");
    setFoundUsername("");
    setFieldErrors({});
    setLoading(true);

    try {
      if (isFindUsername) {
        // Gọi API Tìm ID
        const res = await forgotUsernameApi(form.email, form.phone);
        setSuccessMessage(res.message);
        setFoundUsername(res.data); // Backend trả về id ở trường "data" (vd: "user_45")
      } else {
        // Gọi API Tìm Mật khẩu
        const res = await forgotPasswordApi(form.username);
        setSuccessMessage(
          res.message || "이메일로 비밀번호 재설정 링크를 보냈습니다.",
        ); // Đã gửi email reset
      }
    } catch (err) {
      if (err.details) {
        setFieldErrors(err.details); // Validation errors từ BE (@NotBlank, @Email...)
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
        <h2 style={styles.title}>
          {isFindUsername ? "아이디 찾기" : "비밀번호 찾기"}
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#666",
            marginTop: 0,
          }}
        >
          {isFindUsername ? "Find Username" : "Find Password"}
        </p>

        {successMessage && !foundUsername && (
          <div style={styles.successBanner}>
            <span style={{ marginRight: "10px" }}>✅</span>
            {successMessage}
          </div>
        )}

        {/* Bảng hiển thị kết quả tìm ID thành công */}
        {foundUsername && (
          <div style={styles.resultBanner}>
            <p style={{ margin: "0 0 5px 0" }}>
              회원님의 아이디는 아래와 같습니다.
            </p>
            <h3 style={{ margin: 0, color: "#2196F3" }}>{foundUsername}</h3>
          </div>
        )}

        {generalError && (
          <div style={styles.errorBanner}>
            <span style={{ marginRight: "10px" }}>⚠️</span>
            {generalError}
          </div>
        )}

        {isFindUsername ? (
          <>
            {/* --- EMAIL (Dùng cho tìm ID) --- */}
            <div style={styles.inputGroup}>
              <input
                name="email"
                type="text"
                placeholder="가입한 이메일 (Email)"
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

            {/* --- PHONE (Dùng cho tìm ID) --- */}
            <div style={styles.inputGroup}>
              <input
                name="phone"
                type="text"
                placeholder="휴대폰 번호 (Phone)"
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
          </>
        ) : (
          <>
            {/* --- USERNAME (Dùng cho tìm Password) --- */}
            <div style={styles.inputGroup}>
              <input
                name="username"
                type="text"
                placeholder="가입한 아이디 (Username)"
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
          </>
        )}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "처리중..." : "확인"}
        </button>

        {/* Nút quay lại Login (nếu tìm ID xong thì có thể ấn về Đăng nhập ngay) */}
        {foundUsername && (
          <button
            type="button"
            style={{ ...styles.button, background: "#607D8B", marginTop: "0" }}
            onClick={() => navigate("/")}
          >
            로그인하기 (Go to Login)
          </button>
        )}

        <hr style={styles.hr} />

        <p style={styles.toggleText}>
          {isFindUsername ? "비밀번호를 잊으셨나요? " : "아이디를 잊으셨나요? "}
          <span
            style={styles.toggleBtn}
            onClick={() => {
              setIsFindUsername(!isFindUsername);
              setFieldErrors({});
              setGeneralError("");
              setSuccessMessage("");
              setFoundUsername("");
              setForm({ email: "", phone: "", username: "" });
            }}
          >
            {isFindUsername ? "비밀번호 찾기" : "아이디 찾기"}
          </span>
        </p>

        {/* Quay lại trang đăng nhập */}
        <p style={{ ...styles.toggleText, marginTop: "0" }}>
          <span style={styles.toggleBtn} onClick={() => navigate("/")}>
            뒤로 가기 (Back to Login)
          </span>
        </p>
      </form>
    </div>
  );
}

// Bê nguyên bộ Styles từ LoginPage sang, thêm 1 class cho hiển thị Result
const styles = {
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
  successBanner: {
    padding: "10px",
    background: "#e6fffa",
    border: "1px solid #38b2ac",
    color: "#2c7a7b",
    borderRadius: "8px",
    fontSize: "13px",
    textAlign: "center",
  },
  resultBanner: {
    // Style mới để hiển thị Username tìm được nổi bật
    padding: "15px",
    background: "#e3f2fd",
    border: "1px solid #90caf9",
    color: "#0d47a1",
    borderRadius: "8px",
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
  toggleText: { textAlign: "center", fontSize: "13px", color: "#666" },
  toggleBtn: {
    color: "#2196F3",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default ForgotAccountPage;
