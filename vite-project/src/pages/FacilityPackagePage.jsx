import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchFacilityPackagesApi,
  updateFacilityPackageStatusApi,
} from "../api/facilityPackageApi";
import AddPackageModal from "./AddPackageModal";

// ── Config theo từng loại ──
const TYPE_CONFIG = {
  SPORT: {
    icon: "⚽",
    label: "스포츠",
    color: "#667eea",
    gradient: "linear-gradient(135deg,#667eea,#764ba2)",
    shadow: "rgba(102,126,234,0.35)",
    lightBg: "#f0f1ff",
  },
  MOTEL: {
    icon: "🏨",
    label: "모텔",
    color: "#f7971e",
    gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
    shadow: "rgba(247,151,30,0.35)",
    lightBg: "#fff8ee",
  },
  RESTAURANT: {
    icon: "🍽️",
    label: "음식점",
    color: "#11998e",
    gradient: "linear-gradient(135deg,#11998e,#38ef7d)",
    shadow: "rgba(17,153,142,0.35)",
    lightBg: "#edfaf6",
  },
};

// ── Render thông tin riêng theo packageTarget ──
function PackageTargetInfo({ target, facilityType }) {
  if (!target) return null;
  const cfg = TYPE_CONFIG[facilityType] || TYPE_CONFIG.SPORT;

  switch (target.__typename) {
    case "SportPackage":
      return (
        <div style={styles.targetRow}>
          <div
            style={{
              ...styles.targetBadge,
              background: cfg.lightBg,
              color: cfg.color,
            }}
          >
            ⏰ {target.startTime || "-"} ~ {target.endTime || "-"}
          </div>
        </div>
      );
    case "MotelPackage":
      return (
        <div style={styles.targetRow}>
          <div
            style={{
              ...styles.targetBadge,
              background: cfg.lightBg,
              color: cfg.color,
            }}
          >
            {target.pricingType === "HOURLY" ? "🕐 시간제" : "🌙 1박"}
          </div>
          <div
            style={{
              ...styles.targetBadge,
              background: cfg.lightBg,
              color: cfg.color,
            }}
          >
            IN {target.checkIn || "-"}
          </div>
          <div
            style={{
              ...styles.targetBadge,
              background: cfg.lightBg,
              color: cfg.color,
            }}
          >
            OUT {target.checkOut || "-"}
          </div>
        </div>
      );
    case "RestaurantPackage":
      return (
        <div style={styles.targetRow}>
          <div
            style={{
              ...styles.targetBadge,
              background: cfg.lightBg,
              color: cfg.color,
            }}
          >
            👥 최대 {target.maxCapacity || "-"}명
          </div>
        </div>
      );
    default:
      return null;
  }
}

