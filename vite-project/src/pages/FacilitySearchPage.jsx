import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { searchFacilitiesApi } from "../api/facilityPublicApi";

const PAGE_SIZE = 12;

function FacilitySearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(0);
  const [results, setResults] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchResults = useCallback(async (kw, p) => {
    setLoading(true);
    setError("");
    try {
      const data = await searchFacilitiesApi({
        keyword: kw,
        page: p,
        size: PAGE_SIZE,
      });
      setResults(data.data || []);
      setPageInfo(data.pageInfo || null);
    } catch (err) {
      setError(err.message || "검색 중 오류가 발생했습니다.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Chỉ fetch khi có keyword (từ URL ?q=... hoặc sau khi user bấm tìm)
  useEffect(() => {
    if (keyword.trim()) {
      fetchResults(keyword, page);
    }
  }, [keyword, page, fetchResults]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setKeyword(trimmed);
    setPage(0);
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.layout}>
      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div
          style={styles.navBrand}
          onClick={() => navigate("/home")}
          role="button"
        >
          🏠 CUK Booking
        </div>
      </nav>

      {/* SEARCH BAR */}
      <div style={styles.searchWrap}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <div style={styles.searchInner}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="시설 이름, 위치, 종류 검색..."
              style={styles.searchInput}
              autoFocus
            />
            {inputValue && (
              <button
                type="button"
                style={styles.clearBtn}
                onClick={() => {
                  setInputValue("");
                  setKeyword("");
                  setPage(0);
                  setSearchParams({});
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" style={styles.searchBtn}>
            검색
          </button>
        </form>
      </div>

      {/* CONTENT */}
      <main style={styles.main}>
        {/* Summary */}
        {!loading && pageInfo && (
          <p style={styles.summary}>
            {keyword
              ? `"${keyword}" 검색 결과 — ${pageInfo.totalElements}개`
              : `전체 시설 — ${pageInfo.totalElements}개`}
          </p>
        )}

        {/* Error */}
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {/* Loading */}
        {loading && (
          <div style={styles.stateBox}>
            <span style={styles.spinner}>⏳</span>
            <p style={styles.stateText}>검색 중... (Đang tìm kiếm...)</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && results.length === 0 && (
          <div style={styles.stateBox}>
            <span style={styles.stateEmoji}>🔍</span>
            <p style={styles.stateText}>검색 결과가 없습니다</p>
          </div>
        )}

        {/* GRID */}
        {!loading && results.length > 0 && (
          <div style={styles.grid}>
            {results.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                onClick={() => navigate(`/facilities/${facility.id}`)}
              />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        {!loading && pageInfo && pageInfo.totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              style={{
                ...styles.pageBtn,
                ...(page === 0 ? styles.pageBtnDisabled : {}),
              }}
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
            >
              ← 이전
            </button>

            {Array.from({ length: pageInfo.totalPages }, (_, i) => (
              <button
                key={i}
                style={{
                  ...styles.pageBtn,
                  ...(i === page ? styles.pageBtnActive : {}),
                }}
                onClick={() => handlePageChange(i)}
              >
                {i + 1}
              </button>
            ))}

            <button
              style={{
                ...styles.pageBtn,
                ...(!pageInfo.hasNext ? styles.pageBtnDisabled : {}),
              }}
              onClick={() => handlePageChange(page + 1)}
              disabled={!pageInfo.hasNext}
            >
              다음 →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ── FacilityCard Component ──────────────────────────────────────────────────
function FacilityCard({ facility, onClick }) {
  const { facilityType, imageUrls, facilityInfo } = facility;
  const thumbnail = imageUrls?.[0] || null;

  return (
    <div style={styles.card} onClick={onClick} role="button">
      {/* Image */}
      <div style={styles.cardImgWrap}>
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={facilityInfo?.name}
            style={styles.cardImg}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div style={styles.cardImgFallback}>🏢</div>
        )}
        {/* Type badge */}
        <span style={styles.typeBadge}>{facilityType || "기타"}</span>
      </div>

      {/* Info */}
      <div style={styles.cardBody}>
        <p style={styles.cardName}>{facilityInfo?.name || "—"}</p>
        <p style={styles.cardAddress}>
          📍 {facilityInfo?.address || "주소 없음"}
        </p>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  layout: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#f5f6fa",
    fontFamily: "Arial, sans-serif",
  },

  /* Navbar */
  navbar: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #eaeaea",
    padding: "12px 24px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  },
  navBrand: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2c3e50",
    cursor: "pointer",
    display: "inline-block",
  },

  /* Search */
  searchWrap: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #eaeaea",
    padding: "14px 24px",
  },
  searchForm: {
    display: "flex",
    gap: "10px",
    maxWidth: "700px",
  },
  searchInner: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#f0f2f5",
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "10px 16px",
  },
  searchIcon: { fontSize: "16px", flexShrink: 0 },
  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    outline: "none",
    fontSize: "14px",
    color: "#333",
  },
  clearBtn: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#999",
    fontSize: "14px",
    padding: "2px 4px",
  },
  searchBtn: {
    padding: "10px 20px",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  /* Main */
  main: {
    flex: 1,
    padding: "24px",
    maxWidth: "1100px",
    width: "100%",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  summary: {
    fontSize: "13px",
    color: "#7f8c8d",
    marginBottom: "16px",
  },

  /* State boxes */
  stateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 24px",
    gap: "12px",
  },
  stateEmoji: { fontSize: "40px" },
  spinner: { fontSize: "30px" },
  stateText: { fontSize: "14px", color: "#aaa" },

  errorBox: {
    backgroundColor: "#fff5f5",
    border: "1px solid #feb2b2",
    color: "#c53030",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "13px",
    marginBottom: "16px",
  },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },

  /* Card */
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    border: "1px solid #eaeaea",
    overflow: "hidden",
    cursor: "pointer",
    transition: "box-shadow 0.2s",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  cardImgWrap: {
    position: "relative",
    height: "140px",
    backgroundColor: "#f0f2f5",
    overflow: "hidden",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardImgFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    backgroundColor: "#eef0f3",
  },
  typeBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "99px",
  },
  cardBody: {
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  cardName: {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardAddress: {
    fontSize: "12px",
    color: "#7f8c8d",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  /* Pagination */
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
    marginTop: "32px",
    flexWrap: "wrap",
  },
  pageBtn: {
    padding: "7px 13px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#34495e",
  },
  pageBtnActive: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "1px solid #4CAF50",
    fontWeight: "bold",
  },
  pageBtnDisabled: {
    color: "#bbb",
    cursor: "not-allowed",
    backgroundColor: "#f5f5f5",
  },
};

export default FacilitySearchPage;
