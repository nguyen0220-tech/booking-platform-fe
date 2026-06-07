import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../api/authApi";

function HomeForUser() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const isUser = parsed?.roles?.some((r) => r.name === "ROLE_USER");
      if (!isUser) {
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
      {/* ── NAVBAR ── */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>🏠 CUK Booking</div>
        <div style={styles.navLinks}>
          <button style={styles.navButton} onClick={() => navigate("/profile")}>
            <span style={styles.icon}>👤</span> 내 페이지
          </button>
          <button
            style={styles.navButton}
            onClick={() => navigate("/reservations")}
          >
            <span style={styles.icon}>📅</span> 예약 내역
          </button>
          <div style={styles.navDivider} />
          <span style={styles.userName}>Hello, {user.fullName}!</span>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── SEARCH BAR ── */}
      <div style={styles.searchBarWrap}>
        <div style={styles.searchInner}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="시설 이름, 위치, 종류 검색... (Tìm kiếm cơ sở)"
            style={styles.searchInput}
            onClick={() => navigate("/search")}
            readOnly
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={styles.mainContent}>
        {/* Lịch hẹn sắp tới */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>
            📆 다가오는 예약 — Lịch hẹn sắp tới
          </h3>
          <div style={styles.placeholderBox}>
            <span style={styles.placeholderText}>
              Chưa có lịch hẹn nào sắp tới
            </span>
          </div>
        </section>

        {/* Cơ sở đã xem gần đây */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>🕐 최근 본 시설 — Đã xem gần đây</h3>
          <div style={styles.cardGrid}>
            {/* Các FacilityCard sẽ render ở đây */}
            <div style={styles.emptyCard}>
              <span style={styles.placeholderText}>Chưa có dữ liệu</span>
            </div>
          </div>
        </section>

        {/* Facility được đề xuất */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>✨ 추천 시설 — Đề xuất cho bạn</h3>
          <div style={styles.cardGrid}>
            {/* Các FacilityCard sẽ render ở đây */}
            <div style={styles.emptyCard}>
              <span style={styles.placeholderText}>Chưa có dữ liệu</span>
            </div>
          </div>
        </section>

        {/* Hàng cuối: Thống kê + Thông báo */}
        <div style={styles.bottomRow}>
          {/* Thống kê hoạt động */}
          <section style={{ ...styles.section, flex: 1 }}>
            <h3 style={styles.sectionTitle}>📊 내 활동 — Thống kê của tôi</h3>
            <div style={styles.statGrid}>
              <div style={styles.statCard}>
                <span style={styles.statNum}>—</span>
                <span style={styles.statLabel}>Tổng đặt chỗ</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNum}>—</span>
                <span style={styles.statLabel}>Tháng này</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNum}>—</span>
                <span style={styles.statLabel}>Yêu thích</span>
              </div>
            </div>
          </section>

          {/* Thông báo */}
          <section style={{ ...styles.section, flex: 1 }}>
            <h3 style={styles.sectionTitle}>🔔 공지사항 — Thông báo</h3>
            <div style={styles.placeholderBox}>
              <span style={styles.placeholderText}>Không có thông báo mới</span>
            </div>
          </section>
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

  /* NAVBAR */
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "10px 24px",
    borderBottom: "1px solid #eaeaea",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  navBrand: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  navButton: {
    padding: "8px 14px",
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
    fontSize: "15px",
  },
  navDivider: {
    width: "1px",
    height: "24px",
    backgroundColor: "#ddd",
    margin: "0 8px",
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
    marginLeft: "8px",
  },

  /* SEARCH BAR */
  searchBarWrap: {
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #eaeaea",
    padding: "12px 24px",
  },
  searchInner: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#f0f2f5",
    border: "1px solid #e0e0e0",
    borderRadius: "10px",
    padding: "10px 16px",
    maxWidth: "560px",
    cursor: "pointer",
  },
  searchIcon: {
    fontSize: "16px",
    flexShrink: 0,
  },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "14px",
    color: "#333",
    width: "100%",
    cursor: "pointer",
  },

  /* MAIN */
  mainContent: {
    flex: 1,
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    maxWidth: "1100px",
    width: "100%",
    margin: "0 auto",
    alignSelf: "center",
    boxSizing: "border-box",
  },

  /* SECTION */
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
  },

  /* PLACEHOLDER */
  placeholderBox: {
    backgroundColor: "#fff",
    border: "1px dashed #ddd",
    borderRadius: "10px",
    padding: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: "13px",
    color: "#aaa",
  },

  /* CARD GRID */
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "12px",
  },
  emptyCard: {
    backgroundColor: "#fff",
    border: "1px dashed #ddd",
    borderRadius: "10px",
    padding: "40px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gridColumn: "1 / -1",
  },

  /* BOTTOM ROW */
  bottomRow: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },

  /* STAT */
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "10px",
  },
  statCard: {
    backgroundColor: "#f0f2f5",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  statNum: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statLabel: {
    fontSize: "11px",
    color: "#7f8c8d",
    textAlign: "center",
  },
};

export default HomeForUser;
