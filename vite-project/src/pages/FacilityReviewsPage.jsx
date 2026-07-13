import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// TODO: khi backend sẵn sàng, tạo và import hàm gọi API thật, ví dụ:
// import { fetchFacilityReviewsApi } from "../api/facilityApi";

const tokens = {
  teal900: "#0d5c5c",
  teal700: "#208a8a",
  teal600: "#2a9d9d",
  teal100: "#e6f5f4",
  teal50: "#f3fbfa",
  ink900: "#1e2b3a",
  ink600: "#54637a",
  ink400: "#95a5a6",
  border: "#e7ebf1",
  bg: "#f5f7fa",
  danger: "#e74c3c",
  gold: "#f5a623",
  goldBg: "#fffaf0",
};

function FacilityReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dữ liệu tổng quan + danh sách review — sẽ đổ từ API thật sau này
  const [summary, setSummary] = useState({
    averageRating: null,
    totalReviews: 0,
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    else navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: thay đoạn dưới bằng gọi API thật, ví dụ:
        // const data = await fetchFacilityReviewsApi(id);
        // setSummary({ averageRating: data.averageRating, totalReviews: data.totalReviews });
        // setReviews(data.reviews ?? []);

        // Placeholder tạm thời — chưa có API
        setSummary({ averageRating: null, totalReviews: 0 });
        setReviews([]);
      } catch {
        setError("이용 후기를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (!user) return null;

  return (
    <div style={styles.layout}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            style={styles.backButton}
            onClick={() => navigate(`/facility-details/${id}`)}
          >
            ← 시설 상세
          </button>
          <div style={styles.headerDivider} />
          <div>
            <h1 style={styles.pageTitle}>이용 후기</h1>
            <span style={styles.pageSubtitle}>
              사용자들이 남긴 평가를 확인하세요
            </span>
          </div>
        </div>
      </header>

      <main style={styles.mainContent}>
        {loading && <p style={styles.statusText}>⏳ 불러오는 중...</p>}
        {error && (
          <p style={{ ...styles.statusText, color: tokens.danger }}>{error}</p>
        )}

        {!loading && !error && (
          <div style={styles.contentWrapper}>
            {/* 요약 카드 */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryStar}>★</div>
              <div style={styles.summaryValue}>
                {summary.averageRating != null
                  ? Number(summary.averageRating).toFixed(1)
                  : "—"}
              </div>
              <div style={styles.summaryLabel}>
                총 {summary.totalReviews ?? 0}개의 평가
              </div>
            </div>

            {/* 리스트 카드 */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>전체 후기</h2>

              {reviews.length === 0 ? (
                <div style={styles.emptyBox}>
                  <span style={styles.emptyIcon}>💬</span>
                  <p style={styles.emptyText}>아직 등록된 후기가 없습니다.</p>
                  <p style={styles.emptySubText}>
                    리뷰 기능은 추후 업데이트될 예정입니다.
                  </p>
                </div>
              ) : (
                <div style={styles.reviewList}>
                  {reviews.map((review) => (
                    <div key={review.id} style={styles.reviewItem}>
                      <div style={styles.reviewHeader}>
                        <span style={styles.reviewAuthor}>
                          {review.authorName ?? "익명"}
                        </span>
                        <span style={styles.reviewRating}>
                          ★ {review.rating}
                        </span>
                      </div>
                      <p style={styles.reviewContent}>{review.content}</p>
                      <span style={styles.reviewDate}>
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString(
                              "ko-KR",
                            )
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    backgroundColor: tokens.bg,
    fontFamily: "Arial, sans-serif",
  },
  header: {
    backgroundColor: "#fff",
    padding: "18px 32px",
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
    borderBottom: `1px solid ${tokens.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "16px" },
  backButton: {
    padding: "9px 16px",
    borderRadius: "8px",
    border: `1px solid ${tokens.border}`,
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "13.5px",
    fontWeight: "600",
    color: tokens.ink600,
  },
  headerDivider: {
    width: "1px",
    height: "28px",
    backgroundColor: tokens.border,
  },
  pageTitle: {
    fontSize: "19px",
    fontWeight: "700",
    color: tokens.ink900,
    margin: 0,
  },
  pageSubtitle: {
    fontSize: "12.5px",
    color: tokens.ink400,
    fontWeight: "600",
  },
  mainContent: { padding: "28px 32px", maxWidth: "760px", margin: "0 auto" },
  statusText: {
    textAlign: "center",
    color: tokens.ink400,
    marginTop: "80px",
    fontSize: "16px",
  },
  contentWrapper: { display: "flex", flexDirection: "column", gap: "18px" },

  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    border: `1px solid ${tokens.border}`,
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
    padding: "28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
  },
  summaryStar: {
    fontSize: "26px",
    color: tokens.gold,
  },
  summaryValue: {
    fontSize: "32px",
    fontWeight: "800",
    color: tokens.ink900,
  },
  summaryLabel: {
    fontSize: "13px",
    color: tokens.ink400,
    fontWeight: "600",
    marginTop: "2px",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    border: `1px solid ${tokens.border}`,
    boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
    padding: "24px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: tokens.ink900,
    margin: "0 0 16px",
  },

  emptyBox: {
    minHeight: "160px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "2px",
  },
  emptyIcon: {
    fontSize: "24px",
    marginBottom: "8px",
    opacity: 0.6,
  },
  emptyText: {
    color: tokens.ink400,
    fontSize: "14px",
    textAlign: "center",
    margin: 0,
  },
  emptySubText: {
    fontSize: "12.5px",
    color: "#bbb",
    marginTop: "4px",
    textAlign: "center",
  },

  reviewList: { display: "flex", flexDirection: "column", gap: "14px" },
  reviewItem: {
    borderBottom: `1px solid ${tokens.border}`,
    paddingBottom: "14px",
  },
  reviewHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  reviewAuthor: {
    fontSize: "13.5px",
    fontWeight: "700",
    color: tokens.ink900,
  },
  reviewRating: {
    fontSize: "13px",
    fontWeight: "700",
    color: tokens.gold,
  },
  reviewContent: {
    fontSize: "14px",
    color: tokens.ink600,
    lineHeight: "1.6",
    margin: "0 0 6px",
  },
  reviewDate: {
    fontSize: "11.5px",
    color: tokens.ink400,
  },
};

export default FacilityReviewsPage;
