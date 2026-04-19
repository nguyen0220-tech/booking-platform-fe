import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../api/authApi";

function HomePage() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy dữ liệu user từ localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // Nếu chưa đăng nhập thì đẩy về trang login
      navigate("/");
    }
  }, [navigate]);

  // Kiểm tra quyền Admin và Provider
  const isAdmin = user?.roles?.some((role) => role.name === "ROLE_ADMIN");
  const isProvider = user?.roles?.some((role) => role.name === "ROLE_PROVIDER");

  // Cập nhật hàm handleLogout
  const handleLogout = async () => {
    try {
      // 1. Gọi API để hủy Session Context trên Backend Spring Boot
      await logoutApi();
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      // 2. Luôn luôn thực hiện xóa LocalStorage và chuyển hướng ở Frontend
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
          {/* Nút hiển thị cho tất cả mọi người */}
          <button style={styles.navButton} onClick={() => navigate("/profile")}>
            <span style={styles.icon}>👤</span> 내 페이지
          </button>

          <button
            style={styles.navButton}
            onClick={() => console.log("Reservations")}
          >
            <span style={styles.icon}>📅</span> 예약 내역
          </button>

          {/* Nút chỉ dành cho Provider */}
          {isProvider && (
            <button
              style={styles.navButton}
              onClick={() => navigate("/products")} // Có thể đổi route tùy ý
            >
              <span style={styles.icon}>📦</span> 제품 관리
            </button>
          )}

          {/* Nút chỉ dành cho Admin */}
          {isAdmin && (
            <button
              style={{ ...styles.navButton, ...styles.adminNavButton }}
              onClick={() => navigate("/users")}
            >
              <span style={styles.icon}>🛡️</span> 사용자 관리
            </button>
          )}

          {/* Thông tin user & Logout (Hiển thị cho tất cả) */}
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
          <h2>Chào mừng quay trở lại, {user.fullName}! 👋</h2>
          <p>
            Đây là khu vực nội dung chính. Bạn có thể thêm các dashboard, biểu
            đồ, hoặc thông báo tại đây trong tương lai.
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

  // -- STYLES CHO NAVBAR --
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
    transition: "background 0.2s",
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
    transition: "all 0.2s",
  },

  // -- STYLES CHO CONTENT AREA --
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

export default HomePage;
