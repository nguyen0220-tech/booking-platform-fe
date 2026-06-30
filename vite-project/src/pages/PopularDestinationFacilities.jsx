import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFacilitiesInPopularDestinationApi } from "../api/facilityPublicApi";

const DESTINATION_LABEL = {
  seoul: "서울",
  busan: "부산",
  jeju: "제주",
  gangneung: "강릉",
};

const PAGE_SIZE = 9;

function PopularDestinationFacilities() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [pageInfo, setPageInfo] = useState(null);

  const destinationEnum = slug ? slug.toUpperCase() : null;
  const label = DESTINATION_LABEL[slug] ?? slug;
  const isValidDestination = Object.keys(DESTINATION_LABEL).includes(slug);

  useEffect(() => {
    setPage(0);
  }, [slug]);

  useEffect(() => {
    if (!isValidDestination) return;
    setLoading(true);
    setError("");
    fetchFacilitiesInPopularDestinationApi({
      destination: destinationEnum,
      page,
      size: PAGE_SIZE,
    })
      .then((res) => {
        setFacilities(res?.data ?? []);
        setPageInfo(res?.pageInfo ?? null);
      })
      .catch((err) => setError(err.message || "데이터를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [destinationEnum, page, isValidDestination]);

  if (!isValidDestination) {
    return (
      <div style={styles.page}>
        <div style={styles.errorBox}>
          <span>⚠️ 잘못된 접근입니다.</span>
          <button style={styles.retryBtn} onClick={() => navigate("/")}>
            홈으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ── HEADER ── */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ←
        </button>
        <div style={styles.headerTextWrap}>
          <h2 style={styles.title}>{label} 인기 시설</h2>
          {!loading && !error && pageInfo && (
            <span style={styles.totalCount}>
              총 {pageInfo.totalElements}개 시설
            </span>
          )}
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={styles.content}>
        {loading ? (
          <div style={styles.placeholderBox}>
            <span style={styles.placeholderText}>불러오는 중...</span>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>
            <span>⚠️ {error}</span>
          </div>
        ) : facilities.length === 0 ? (
          <div style={styles.placeholderBox}>
            <span style={styles.placeholderText}>
              해당 지역에 등록된 시설이 없습니다
            </span>
          </div>
        ) : (
          <div style={styles.grid}>
            {facilities.map((facility) => {
              const thumbnail = facility.imageUrls?.[0];
              return (
                <div
                  key={facility.id}
                  style={styles.card}
                  onClick={() => navigate(`/facilities/${facility.id}`)}
                >
                  <div style={styles.cardThumbWrap}>
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={facility.facilityInfo?.name ?? ""}
                        style={styles.cardThumb}
                      />
                    ) : (
                      <div style={styles.cardThumbFallback}>🏢</div>
                    )}
                    {facility.facilityType && (
                      <div style={styles.cardTypeBadge}>
                        {facility.facilityType}
                      </div>
                    )}
                  </div>
                  <div style={styles.cardBody}>
                    <span style={styles.cardName}>
                      {facility.facilityInfo?.name ?? "—"}
                    </span>
                    <span style={styles.cardAddress}>
                      📍 {facility.facilityInfo?.address ?? "—"}
                    </span>
                    {facility.facilityInfo?.description && (
                      <p style={styles.cardDesc}>
                        {facility.facilityInfo.description}
                      </p>
                    )}
                    {/* ── RATING ── */}
                    <div style={styles.cardRatingRow}>
                      <span style={styles.cardRatingStar}>★</span>
                      <span style={styles.cardRatingValue}>
                        {facility.facilityInfo?.averageRating != null
                          ? Number(facility.facilityInfo.averageRating).toFixed(
                              1,
                            )
                          : "—"}
                      </span>
                      <span style={styles.cardReviewCount}>
                        ({facility.facilityInfo?.totalReviews ?? 0}개 평가)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {!loading && !error && pageInfo && pageInfo.totalElements > 0 && (
          <div style={styles.pagination}>
            <button
              style={{
                ...styles.pageBtn,
                ...(page === 0 ? styles.pageBtnDisabled : {}),
              }}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              ← 이전
            </button>
            <span style={styles.pageNum}>
              {page + 1} / {pageInfo.totalPages}
            </span>
            <button
              style={{
                ...styles.pageBtn,
                ...(!pageInfo.hasNext ? styles.pageBtnDisabled : {}),
              }}
              onClick={() => setPage((p) => p + 1)}
              disabled={!pageInfo.hasNext}
            >
              다음 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    backgroundColor: "#fff",
    padding: "16px 24px",
    borderBottom: "1px solid #eaeaea",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  backBtn: {
    width: "34px",
    height: "34px",
    flexShrink: 0,
    border: "none",
    borderRadius: "50%",
    backgroundColor: "#f0f2f5",
    color: "#2c3e50",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
  },
  totalCount: {
    fontSize: "12px",
    color: "#999",
  },
  content: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    boxSizing: "border-box",
  },

  /* GRID CARD */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "18px",
  },
  card: {
    backgroundColor: "#fff",
    border: "1px solid #eaeaea",
    borderRadius: "14px",
    overflow: "hidden",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    transition: "box-shadow 0.15s, transform 0.15s",
  },
  cardThumbWrap: {
    position: "relative",
    width: "100%",
    height: "160px",
    backgroundColor: "#f0f2f5",
    flexShrink: 0,
  },
  cardThumb: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  cardThumbFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    color: "#ccc",
  },
  cardTypeBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "rgba(44, 62, 80, 0.85)",
    color: "#fff",
    borderRadius: "20px",
    padding: "4px 11px",
    fontSize: "11px",
    fontWeight: "700",
  },
  cardBody: {
    padding: "14px 16px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    flex: 1,
  },
  cardName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1a1a2e",
  },
  cardAddress: {
    fontSize: "12.5px",
    color: "#888",
  },
  cardDesc: {
    fontSize: "12.5px",
    color: "#666",
    margin: "0",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    flex: 1,
  },
  cardRatingRow: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "8px",
    marginTop: "4px",
  },
  cardRatingStar: {
    fontSize: "13px",
    color: "#f5a623",
  },
  cardRatingValue: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  cardReviewCount: {
    fontSize: "12px",
    color: "#aaa",
  },

  placeholderBox: {
    backgroundColor: "#fff",
    border: "1px dashed #ddd",
    borderRadius: "10px",
    padding: "60px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: "13px",
    color: "#aaa",
  },
  errorBox: {
    backgroundColor: "#fff5f5",
    border: "1px solid #feb2b2",
    color: "#c53030",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
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

  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
    marginTop: "4px",
  },
  pageBtn: {
    padding: "9px 18px",
    fontSize: "13px",
    fontWeight: "500",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    color: "#2c3e50",
    cursor: "pointer",
  },
  pageBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  pageNum: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },
};

export default PopularDestinationFacilities;
