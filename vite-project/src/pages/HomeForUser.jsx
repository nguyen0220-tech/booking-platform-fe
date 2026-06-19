import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logoutApi } from "../api/authApi";
import { fetchUpcomingBookings } from "../api/bookingApi";
import { fetchFacilitiesSuggestionApi } from "../api/facilityPublicApi";

const formatUsageDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  });
};

function HomeForUser() {
  const [user, setUser] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [daysLatter, setDaysLatter] = useState(7);
  const [customDays, setCustomDays] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const [suggestedFacilities, setSuggestedFacilities] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

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

  useEffect(() => {
    if (!user) return;
    setLoadingBookings(true);
    fetchUpcomingBookings(daysLatter)
      .then((res) => setUpcomingBookings(res.data ?? []))
      .catch(console.error)
      .finally(() => setLoadingBookings(false));
  }, [user, daysLatter]);

  useEffect(() => {
    if (!user) return;
    setLoadingSuggestions(true);
    fetchFacilitiesSuggestionApi()
      .then((res) => setSuggestedFacilities(res?.data ?? []))
      .catch(console.error)
      .finally(() => setLoadingSuggestions(false));
  }, [user]);

  const handleDaySelect = (days) => {
    setUseCustom(false);
    setCustomDays("");
    setDaysLatter(days);
  };

  const handleCustomApply = () => {
    const val = parseInt(customDays, 10);
    if (!val || val < 1) return;
    setUseCustom(false);
    setDaysLatter(val);
  };

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
            placeholder="시설 이름, 위치, 종류 검색..."
            style={styles.searchInput}
            onClick={() => navigate("/search")}
            readOnly
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main style={styles.mainContent}>
        {/* ── UPCOMING BOOKINGS ── */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>📆 다가오는 예약</h3>

          {/* Bộ chọn số ngày */}
          <div style={styles.dayFilter}>
            {[1, 3, 7].map((d) => (
              <button
                key={d}
                style={{
                  ...styles.dayBtn,
                  ...(!useCustom && daysLatter === d
                    ? styles.dayBtnActive
                    : {}),
                }}
                onClick={() => handleDaySelect(d)}
              >
                {d}일 후
              </button>
            ))}

            <button
              style={{
                ...styles.dayBtn,
                ...(useCustom ? styles.dayBtnActive : {}),
              }}
              onClick={() => setUseCustom(true)}
            >
              직접 입력
            </button>

            {useCustom && (
              <div style={styles.customInputWrap}>
                <input
                  type="number"
                  min={1}
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="일수 입력"
                  style={styles.customInput}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomApply()}
                  autoFocus
                />
                <button style={styles.applyBtn} onClick={handleCustomApply}>
                  적용
                </button>
              </div>
            )}

            <span style={styles.dayHint}>{daysLatter}일 이내 예약</span>
          </div>

          {/* Danh sách booking */}
          {loadingBookings ? (
            <div style={styles.placeholderBox}>
              <span style={styles.placeholderText}>불러오는 중...</span>
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div style={styles.placeholderBox}>
              <span style={styles.placeholderText}>
                Chưa có lịch hẹn nào sắp tới
              </span>
            </div>
          ) : (
            <div style={styles.bookingList}>
              {upcomingBookings.map((booking) => {
                const thumbnail = booking.facility?.imageUrls?.[0];
                return (
                  <div key={booking.id} style={styles.bookingCard}>
                    <div style={styles.bookingThumbWrap}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={booking.facility?.facilityInfo?.name ?? ""}
                          style={styles.bookingThumb}
                        />
                      ) : (
                        <div style={styles.bookingThumbFallback}>🏢</div>
                      )}
                      <div style={styles.bookingDateBadge}>
                        {formatUsageDate(booking.usageDate)}
                      </div>
                    </div>
                    <div style={styles.bookingInfo}>
                      <span style={styles.bookingFacility}>
                        🏢 {booking.facility?.facilityInfo?.name ?? "—"}
                      </span>
                      <span style={styles.bookingDate}>
                        📅 {formatUsageDate(booking.usageDate)}
                      </span>
                      <span style={styles.bookingPackage}>
                        📦{" "}
                        {booking.packageInfo?.infoDetails?.packageName ?? "—"}
                      </span>
                      <span style={styles.bookingTime}>
                        🕐 {booking.startTime}
                        {booking.endTime ? ` ~ ${booking.endTime}` : ""}
                      </span>
                    </div>
                    <button
                      style={styles.detailBtn}
                      onClick={() => navigate(`/reservations/${booking.id}`)}
                    >
                      상세 보기
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>국내 인기 여행지</h3>
          <div style={styles.cardGrid}>
            <div style={styles.emptyCard}>
              <span style={styles.placeholderText}>Chưa có dữ liệu</span>
            </div>
          </div>
        </section>

        {/* ── ĐỀ XUẤT ── */}
        <section style={styles.section}>
          <h3 style={styles.sectionTitle}>✨ 추천 시설</h3>
          {loadingSuggestions ? (
            <div style={styles.placeholderBox}>
              <span style={styles.placeholderText}>불러오는 중...</span>
            </div>
          ) : suggestedFacilities.length === 0 ? (
            <div style={styles.cardGrid}>
              <div style={styles.emptyCard}>
                <span style={styles.placeholderText}>Chưa có dữ liệu</span>
              </div>
            </div>
          ) : (
            <div style={styles.cardGrid}>
              {suggestedFacilities.map((facility) => {
                const thumbnail = facility.imageUrls?.[0];
                return (
                  <div
                    key={facility.id}
                    style={styles.facilityCard}
                    onClick={() => navigate(`/facilities/${facility.id}`)}
                  >
                    <div style={styles.facilityThumbWrap}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={facility.facilityInfo?.name ?? ""}
                          style={styles.facilityThumb}
                        />
                      ) : (
                        <div style={styles.bookingThumbFallback}>🏢</div>
                      )}
                      {facility.facilityType && (
                        <div style={styles.facilityTypeBadge}>
                          {facility.facilityType}
                        </div>
                      )}
                    </div>
                    <div style={styles.facilityInfo}>
                      <span style={styles.facilityName}>
                        {facility.facilityInfo?.name ?? "—"}
                      </span>
                      <span style={styles.facilityAddress}>
                        📍 {facility.facilityInfo?.address ?? "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── HÀNG CUỐI: Thống kê + Thông báo ── */}
        <div style={styles.bottomRow}>
          {/* Thống kê */}
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
    textAlign: "left",
    width: "100%",
  },

  /* DAY FILTER */
  dayFilter: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  },
  dayBtn: {
    padding: "6px 14px",
    fontSize: "13px",
    borderRadius: "20px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    color: "#555",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  dayBtnActive: {
    backgroundColor: "#2c3e50",
    color: "#fff",
    border: "1px solid #2c3e50",
  },
  dayHint: {
    fontSize: "12px",
    color: "#aaa",
    marginLeft: "4px",
  },
  customInputWrap: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  customInput: {
    width: "70px",
    padding: "5px 8px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    outline: "none",
  },
  applyBtn: {
    padding: "5px 10px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#3498db",
    color: "#fff",
    cursor: "pointer",
  },

  /* BOOKING LIST — hiển thị dạng hàng ngang, cuộn ngang khi nhiều booking */
  bookingList: {
    display: "flex",
    flexDirection: "row",
    gap: "14px",
    overflowX: "auto",
    paddingBottom: "10px",
    scrollbarWidth: "thin",
  },
  bookingCard: {
    backgroundColor: "#fff",
    border: "1px solid #eaeaea",
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    minWidth: "220px",
    flex: "0 0 220px",
  },
  bookingThumbWrap: {
    position: "relative",
    width: "100%",
    height: "110px",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "#f0f2f5",
    flexShrink: 0,
  },
  bookingThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  bookingThumbFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    color: "#bbb",
  },
  bookingDateBadge: {
    position: "absolute",
    bottom: "6px",
    left: "6px",
    backgroundColor: "rgba(44, 62, 80, 0.85)",
    color: "#fff",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "11px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  bookingInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  bookingFacility: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  bookingDate: {
    fontSize: "12px",
    color: "#2c3e50",
    fontWeight: "500",
  },
  bookingPackage: {
    fontSize: "12px",
    color: "#7f8c8d",
  },
  bookingTime: {
    fontSize: "12px",
    color: "#3498db",
  },
  detailBtn: {
    padding: "6px 12px",
    fontSize: "12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    color: "#555",
    cursor: "pointer",
    alignSelf: "flex-start",
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

  /* FACILITY SUGGESTION CARD */
  facilityCard: {
    backgroundColor: "#fff",
    border: "1px solid #eaeaea",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
  },
  facilityThumbWrap: {
    position: "relative",
    width: "100%",
    height: "120px",
    backgroundColor: "#f0f2f5",
  },
  facilityThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  facilityTypeBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "rgba(44, 62, 80, 0.85)",
    color: "#fff",
    borderRadius: "6px",
    padding: "3px 8px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  facilityInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "10px 12px",
  },
  facilityName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  facilityAddress: {
    fontSize: "11px",
    color: "#7f8c8d",
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
