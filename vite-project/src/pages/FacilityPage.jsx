import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFacilitiesApi, searchFacilitiesApi } from "../api/facilityApi";

function FacilityPage() {
  const [user, setUser] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 5,
    hasNext: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [activeKeyword, setActiveKeyword] = useState(""); // keyword đang được áp dụng
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const loadFacilities = useCallback(
    async (page = 0, searchKeyword = "") => {
      setLoading(true);
      setError(null);
      try {
        const result = searchKeyword
          ? await searchFacilitiesApi(searchKeyword, page, pageInfo.size)
          : await fetchFacilitiesApi(page, pageInfo.size);
        setFacilities(result.data);
        setPageInfo(result.pageInfo);
      } catch (err) {
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [pageInfo.size],
  );

  useEffect(() => {
    if (user) loadFacilities(0, "");
  }, [user]);

  const handleSearch = () => {
    const trimmed = keyword.trim();
    setActiveKeyword(trimmed);
    loadFacilities(0, trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleReset = () => {
    setKeyword("");
    setActiveKeyword("");
    loadFacilities(0, "");
  };

  const getTypeLabel = (type) => {
    const map = {
      Sport: "⚽ 스포츠",
      Motel: "🏨 모텔",
      Restaurant: "🍽️ 음식점",
    };
    return map[type] || type;
  };

  const getStatusBadge = (status) => {
    const map = {
      APPROVED: { label: "승인됨", color: "#2ecc71" },
      PENDING: { label: "대기중", color: "#f39c12" },
      REJECTED: { label: "거절됨", color: "#e74c3c" },
    };
    const s = map[status] || { label: status, color: "#95a5a6" };
    return (
      <span style={{ ...styles.badge, backgroundColor: s.color }}>
        {s.label}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div style={styles.layout}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backButton} onClick={() => navigate("/home")}>
            ⬅ Quay lại
          </button>
          <h1 style={styles.pageTitle}>📦 시설 관리</h1>
        </div>
      </header>

      <main style={styles.mainContent}>
        {/* ACTION BAR */}
        <div style={styles.actionBar}>
          <div style={styles.actionLeft}>
            <button
              style={{ ...styles.actionButton, ...styles.btnPrimary }}
              onClick={() => navigate("/facility-registry")}
            >
              <span style={styles.icon}>➕</span> 제품 등록하기
            </button>
            <button
              style={{ ...styles.actionButton, ...styles.btnInfo }}
              onClick={() => console.log("Mở danh sách quản lý đặt chỗ")}
            >
              <span style={styles.icon}>📅</span> 예약 관리
            </button>
          </div>

          <div style={styles.searchBox}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="🔍 시설명 검색..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {activeKeyword && (
              <button
                style={{ ...styles.actionButton, ...styles.btnReset }}
                onClick={handleReset}
              >
                ✕ 초기화
              </button>
            )}
            <button
              style={{ ...styles.actionButton, ...styles.btnSearch }}
              onClick={handleSearch}
            >
              검색
            </button>
          </div>
        </div>

        {/* Hiển thị đang tìm kiếm theo từ khóa nào */}
        {activeKeyword && (
          <p style={styles.searchHint}>
            🔎 <strong>"{activeKeyword}"</strong> 검색 결과
          </p>
        )}

        {/* CONTENT AREA */}
        <div style={styles.contentArea}>
          {loading && <p style={styles.statusText}>⏳ 불러오는 중...</p>}
          {error && (
            <p style={{ ...styles.statusText, color: "#e74c3c" }}>{error}</p>
          )}

          {!loading && !error && facilities.length === 0 && (
            <p style={styles.statusText}>
              {activeKeyword
                ? `"${activeKeyword}"에 대한 검색 결과가 없습니다.`
                : "등록된 시설이 없습니다."}
            </p>
          )}

          {!loading && !error && facilities.length > 0 && (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>시설 유형</th>
                      <th style={styles.th}>이름</th>
                      <th style={styles.th}>주소</th>
                      <th style={styles.th}>상태</th>
                      <th style={styles.th}>비고</th>
                      <th style={styles.th}>활성</th>
                      <th style={styles.th}>등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities.map((facility, idx) => {
                      const info = facility.facilityInfo || {};
                      const approval = facility.approvalStatus || {};
                      return (
                        <tr
                          key={facility.id}
                          style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                          onClick={() =>
                            navigate(`/facility-details/${facility.id}`)
                          }
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#eef4fb")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              idx % 2 === 0 ? "#fff" : "#fafbfc")
                          }
                        >
                          <td style={styles.td}>{facility.id}</td>
                          <td style={styles.td}>
                            {getTypeLabel(facility.facilityType)}
                          </td>
                          <td style={styles.td}>{info.name || "-"}</td>
                          <td style={styles.td}>{info.address || "-"}</td>
                          <td style={styles.td}>
                            {getStatusBadge(approval.status)}
                          </td>
                          <td style={styles.td}>{approval.note || "-"}</td>
                          <td style={styles.td}>
                            <span
                              style={{
                                color: info.active ? "#2ecc71" : "#e74c3c",
                              }}
                            >
                              {info.active ? "✅" : "❌"}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {info.createdAt
                              ? new Date(info.createdAt).toLocaleDateString(
                                  "ko-KR",
                                )
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div style={styles.pagination}>
                <button
                  style={styles.pageBtn}
                  disabled={pageInfo.page === 0}
                  onClick={() =>
                    loadFacilities(pageInfo.page - 1, activeKeyword)
                  }
                >
                  ◀ 이전
                </button>
                <span style={styles.pageInfo}>페이지 {pageInfo.page + 1}</span>
                <button
                  style={styles.pageBtn}
                  disabled={!pageInfo.hasNext}
                  onClick={() =>
                    loadFacilities(pageInfo.page + 1, activeKeyword)
                  }
                >
                  다음 ▶
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: "15px 30px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    borderBottom: "1px solid #eaeaea",
    display: "flex",
    alignItems: "center",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "20px" },
  backButton: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  pageTitle: { fontSize: "22px", color: "#2c3e50", margin: 0 },
  mainContent: { padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px",
  },
  actionLeft: { display: "flex", gap: "15px", flexWrap: "wrap" },
  searchBox: { display: "flex", gap: "8px", alignItems: "center" },
  searchInput: {
    padding: "9px 14px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    outline: "none",
    width: "220px",
  },
  searchHint: {
    fontSize: "14px",
    color: "#7f8c8d",
    marginBottom: "12px",
    marginTop: "-10px",
  },
  actionButton: {
    padding: "10px 20px",
    fontSize: "15px",
    fontWeight: "600",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  icon: { marginRight: "8px", fontSize: "16px" },
  btnPrimary: { backgroundColor: "#3498db", color: "#fff" },
  btnInfo: { backgroundColor: "#2ecc71", color: "#fff" },
  btnSearch: { backgroundColor: "#8e44ad", color: "#fff" },
  btnReset: {
    backgroundColor: "#fff",
    color: "#7f8c8d",
    border: "1px solid #ddd",
    boxShadow: "none",
  },
  contentArea: {
    backgroundColor: "#fff",
    padding: "24px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
    minHeight: "400px",
  },
  statusText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: "80px",
    fontSize: "16px",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "14px" },
  theadRow: { backgroundColor: "#f0f3f8" },
  th: {
    padding: "12px 14px",
    textAlign: "center",
    fontWeight: "700",
    color: "#2c3e50",
    borderBottom: "2px solid #dde3ed",
    whiteSpace: "nowrap",
  },
  td: {
    textAlign: "center",
    padding: "11px 14px",
    borderBottom: "1px solid #eaeaea",
    color: "#34495e",
    verticalAlign: "middle",
  },
  trEven: { backgroundColor: "#fff", cursor: "pointer" },
  trOdd: { backgroundColor: "#fafbfc", cursor: "pointer" },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "24px",
  },
  pageBtn: {
    padding: "8px 18px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  },
  pageInfo: { fontSize: "14px", color: "#7f8c8d" },
};

export default FacilityPage;
