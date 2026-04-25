import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../api/authApi";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // get token from URL
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false); // Trạng thái để hiện nút chuyển trang

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Reset lỗi khi người dùng gõ lại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // check token
    if (!token) {
      setError("유효하지 않은 링크입니다.");
      return;
    }

    // Kiểm tra mật khẩu khớp nhau (FE tự check nhanh)
    if (form.newPassword !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        token: token,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      };

      const res = await resetPasswordApi(payload);

      setSuccessMessage(res.message || "비밀번호가 성공적으로 변경되었습니다!");
      setIsSuccess(true);
    } catch (err) {
      // Bắt lỗi từ BE (VD: validation lỗi, token hết hạn...)
      setError(err.message || "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>비밀번호 재설정</h2>
        <p style={styles.subtitle}>새로운 비밀번호를 입력해주세요</p>

        {error && (
          <div style={styles.errorBanner}>
            <span style={{ marginRight: "10px" }}>⚠️</span> {error}
          </div>
        )}

        {successMessage && (
          <div style={styles.successBanner}>
            <span style={{ marginRight: "10px" }}>✅</span> {successMessage}
          </div>
        )}

        {!isSuccess ? (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div style={styles.inputGroup}>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={form.newPassword}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={form.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? "Processing..." : "Change Password"}
            </button>
          </form>
        ) : (
          /* Nút chuyển về trang Login khi thành công */
          <button
            style={{ ...styles.button, background: "#4CAF50" }}
            onClick={() => navigate("/")}
          >
            로그인으로 돌아가기 (Back to Login)
          </button>
        )}
      </div>
    </div>
  );
}

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
  title: { textAlign: "center", margin: "0", color: "#333" },
  subtitle: {
    textAlign: "center",
    margin: "0 0 10px 0",
    color: "#666",
    fontSize: "14px",
  },
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
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2196F3",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "5px",
  },
};

export default ResetPasswordPage;