// ── Toggle Switch ──
function ToggleSwitch({ active, loading, onChange }) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      title={active ? "비활성화하기" : "활성화하기"}
      style={{
        ...styles.toggle,
        background: loading
          ? "#e2e6ee"
          : active
            ? "linear-gradient(135deg,#11998e,#38ef7d)"
            : "#dde1ea",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <span
        style={{
          ...styles.toggleThumb,
          transform: active ? "translateX(18px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

// ── Package Card ──
function PackageCard({ pkg, facilityType, onStatusChange }) {
  const info = pkg.infoDetails || {};
  const cfg = TYPE_CONFIG[facilityType] || TYPE_CONFIG.SPORT;
  const hasSale = info.salePrice && Number(info.salePrice) < Number(info.price);

  const [active, setActive] = useState(!!info.active);
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState(null);

  const handleToggle = async () => {
    const nextAct = active ? "INACTIVE" : "ACTIVE";
    setToggling(true);
    setToggleError(null);
    try {
      await updateFacilityPackageStatusApi(pkg.id, nextAct);
      setActive(!active);
      onStatusChange?.();
    } catch (e) {
      setToggleError(e.message || "상태 변경 실패");
      // auto-clear error after 3s
      setTimeout(() => setToggleError(null), 3000);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      style={{
        ...styles.card,
        opacity: active ? 1 : 0.75,
      }}
    >
      {/* Header strip */}
      <div style={{ ...styles.cardStrip, background: cfg.gradient }} />

      {/* Top row: active toggle + id */}
      <div style={styles.cardTopRow}>
        {/* Left: toggle + label */}
        <div style={styles.toggleRow}>
          <ToggleSwitch
            active={active}
            loading={toggling}
            onChange={handleToggle}
          />
          <span
            style={{
              ...styles.activeLabel,
              color: active ? "#11998e" : "#b2bec3",
            }}
          >
            {toggling ? "변경 중…" : active ? "활성" : "비활성"}
          </span>
        </div>
        <span style={styles.packageId}>#{pkg.id}</span>
      </div>

      {/* Toggle error */}
      {toggleError && <div style={styles.toggleError}>⚠️ {toggleError}</div>}

      {/* Package Name */}
      <div style={styles.packageName}>{info.packageName || "-"}</div>

      {/* Target info */}
      <PackageTargetInfo
        target={pkg.packageTarget}
        facilityType={facilityType}
      />

      {/* Price */}
      <div style={styles.priceRow}>
        {hasSale ? (
          <>
            <span style={styles.originalPrice}>
              {Number(info.price).toLocaleString()}원
            </span>
            <span style={{ ...styles.salePrice, color: cfg.color }}>
              {Number(info.salePrice).toLocaleString()}원
            </span>
            <span
              style={{
                ...styles.discountBadge,
                background: cfg.lightBg,
                color: cfg.color,
              }}
            >
              {Math.round((1 - info.salePrice / info.price) * 100)}% 할인
            </span>
          </>
        ) : (
          <span style={{ ...styles.salePrice, color: cfg.color }}>
            {Number(info.price).toLocaleString()}원
          </span>
        )}
      </div>

      {/* Count + Note */}
      <div style={styles.metaRow}>
        <span style={styles.metaItem}>🎟️ {info.totalCount ?? "-"}회</span>
        {info.note && (
          <span style={styles.metaItem} title={info.note}>
            📝{" "}
            {info.note.length > 20 ? info.note.slice(0, 20) + "…" : info.note}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──
function FacilityPackagePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 6,
    hasNext: false,
  });
  const [facilityType, setFacilityType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("package-sport")) setFacilityType("SPORT");
    else if (path.includes("package-motel")) setFacilityType("MOTEL");
    else if (path.includes("package-restaurant")) setFacilityType("RESTAURANT");
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    else navigate("/");
  }, [navigate]);

  const loadPackages = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFacilityPackagesApi(id, currentPage, 6);
      setPackages(data.data || []);
      setPageInfo(data.pageInfo || {});
      if (!facilityType && data.data?.length > 0) {
        setFacilityType(data.data[0].facilityType);
      }
    } catch {
      setError("패키지 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [id, currentPage]);

  if (!user) return null;

  const cfg = TYPE_CONFIG[facilityType] || TYPE_CONFIG.SPORT;

  return (
    <div style={styles.layout}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            style={styles.backButton}
            onClick={() => navigate(`/facility-details/${id}`)}
          >
            ⬅ 돌아가기
          </button>
          <div>
            <h1 style={styles.pageTitle}>
              {cfg.icon} {cfg.label} 패키지 관리
            </h1>
          </div>
        </div>
        <button
          style={{
            ...styles.addBtn,
            background: cfg.gradient,
            boxShadow: `0 3px 10px ${cfg.shadow}`,
          }}
          onClick={() => setShowAddModal(true)}
        >
          ➕ 패키지 추가
        </button>
      </header>

      <main style={styles.mainContent}>
        {loading && <p style={styles.statusText}>⏳ 불러오는 중...</p>}
        {error && (
          <p style={{ ...styles.statusText, color: "#e74c3c" }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            {/* Summary bar */}
            <div style={styles.summaryBar}>
              <div
                style={{
                  ...styles.summaryBadge,
                  background: cfg.gradient,
                  boxShadow: `0 3px 10px ${cfg.shadow}`,
                }}
              >
                {cfg.icon} {cfg.label}
              </div>
              <span style={styles.summaryText}>
                총 <strong>{packages.length}</strong>개 패키지
              </span>
            </div>

            {/* Grid */}
            {packages.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={styles.emptyIcon}>📦</p>
                <p style={styles.emptyText}>등록된 패키지가 없습니다.</p>
              </div>
            ) : (
              <div style={styles.grid}>
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    facilityType={facilityType || pkg.facilityType}
                    onStatusChange={loadPackages}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {(currentPage > 0 || pageInfo.hasNext) && (
              <div style={styles.pagination}>
                <button
                  style={{
                    ...styles.pageBtn,
                    opacity: currentPage === 0 ? 0.4 : 1,
                    cursor: currentPage === 0 ? "not-allowed" : "pointer",
                  }}
                  onClick={() =>
                    currentPage > 0 && setCurrentPage((p) => p - 1)
                  }
                  disabled={currentPage === 0}
                >
                  ◀ 이전
                </button>
                <span style={styles.pageNum}>페이지 {currentPage + 1}</span>
                <button
                  style={{
                    ...styles.pageBtn,
                    opacity: !pageInfo.hasNext ? 0.4 : 1,
                    cursor: !pageInfo.hasNext ? "not-allowed" : "pointer",
                    background: cfg.gradient,
                    color: "#fff",
                    border: "none",
                  }}
                  onClick={() =>
                    pageInfo.hasNext && setCurrentPage((p) => p + 1)
                  }
                  disabled={!pageInfo.hasNext}
                >
                  다음 ▶
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showAddModal && (
        <AddPackageModal
          facilityId={id}
          facilityType={facilityType}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setCurrentPage(0);
            loadPackages();
          }}
        />
      )}
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
  pageTitle: { fontSize: "20px", color: "#2c3e50", margin: 0 },
  addBtn: {
    padding: "9px 20px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  mainContent: { padding: "30px", maxWidth: "1100px", margin: "0 auto" },
  statusText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: "80px",
    fontSize: "16px",
  },
  summaryBar: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "22px",
  },
  summaryBadge: {
    padding: "6px 16px",
    borderRadius: "999px",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
  },
  summaryText: { fontSize: "14px", color: "#7f8c8d" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },

  // ── Card ──
  card: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    transition: "opacity .25s",
  },
  cardStrip: { height: "5px", width: "100%" },
  cardTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px 0",
  },

  // ── Toggle ──
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  toggle: {
    width: "40px",
    height: "22px",
    borderRadius: "999px",
    border: "none",
    position: "relative",
    padding: 0,
    flexShrink: 0,
    transition: "background .2s",
  },
  toggleThumb: {
    position: "absolute",
    top: "3px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
    transition: "transform .2s",
    display: "block",
  },
  activeLabel: {
    fontSize: "12px",
    fontWeight: "700",
    transition: "color .2s",
  },
  toggleError: {
    margin: "6px 16px 0",
    padding: "6px 10px",
    background: "#fff5f5",
    border: "1px solid #f5c6cb",
    borderRadius: "7px",
    fontSize: "11.5px",
    color: "#e74c3c",
  },

  packageId: { fontSize: "11px", color: "#b2bec3", fontWeight: "600" },
  packageName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2c3e50",
    padding: "10px 16px 6px",
  },
  targetRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    padding: "0 16px 10px",
  },
  targetBadge: {
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    borderTop: "1px solid #f0f2f7",
  },
  originalPrice: {
    fontSize: "13px",
    color: "#b2bec3",
    textDecoration: "line-through",
  },
  salePrice: { fontSize: "18px", fontWeight: "700" },
  discountBadge: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "5px",
  },
  metaRow: {
    display: "flex",
    gap: "12px",
    padding: "10px 16px 14px",
    flexWrap: "wrap",
  },
  metaItem: { fontSize: "12px", color: "#7f8c8d" },

  // Empty
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: "14px",
    padding: "60px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  emptyIcon: { fontSize: "40px", margin: "0 0 12px" },
  emptyText: { color: "#aaa", fontSize: "15px" },

  // Pagination
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "16px",
    marginTop: "32px",
  },
  pageBtn: {
    padding: "9px 22px",
    borderRadius: "8px",
    border: "1.5px solid #e2e6ee",
    background: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    fontFamily: "inherit",
    color: "#2c3e50",
  },
  pageNum: { fontSize: "14px", color: "#7f8c8d", fontWeight: "600" },
};

export default FacilityPackagePage;
