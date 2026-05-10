import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchFacilityRegistrationListApi } from "../api/facilityApi";

const STATUS_TABS = [
  { key: "PENDING", label: "⏳ 대기중" },
  { key: "APPROVED", label: "✅ 승인됨" },
  { key: "REJECTED", label: "❌ 거절됨" },
];

function RegistrationRequestPage() {
  const [user, setUser] = useState(null);
  const [activeStatus, setActiveStatus] = useState("PENDING");
  const [facilities, setFacilities] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 5,
    hasNext: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const loadList = useCallback(
    async (status, page = 0) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFacilityRegistrationListApi(
          status,
          page,
          pageInfo.size,
        );
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
    if (user) loadList(activeStatus, 0);
  }, [user, activeStatus]);

  const handleTabChange = (status) => {
    setActiveStatus(status);
    setFacilities([]);
  };

  const getTypeLabel = (type) => {
    const map = {
      Sport: "⚽ 스포츠",
      Motel: "🏨 모텔",
      Restaurant: "🍽️ 음식점",
    };
    return map[type] || type;
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
          <h1 style={styles.pageTitle}>📋 시설 등록 요청 관리</h1>
        </div>
      </header>

      <main style={styles.mainContent}>
        {/* STATUS TABS */}
        <div style={styles.tabBar}>
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              style={{
                ...styles.tabBtn,
                ...(activeStatus === tab.key ? styles.tabBtnActive : {}),
              }}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={styles.contentArea}>
          {loading && <p style={styles.statusText}>⏳ 불러오는 중...</p>}
          {error && (
            <p style={{ ...styles.statusText, color: "#e74c3c" }}>{error}</p>
          )}

          {!loading && !error && facilities.length === 0 && (
            <p style={styles.statusText}>해당 상태의 요청이 없습니다.</p>
          )}

          {!loading && !error && facilities.length > 0 && (
            <>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.theadRow}>
                      <th style={styles.th}>ID</th>
                      <th style={styles.th}>시설 유형</th>
                      <th style={styles.th}>시설명</th>
                      <th style={styles.th}>주소</th>
                      <th style={styles.th}>소유자</th>
                      <th style={styles.th}>전화번호</th>
                      <th style={styles.th}>이메일</th>
                      <th style={styles.th}>등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities.map((facility, idx) => {
                      const info = facility.facilityInfo || {};
                      const owner = facility.owner || {};
                      const ownerInfo = owner.infoDetails || {};
                      return (
                        <tr
                          key={facility.facilityRegistrationId}
                          style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                          onClick={() =>
                            navigate(
                              // ✅ Dùng facilityRegistrationId để navigate đến detail
                              `/registration-requests/details/${facility.facilityRegistrationId}`,
                            )
                          }
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#eef4fb")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              idx % 2 === 0 ? "#fff" : "#fafbfc")
                          }
                        >
                          {/* Hiển thị facilityRegistrationId ở cột ID */}
                          <td style={styles.td}>
                            {facility.facilityRegistrationId}
                          </td>
                          <td style={styles.td}>
                            {getTypeLabel(facility.facilityType)}
                          </td>
                          <td style={styles.td}>{info.name || "-"}</td>
                          <td style={styles.td}>{info.address || "-"}</td>
                          <td style={styles.td}>
                            <div style={styles.ownerCell}>
                              {ownerInfo.avatarUrl ? (
                                <img
                                  src={ownerInfo.avatarUrl}
                                  alt={ownerInfo.fullName}
                                  style={styles.avatar}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div style={styles.avatarFallback}>
                                  {ownerInfo.fullName
                                    ? ownerInfo.fullName.charAt(0).toUpperCase()
                                    : "?"}
                                </div>
                              )}
                              <span>{ownerInfo.fullName || "-"}</span>
                            </div>
                          </td>
                          <td style={styles.td}>{ownerInfo.phone || "-"}</td>
                          <td style={styles.td}>{ownerInfo.email || "-"}</td>
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
                  onClick={() => loadList(activeStatus, pageInfo.page - 1)}
                >
                  ◀ 이전
                </button>
                <span style={styles.pageInfo}>페이지 {pageInfo.page + 1}</span>
                <button
                  style={styles.pageBtn}
                  disabled={!pageInfo.hasNext}
                  onClick={() => loadList(activeStatus, pageInfo.page + 1)}
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
  tabBar: { display: "flex", gap: "10px", marginBottom: "24px" },
  tabBtn: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "600",
    borderRadius: "6px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#7f8c8d",
    transition: "all 0.2s",
  },
  tabBtnActive: {
    backgroundColor: "#3498db",
    color: "#fff",
    border: "1px solid #3498db",
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
  ownerCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #ddd",
    flexShrink: 0,
  },
  avatarFallback: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#3498db",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    flexShrink: 0,
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

export default RegistrationRequestPage;
