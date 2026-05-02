import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFacilityDetailApi } from "../api/facilityApi";

function FacilityDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);

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
        const data = await fetchFacilityDetailApi(id);
        setFacility(data);
      } catch (err) {
        setError("시설 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const getStatusStyle = (status) => {
    const map = {
      APPROVED: { label: "승인됨", color: "#2ecc71" },
      PENDING: { label: "대기중", color: "#f39c12" },
      REJECTED: { label: "거절됨", color: "#e74c3c" },
    };
    return map[status] || { label: status || "-", color: "#95a5a6" };
  };

  const renderTargetInfo = (target) => {
    if (!target) return <span style={styles.emptyText}>정보 없음</span>;
    switch (target.__typename) {
      case "Sport":
        return (
          <div style={styles.infoGrid}>
            <InfoItem label="유형" value="⚽ 스포츠" />
            <InfoItem
              label="시간당 가격"
              value={`${target.hourPrice?.toLocaleString()}원`}
            />
          </div>
        );
      case "Motel":
        return (
          <div style={styles.infoGrid}>
            <InfoItem label="유형" value="🏨 모텔" />
            <InfoItem
              label="시간당 가격"
              value={`${target.hourPrice?.toLocaleString()}원`}
            />
            <InfoItem
              label="1박 가격"
              value={`${target.nightPrice?.toLocaleString()}원`}
            />
          </div>
        );
      case "Restaurant":
        return (
          <div style={styles.infoGrid}>
            <InfoItem label="유형" value="🍽️ 음식점" />
            <InfoItem label="음식 종류" value={target.foodType} />
          </div>
        );
      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <div style={styles.layout}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            style={styles.backButton}
            onClick={() => navigate("/facilities")}
          >
            ⬅ 목록으로
          </button>
          <h1 style={styles.pageTitle}>📋 시설 상세 정보</h1>
        </div>
        {facility && (
          <button
            style={styles.editButton}
            onClick={() => navigate(`/facility-edit/${id}`)}
          >
            ✏️ 수정하기
          </button>
        )}
      </header>

      <main style={styles.mainContent}>
        {loading && <p style={styles.statusText}>⏳ 불러오는 중...</p>}
        {error && (
          <p style={{ ...styles.statusText, color: "#e74c3c" }}>{error}</p>
        )}

        {!loading &&
          !error &&
          facility &&
          (() => {
            const info = facility.facilityInfo || {};

            return (
              <div style={styles.contentWrapper}>
                {/* LEFT COLUMN - chỉ còn card ảnh */}
                <div style={styles.leftCol}>
                  <div style={styles.card}>
                    {facility.imageUrls && facility.imageUrls.length > 0 ? (
                      <>
                        <img
                          src={facility.imageUrls[selectedImg]}
                          alt="main"
                          style={styles.mainImage}
                        />
                        {facility.imageUrls.length > 1 && (
                          <div style={styles.thumbRow}>
                            {facility.imageUrls.map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`thumb-${idx}`}
                                style={{
                                  ...styles.thumb,
                                  border:
                                    selectedImg === idx
                                      ? "2px solid #3498db"
                                      : "2px solid transparent",
                                }}
                                onClick={() => setSelectedImg(idx)}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={styles.noImage}>🖼️ 이미지 없음</div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div style={styles.rightCol}>
                  {/* ── THÔNG TIN CƠ BẢN ── */}
                  <div style={styles.card}>
                    <div style={styles.cardTitleRow}>
                      <h2 style={styles.cardTitle}>🏢 기본 정보</h2>
                      <div style={styles.tagRow}>
                        <span
                          style={{
                            ...styles.tag,
                            color: info.active ? "#2ecc71" : "#e74c3c",
                          }}
                        >
                          ● {info.active ? "영업 가능" : "영업 불가"}
                        </span>
                        <span
                          style={{
                            ...styles.tag,
                            color: info.carPark ? "#2ecc71" : "#e74c3c",
                          }}
                        >
                          🚗 {info.carPark ? "주차 가능" : "주차 불가"}
                        </span>
                        <span
                          style={{
                            ...styles.tag,
                            color: info.hasWifi ? "#2ecc71" : "#e74c3c",
                          }}
                        >
                          📶 {info.hasWifi ? "WiFi 가능" : "WiFi 불가"}
                        </span>
                      </div>
                    </div>
                    <div style={styles.infoGrid}>
                      <InfoItem label="시설명" value={info.name} />
                      <InfoItem label="유형" value={facility.facilityType} />
                      <InfoItem label="주소" value={info.address} span />
                      <InfoItem
                        label="등록일"
                        value={
                          info.createdAt
                            ? new Date(info.createdAt).toLocaleDateString(
                                "ko-KR",
                              )
                            : "-"
                        }
                      />
                      <InfoItem
                        label="수정일"
                        value={
                          info.updatedAt
                            ? new Date(info.updatedAt).toLocaleDateString(
                                "ko-KR",
                              )
                            : "-"
                        }
                      />
                    </div>

                    {info.description && (
                      <div style={styles.descBox}>
                        <span style={styles.noteLabel}>📝 시설 설명</span>
                        <p style={styles.descText}>{info.description}</p>
                      </div>
                    )}

                    {info.instruction && (
                      <div
                        style={{
                          ...styles.descBox,
                          backgroundColor: "#f0f8ff",
                        }}
                      >
                        <span style={styles.noteLabel}>🗺️ 찾아오는 방법</span>
                        <p style={styles.descText}>{info.instruction}</p>
                      </div>
                    )}
                  </div>

                  {/* ── THÔNG TIN DỊCH VỤ ── */}
                  <div style={styles.card}>
                    <h2 style={styles.cardTitle}>💰 서비스 정보</h2>
                    {renderTargetInfo(facility.facilityTarget)}
                  </div>

                  {/* ── ĐÁNH GIÁ (placeholder) ── */}
                  <div style={styles.card}>
                    <h2 style={styles.cardTitle}>⭐ 이용 후기</h2>
                    <div style={styles.reviewPlaceholder}>
                      <p style={styles.emptyText}>
                        아직 등록된 후기가 없습니다.
                      </p>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#bbb",
                          marginTop: "6px",
                        }}
                      >
                        리뷰 기능은 추후 업데이트될 예정입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </main>
    </div>
  );
}

// ── Helper component ──
function InfoItem({ label, value, span }) {
  return (
    <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
      <span style={itemStyles.label}>{label}</span>
      <span style={itemStyles.value}>{value || "-"}</span>
    </div>
  );
}

const itemStyles = {
  label: {
    display: "block",
    fontSize: "11px",
    color: "#95a5a6",
    marginBottom: "3px",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  value: { fontSize: "14px", color: "#2c3e50", fontWeight: "500" },
};

const styles = {
  layout: {
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    backgroundColor: "#fff",
    padding: "15px 30px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    borderBottom: "1px solid #eaeaea",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "20px" },
  backButton: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  pageTitle: { fontSize: "22px", color: "#2c3e50", margin: 0 },
  editButton: {
    padding: "9px 22px",
    borderRadius: "7px",
    border: "none",
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(52,152,219,0.35)",
  },
  mainContent: { padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  statusText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: "80px",
    fontSize: "16px",
  },
  contentWrapper: { display: "flex", gap: "24px", alignItems: "flex-start" },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "300px",
    flexShrink: 0,
  },
  rightCol: { display: "flex", flexDirection: "column", gap: "20px", flex: 1 },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    padding: "24px",
  },
  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "16px",
    marginTop: 0,
  },
  cardTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  tagRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  tag: { fontSize: "12px", fontWeight: "600", color: "#7f8c8d" },
  mainImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "10px",
  },
  thumbRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  thumb: {
    width: "56px",
    height: "56px",
    objectFit: "cover",
    borderRadius: "6px",
    cursor: "pointer",
  },
  noImage: {
    height: "160px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ccc",
    fontSize: "16px",
    backgroundColor: "#fafbfc",
    borderRadius: "8px",
  },
  badge: {
    display: "inline-block",
    padding: "4px 12px",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
  },
  noteBox: {
    backgroundColor: "#fafbfc",
    borderRadius: "8px",
    padding: "12px 14px",
    borderLeft: "3px solid #dde3ed",
  },
  noteLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#95a5a6",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "6px",
  },
  noteText: { margin: 0, fontSize: "14px", color: "#555" },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  descBox: {
    backgroundColor: "#fafbfc",
    borderRadius: "8px",
    padding: "12px 14px",
    marginTop: "8px",
  },
  descText: { margin: 0, fontSize: "14px", color: "#555", lineHeight: "1.6" },
  emptyText: { color: "#aaa", fontSize: "14px", textAlign: "center" },
  reviewPlaceholder: {
    minHeight: "100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
};

export default FacilityDetailsPage;
