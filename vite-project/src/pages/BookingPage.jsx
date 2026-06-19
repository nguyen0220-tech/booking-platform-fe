import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserBookings } from "../api/bookingApi";

// ── 상태별 설정 ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PAID: {
    label: "결제 완료",
    color: "#155724",
    bg: "#d4edda",
    border: "#4CAF50",
  },
  COMPLETED: {
    label: "이용 완료",
    color: "#0c5460",
    bg: "#d1ecf1",
    border: "#bee5eb",
  },
  CANCELLED: {
    label: "취소됨",
    color: "#721c24",
    bg: "#f8d7da",
    border: "#f5c6cb",
  },
};

function getStatus(status) {
  return (
    STATUS_CONFIG[status] ?? {
      label: status,
      color: "#555",
      bg: "#f0f0f0",
      border: "#ccc",
    }
  );
}

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = [0];
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(1, current - 1);
    i <= Math.min(total - 2, current + 1);
    i++
  )
    pages.push(i);
  if (current < total - 4) pages.push("...");
  pages.push(total - 1);
  return pages;
}

// ── BookingCard (Airbnb horizontal) ──────────────────────────────────────────
function BookingCard({ booking, onClick }) {
  const { id, usageDate, startTime, endTime, status, packageInfo, facility } =
    booking;

  const facilityName = facility?.facilityInfo?.name ?? "시설명 없음";
  const packageName = packageInfo?.infoDetails?.packageName ?? "패키지명 없음";
  const imageUrl = facility?.imageUrls?.[0] ?? null;
  const st = getStatus(status);

  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ ...s.card, ...(hovered ? s.cardHovered : {}) }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* ── 왼쪽: 이미지 ── */}
      <div style={s.imgWrap}>
        {imageUrl ? (
          <img src={imageUrl} alt={facilityName} style={s.img} />
        ) : (
          <div style={s.imgPlaceholder}>🏢</div>
        )}
      </div>

      {/* ── 오른쪽: 정보 ── */}
      <div style={s.info}>
        {/* 상단: 시설명 + 뱃지 */}
        <div style={s.infoTop}>
          <span style={s.facilityName}>{facilityName}</span>
          <span
            style={{
              ...s.badge,
              color: st.color,
              backgroundColor: st.bg,
              border: `1px solid ${st.border}`,
            }}
          >
            {st.label}
          </span>
        </div>

        {/* 패키지명 */}
        <p style={s.packageName}>{packageName}</p>

        {/* 구분선 */}
        <div style={s.divider} />

        {/* 날짜·시간 */}
        <div style={s.metaRow}>
          <div style={s.metaChip}>
            <span style={s.metaIcon}>📅</span>
            <span style={s.metaText}>{usageDate}</span>
          </div>
          <div style={s.metaChip}>
            <span style={s.metaIcon}>🕐</span>
            <span style={s.metaText}>
              {startTime}
              {endTime ? ` ~ ${endTime}` : ""}
            </span>
          </div>
        </div>

        {/* 하단: 예약번호 + 화살표 */}
        <div style={s.infoBottom}>
          <span style={s.bookingId}>예약번호 #{id}</span>
          <span style={{ ...s.arrow, opacity: hovered ? 1 : 0.4 }}>
            자세히 보기 →
          </span>
        </div>
      </div>
    </div>
  );
}

