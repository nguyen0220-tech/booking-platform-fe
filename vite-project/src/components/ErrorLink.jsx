import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SessionExpired({ message }) {
  useEffect(() => {
    // Xóa mọi thứ liên quan đến session
    localStorage.clear();
    sessionStorage.clear();

    const timer = setTimeout(() => {
      // Thay vì navigate, dùng window.location để refresh toàn bộ app
      window.location.href = "/";
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.container}>
      <h2>⚠️ Phiên đăng nhập hết hạn</h2>
      <p>{message}</p>
      <p>Đang chuyển hướng về trang đăng nhập...</p>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px",
  },
};

export default SessionExpired;
