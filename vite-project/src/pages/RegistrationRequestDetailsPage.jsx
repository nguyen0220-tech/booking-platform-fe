import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFacilityRegistrationDetailApi } from "../api/facilityApi";

const Field = ({ label, value }) => (
  <div style={styles.field}>
    <span style={styles.fieldLabel}>{label}</span>
    <span style={styles.fieldValue}>
      {value ?? <em style={styles.empty}>-</em>}
    </span>
  </div>
);

const getStatusBadge = (status) => {
  const map = {
    PENDING: { label: "⏳ 접수중", color: "#f39c12" },
    APPROVED: { label: "✅ 승인됨", color: "#2ecc71" },
    REJECTED: { label: "❌ 거절됨", color: "#e74c3c" },
  };
  const s = map[status] || { label: status || "-", color: "#95a5a6" };
  return (
    <span style={{ ...styles.badge, backgroundColor: s.color }}>{s.label}</span>
  );
};

const fmtDate = (str) =>
  str ? new Date(str).toLocaleDateString("ko-KR") : null;

const RenderTarget = ({ t }) => {
  if (!t) return null;
  if (t.__typename === "Sport") {
    return (
      <Field
        label="시간 요금"
        value={t.hourPrice != null ? `${t.hourPrice.toLocaleString()}원` : null}
      />
    );
  }
  if (t.__typename === "Motel") {
    return (
      <>
        <Field
          label="시간 요금"
          value={
            t.hourPrice != null ? `${t.hourPrice.toLocaleString()}원` : null
          }
        />
        <Field
          label="1박 요금"
          value={
            t.nightPrice != null ? `${t.nightPrice.toLocaleString()}원` : null
          }
        />
      </>
    );
  }
  if (t.__typename === "Restaurant") {
    return <Field label="음식 유형" value={t.foodType} />;
  }
  return null;
};

function RegistrationRequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    else navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFacilityRegistrationDetailApi(id);
        setData(result);
      } catch (err) {
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, id]);

  if (!user) return null;

  // ✅ Mapping đúng theo query GraphQL
  const status = data?.status ?? null; // facilityRegistration.status
  const note = data?.note ?? null; // facilityRegistration.note
  const facility = data?.facility || {};
  const info = facility.facilityInfo || {};
  const owner = facility.owner || {};
  const ownerInfo = owner.infoDetails || {};
  const target = facility.facilityTarget || null;
  const lastUpdateAt = data?.lastUpdateAt ?? null; // facilityRegistration.lastUpdateAt
  const reviewer = data?.reviewer || {}; // facilityRegistration.reviewer
  const reviewerInfo = reviewer.infoDetails || {}; // chỉ có fullName, avatarUrl

  const isPending = status === "PENDING";

  const handleApprove = () => {
    // TODO: gọi API approve
    console.log("Approve facility registration:", id);
  };

  const handleReject = () => {
    // TODO: gọi API reject
    console.log("Reject facility registration:", id);
  };

  return (
    <div style={styles.layout}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button
            style={styles.backButton}
            onClick={() => navigate("/registration-requests")}
          >
            ⬅ 목록으로
          </button>
          <h1 style={styles.pageTitle}>📄 등록 요청 상세</h1>
          <span style={styles.idBadge}>ID: {id}</span>
        </div>
        {!loading && !error && isPending && (
          <div style={styles.headerActions}>
            <button
              style={{ ...styles.actionBtn, ...styles.btnReject }}
              onClick={handleReject}
            >
              ❌ 거절
            </button>
            <button
              style={{ ...styles.actionBtn, ...styles.btnApprove }}
              onClick={handleApprove}
            >
              ✅ 승인
            </button>
          </div>
        )}
      </header>

      <main style={styles.mainContent}>
        {loading && <p style={styles.statusText}>⏳ 불러오는 중...</p>}
        {error && (
          <p style={{ ...styles.statusText, color: "#e74c3c" }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            <div style={styles.topRow}>
              {/* OWNER CARD */}
              <section style={styles.card}>
                <h2 style={styles.cardTitle}>👤 소유자 정보</h2>
                <div style={styles.avatarRow}>
                  {ownerInfo.avatarUrl ? (
                    <img
                      src={ownerInfo.avatarUrl}
                      alt="avatar"
                      style={styles.avatar}
                    />
                  ) : (
                    <div style={styles.avatarFallback}>
                      {ownerInfo.fullName
                        ? ownerInfo.fullName.charAt(0).toUpperCase()
                        : "?"}
                    </div>
                  )}
                  <span style={styles.ownerName}>
                    {ownerInfo.fullName || "-"}
                  </span>
                </div>
                <div style={styles.divider} />
                <Field label="ID" value={owner.id} />
                <Field label="이메일" value={ownerInfo.email} />
                <Field label="전화번호" value={ownerInfo.phone} />
                <Field label="가입일" value={fmtDate(ownerInfo.createdAt)} />
              </section>

              {/* REVIEWER CARD */}
              <section style={styles.card}>
                <h2 style={styles.cardTitle}>🛡️ 검토자 정보</h2>
                <div style={styles.avatarRow}>
                  {reviewerInfo.avatarUrl ? (
                    <img
                      src={reviewerInfo.avatarUrl}
                      alt="reviewer"
                      style={styles.avatar}
                    />
                  ) : (
                    <div
                      style={{
                        ...styles.avatarFallback,
                        backgroundColor: "#8e44ad",
                      }}
                    >
                      {reviewerInfo.fullName
                        ? reviewerInfo.fullName.charAt(0).toUpperCase()
                        : "A"}
                    </div>
                  )}
                  <span style={styles.ownerName}>
                    {reviewerInfo.fullName || "-"}
                  </span>
                </div>
                <div style={styles.divider} />
                {/* ✅ status và note từ facilityRegistration (không phải approvalStatus) */}
                <Field
                  label="검토 결과"
                  value={status ? getStatusBadge(status) : null}
                />
                <Field label="메모" value={note} />
                <Field label="검토일" value={fmtDate(lastUpdateAt)} />
              </section>
            </div>

            {/* FACILITY CARD */}
            <section style={{ ...styles.card, marginTop: "24px" }}>
              <h2 style={styles.cardTitle}>🏢 시설 등록 정보</h2>
              <div style={styles.divider} />
              <div style={styles.facilityGrid}>
                <Field label="시설 유형" value={facility.facilityType} />
                <Field label="시설명" value={info.name} />
                <Field label="주소" value={info.address} />
                <Field label="등록일" value={fmtDate(info.createdAt)} />
                <Field label="수정일" value={fmtDate(info.updatedAt)} />
                <Field
                  label="주차 가능"
                  value={
                    info.carPark != null
                      ? info.carPark
                        ? "✅ 가능"
                        : "❌ 불가"
                      : null
                  }
                />
                <Field
                  label="Wi-Fi"
                  value={
                    info.hasWifi != null
                      ? info.hasWifi
                        ? "✅ 있음"
                        : "❌ 없음"
                      : null
                  }
                />
                <Field
                  label="활성 상태"
                  value={
                    info.active != null
                      ? info.active
                        ? "✅ 활성"
                        : "❌ 비활성"
                      : null
                  }
                />
                <Field
                  label="정지 여부"
                  value={
                    info.isSuspended != null
                      ? info.isSuspended
                        ? "🚫 정지됨"
                        : "✅ 정상"
                      : null
                  }
                />
              </div>

              <div style={{ marginTop: "16px" }}>
                <Field label="설명" value={info.description} />
                <Field label="이용 안내" value={info.instruction} />
              </div>

              {target && (
                <>
                  <div style={styles.divider} />
                  <h3 style={styles.subTitle}>
                    📌 시설 타겟 정보 ({target.__typename})
                  </h3>
                  <RenderTarget t={target} />
                </>
              )}
            </section>
          </>
        )}
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
    backgroundColor: "#fff",
    padding: "15px 30px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    borderBottom: "1px solid #eaeaea",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "16px" },
  headerActions: { display: "flex", gap: "12px" },
  backButton: {
    padding: "8px 12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "14px",
  },
  pageTitle: { fontSize: "22px", color: "#2c3e50", margin: 0 },
  idBadge: {
    fontSize: "13px",
    color: "#7f8c8d",
    backgroundColor: "#f0f3f8",
    padding: "4px 10px",
    borderRadius: "12px",
    border: "1px solid #dde3ed",
  },
  actionBtn: {
    padding: "9px 22px",
    fontSize: "14px",
    fontWeight: "700",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  btnApprove: { backgroundColor: "#2ecc71", color: "#fff" },
  btnReject: { backgroundColor: "#e74c3c", color: "#fff" },
  mainContent: { padding: "30px", maxWidth: "1100px", margin: "0 auto" },
  statusText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: "80px",
    fontSize: "16px",
  },
  topRow: { display: "flex", gap: "24px" },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "24px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0 0 16px 0",
  },
  subTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "12px 0 8px 0",
  },
  divider: { borderTop: "1px solid #eaeaea", margin: "16px 0" },
  avatarRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #ddd",
  },
  avatarFallback: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#3498db",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "700",
    flexShrink: 0,
  },
  ownerName: { fontSize: "16px", fontWeight: "600", color: "#2c3e50" },
  field: {
    display: "flex",
    alignItems: "flex-start",
    padding: "8px 0",
    borderBottom: "1px solid #f0f3f8",
  },
  fieldLabel: {
    width: "110px",
    flexShrink: 0,
    fontSize: "13px",
    color: "#7f8c8d",
    fontWeight: "600",
  },
  fieldValue: { fontSize: "14px", color: "#34495e", flex: 1 },
  empty: { color: "#bdc3c7", fontStyle: "normal" },
  facilityGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 32px",
  },
  badge: {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "600",
  },
};

export default RegistrationRequestDetailsPage;