// ── BookingPage ───────────────────────────────────────────────────────────────
export default function BookingPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const SIZE = 10;

  const load = useCallback(async (targetPage) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchUserBookings(targetPage, SIZE);
      setBookings(result.data ?? []);
      setPageInfo(result.pageInfo ?? null);
    } catch (err) {
      setError(err.message || "예약 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [load, page]);

  const totalPages = pageInfo?.totalPages ?? 0;
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div style={s.page}>
      {/* 헤더 */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button
            style={s.homeBtn}
            onClick={() => navigate("/home")}
            title="Về trang chủ"
          >
            ← Trang chủ
          </button>
          <h1 style={s.title}>📋 나의 예약 목록</h1>
        </div>
        {pageInfo && (
          <span style={s.totalBadge}>총 {pageInfo.totalElements}건</span>
        )}
      </div>

      {/* 로딩 */}
      {loading && (
        <div style={s.center}>
          <div style={s.spinner} />
          <p style={s.loadingText}>예약 목록 불러오는 중...</p>
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div style={s.errorBox}>
          <span>⚠️ {error}</span>
          <button style={s.retryBtn} onClick={() => load(page)}>
            다시 시도
          </button>
        </div>
      )}

      {/* 목록 */}
      {!loading && !error && (
        <>
          {bookings.length === 0 ? (
            <div style={s.empty}>
              <span style={s.emptyIcon}>🗓️</span>
              <p style={s.emptyText}>예약 내역이 없습니다.</p>
            </div>
          ) : (
            <div style={s.list}>
              {bookings.map((b) => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onClick={() => navigate(`/reservations/${b.id}`)}
                />
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div style={s.pagination}>
              <button
                style={{ ...s.pageNavBtn, ...(page === 0 ? s.disabled : {}) }}
                onClick={() => setPage(0)}
                disabled={page === 0}
                title="첫 페이지"
              >
                «
              </button>
              <button
                style={{ ...s.pageNavBtn, ...(page === 0 ? s.disabled : {}) }}
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                title="이전"
              >
                ‹
              </button>

              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`el-${idx}`} style={s.ellipsis}>
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    style={{
                      ...s.pageNumBtn,
                      ...(p === page ? s.pageNumActive : {}),
                    }}
                    onClick={() => setPage(p)}
                  >
                    {p + 1}
                  </button>
                ),
              )}

              <button
                style={{
                  ...s.pageNavBtn,
                  ...(!pageInfo?.hasNext ? s.disabled : {}),
                }}
                onClick={() => setPage((p) => p + 1)}
                disabled={!pageInfo?.hasNext}
                title="다음"
              >
                ›
              </button>
              <button
                style={{
                  ...s.pageNavBtn,
                  ...(page === totalPages - 1 ? s.disabled : {}),
                }}
                onClick={() => setPage(totalPages - 1)}
                disabled={page === totalPages - 1}
                title="마지막"
              >
                »
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "32px 16px 60px",
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
  },

  /* Header */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "12px" },
  homeBtn: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#4CAF50",
    backgroundColor: "#f0faf0",
    border: "1px solid #4CAF50",
    borderRadius: "8px",
    padding: "6px 14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  title: { fontSize: "22px", fontWeight: "bold", color: "#2c3e50", margin: 0 },
  totalBadge: {
    fontSize: "13px",
    color: "#7f8c8d",
    backgroundColor: "#f0f0f0",
    borderRadius: "20px",
    padding: "4px 12px",
  },

  /* List */
  list: {
    display: "flex",
    flexDirection: "column",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #eaeaea",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
  },

  /* Card — Airbnb row */
  card: {
    display: "flex",
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottom: "1px solid #f0f0f0",
    cursor: "pointer",
    transition: "background-color 0.15s",
    outline: "none",
    minHeight: "130px",
  },
  cardHovered: { backgroundColor: "#fafffe" },

  /* 이미지 */
  imgWrap: {
    width: "160px",
    flexShrink: 0,
    backgroundColor: "#f5f5f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  imgPlaceholder: { fontSize: "44px" },

  /* 정보 영역 */
  info: {
    flex: 1,
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    justifyContent: "space-between",
  },
  infoTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "8px",
  },
  facilityName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a1a2e",
    lineHeight: "1.3",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "700",
    borderRadius: "20px",
    padding: "3px 10px",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  packageName: { fontSize: "13px", color: "#888", margin: 0 },

  divider: { height: "1px", backgroundColor: "#f0f0f0", margin: "6px 0" },

  metaRow: { display: "flex", gap: "16px", flexWrap: "wrap" },
  metaChip: { display: "flex", alignItems: "center", gap: "5px" },
  metaIcon: { fontSize: "13px" },
  metaText: { fontSize: "13px", color: "#444" },

  infoBottom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "2px",
  },
  bookingId: { fontSize: "11px", color: "#bbb" },
  arrow: {
    fontSize: "13px",
    color: "#4CAF50",
    fontWeight: "600",
    transition: "opacity 0.15s",
  },

  /* Loading / Empty / Error */
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 0",
    gap: "14px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #eee",
    borderTop: "3px solid #4CAF50",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: "14px", color: "#aaa", margin: 0 },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "70px 0",
    gap: "12px",
  },
  emptyIcon: { fontSize: "48px" },
  emptyText: { fontSize: "15px", color: "#aaa", margin: 0 },
  errorBox: {
    backgroundColor: "#fff5f5",
    border: "1px solid #feb2b2",
    color: "#c53030",
    borderRadius: "10px",
    padding: "16px 20px",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  retryBtn: {
    fontSize: "13px",
    color: "#c53030",
    border: "1px solid #feb2b2",
    background: "#fff",
    borderRadius: "6px",
    padding: "5px 12px",
    cursor: "pointer",
  },

  /* Pagination */
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    marginTop: "36px",
    flexWrap: "wrap",
  },
  pageNavBtn: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    color: "#2c3e50",
    cursor: "pointer",
  },
  disabled: {
    color: "#ccc",
    borderColor: "#eee",
    cursor: "not-allowed",
    backgroundColor: "#fafafa",
  },
  pageNumBtn: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    color: "#2c3e50",
    cursor: "pointer",
    fontWeight: "500",
  },
  pageNumActive: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "1px solid #4CAF50",
    fontWeight: "bold",
  },
  ellipsis: {
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    color: "#aaa",
  },
};
