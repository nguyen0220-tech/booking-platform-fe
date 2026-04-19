import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyApi } from "../api/authApi";

function RegistryResponsePage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState({
    loading: true,
    success: false,
    message: "",
  });
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    const confirmVerification = async () => {
      if (!token) {
        setResult({
          loading: false,
          success: false,
          message: "Mã xác nhận không tồn tại.",
        });
        return;
      }

      try {
        const data = await verifyApi(token);
        setResult({
          loading: false,
          success: data.success,
          message: data.message,
        });
      } catch (error) {
        setResult({
          loading: false,
          success: false,
          message: "Có lỗi xảy ra trong quá trình xác thực.",
        });
      }
    };

    confirmVerification();
  }, [token]);

  if (result.loading) {
    return (
      <div style={styles.container}>
        Đang xác thực tài khoản, vui lòng đợi...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={result.success ? styles.iconSuccess : styles.iconError}>
          {result.success ? "✅" : "❌"}
        </div>
        <h2 style={styles.title}>
          {result.success ? "Thành công!" : "Thất bại"}
        </h2>
        <p style={styles.message}>{result.message}</p>

        <button style={styles.button} onClick={() => navigate("/")}>
          Quay lại trang đăng nhập
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "400px",
    width: "90%",
  },
  iconSuccess: { fontSize: "50px", marginBottom: "20px" },
  iconError: { fontSize: "50px", marginBottom: "20px" },
  title: { color: "#2c3e50", marginBottom: "10px" },
  message: { color: "#7f8c8d", marginBottom: "30px", lineHeight: "1.5" },
  button: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
  },
};

export default RegistryResponsePage;
