import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../api/authApi";

function HomeForAdmin() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const isAdmin = parsed?.roles?.some((r) => r.name === "ROLE_ADMIN");
      if (!isAdmin) {
        navigate("/");
      } else {
        setUser(parsed);
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  if (!user) return null;

  return (
    <div style={styles.layout}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>🏠 CUK Booking</div>

        <div style={styles.navLinks}>
          <button style={styles.navButton} onClick={() => navigate("/profile")}>
            <span style={styles.icon}>👤</span> 내 페이지
          </button>

          <button
            style={{ ...styles.navButton, ...styles.adminNavButton }}
            onClick={() => navigate("/users")}
          >
            <span style={styles.icon}>🛡️</span> 사용자 관리
          </button>

          <button
            style={{ ...styles.navButton, ...styles.adminNavButton }}
            onClick={() => navigate("/registration-requests")}
          >
            <span style={styles.icon}>📋</span> 등록요청관리
          </button>

          <div style={styles.userInfo}>
            <span style={styles.userName}>Hello, {user.fullName}!</span>
            <button style={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main style={styles.mainContent}>
        <div style={styles.placeholderCard}>
          <h2>Chào mừng quay trở lại, {user.fullName}! 🛡️</h2>
          <p>
            Bạn đang đăng nhập với quyền <strong>Admin</strong>. Sử dụng các
            menu phía trên để quản lý người dùng và yêu cầu đăng ký.
          </p>
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f5f6fa",
    fontFamily: "Arial, sans-serif",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "10px 20px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    borderBottom: "1px solid #eaeaea",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  navBrand: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  navButton: {
    padding: "8px 15px",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    backgroundColor: "transparent",
    color: "#34495e",
  },
  icon: {
    marginRight: "6px",
    fontSize: "16px",
  },
  adminNavButton: {
    color: "#e74c3c",
    fontWeight: "bold",
    backgroundColor: "#fdf1f0",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginLeft: "20px",
    paddingLeft: "20px",
    borderLeft: "1px solid #ddd",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  logoutButton: {
    padding: "6px 12px",
    fontSize: "13px",
    borderRadius: "4px",
    border: "1px solid #e74c3c",
    backgroundColor: "#fff",
    color: "#e74c3c",
    cursor: "pointer",
  },
  mainContent: {
    flex: 1,
    padding: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  placeholderCard: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    width: "100%",
    maxWidth: "800px",
    textAlign: "center",
    color: "#7f8c8d",
  },
};

export default HomeForAdmin;
