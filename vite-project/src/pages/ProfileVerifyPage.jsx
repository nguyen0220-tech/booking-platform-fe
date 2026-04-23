import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyUpdateEmailApi } from "../api/profileApi";

function ProfileVerifyPage() {
  const [searchParams] = useSearchParams();
  const [result, setResult] = useState({
    loading: true,
    success: false,
    message: "",
  });
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    const confirmEmailUpdate = async () => {
      if (!token) {
        setResult({
          loading: false,
          success: false,
          message: "유효하지 않은 토큰입니다. (Token không hợp lệ)",
        });
        return;
      }

      try {
        const data = await verifyUpdateEmailApi(token);
        setResult({
          loading: false,
          success: data.success,
          message:
            data.message ||
            "이메일 변경이 성공적으로 완료되었습니다! (Xác thực email thành công!)",
        });
      } catch (error) {
        setResult({
          loading: false,
          success: false,
          message:
            error.message ||
            "인증 과정에서 오류 발생 (Lỗi trong quá trình xác thực)",
        });
      }
    };

    confirmEmailUpdate();
  }, [token]);

  if (result.loading) {
    return (
      <div style={styles.container}>
        이메일 인증 중... (Đang xác thực email...)
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
          {result.success ? "이메일 인증 성공!" : "이메일 인증 실패"}
        </h2>
        <p style={styles.message}>{result.message}</p>

        <button style={styles.button} onClick={() => navigate("/profile")}>
          프로필로 돌아가기 (Quay lại Profile)
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
  message: {
    color: "#7f8c8d",
    marginBottom: "30px",
    lineHeight: "1.5",
    wordBreak: "keep-all",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#3498db",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default ProfileVerifyPage;
