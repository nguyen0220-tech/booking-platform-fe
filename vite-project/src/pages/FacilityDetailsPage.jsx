import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchFacilityDetailApi,
  updateFacilityOptionApi,
  updateFacilityInfoApi,
  uploadImagesApi,
  addFacilityImagesApi,
} from "../api/facilityApi";

function ImageUploadModal({ facilityId, onClose, onSave }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("select"); // "select" | "uploading" | "saving"
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
    setError(null);
  };

  const handleRemove = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (files.length === 0) {
      setError("사진을 1장 이상 선택해주세요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Step 1: upload
      setStep("uploading");
      const imageUrls = await uploadImagesApi(files);
      // Step 2: add to DB
      setStep("saving");
      await addFacilityImagesApi(facilityId, imageUrls);

      onSave(imageUrls);
      onClose();
    } catch (err) {
      setError(err.message || "업로드 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setStep("select");
    }
  };

  const stepLabel = {
    select: "저장하기",
    uploading: "업로드 중...",
    saving: "저장 중...",
  };

  return (
    <div
      style={modalStyles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ ...modalStyles.modal, maxWidth: "500px" }}>
        <button style={modalStyles.closeBtn} onClick={onClose}>
          ✕
        </button>
        <h2 style={modalStyles.title}>🖼️ 시설 사진 추가</h2>

        {/* ── Drop zone / file input ── */}
        <label style={imgModalStyles.dropZone}>
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={loading}
          />
          <span style={imgModalStyles.dropIcon}>📁</span>
          <span style={imgModalStyles.dropText}>
            클릭하여 사진 선택 (여러 장 가능)
          </span>
        </label>

        {/* ── Preview grid ── */}
        {previews.length > 0 && (
          <div style={imgModalStyles.previewGrid}>
            {previews.map((src, idx) => (
              <div key={idx} style={imgModalStyles.previewItem}>
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  style={imgModalStyles.previewImg}
                />
                <button
                  style={imgModalStyles.removeBtn}
                  onClick={() => handleRemove(idx)}
                  disabled={loading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Step indicator ── */}
        {loading && (
          <div style={imgModalStyles.stepIndicator}>
            <span style={{ ...imgModalStyles.stepDot, background: "#667eea" }}>
              1
            </span>
            <span style={imgModalStyles.stepLine} />
            <span
              style={{
                ...imgModalStyles.stepDot,
                background: step === "saving" ? "#667eea" : "#dde1ea",
              }}
            >
              2
            </span>
            <span style={imgModalStyles.stepText}>
              {step === "uploading"
                ? "☁️ 서버에 업로드 중..."
                : "💾 DB에 저장 중..."}
            </span>
          </div>
        )}

        {error && (
          <p
            style={{
              color: "#e74c3c",
              fontSize: "13px",
              marginTop: "10px",
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </p>
        )}

        <div style={modalStyles.footer}>
          <button
            style={modalStyles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            style={{
              ...modalStyles.saveBtn,
              background: loading
                ? "#b2bec3"
                : "linear-gradient(135deg,#3498db,#2980b9)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {stepLabel[step]}
          </button>
        </div>
      </div>
    </div>
  );
}

// styles cho ImageUploadModal
const imgModalStyles = {
  dropZone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "2px dashed #c5cde6",
    borderRadius: "12px",
    padding: "28px 20px",
    cursor: "pointer",
    backgroundColor: "#f8f9fc",
    transition: "border-color .2s",
    marginBottom: "16px",
  },
  dropIcon: { fontSize: "28px" },
  dropText: { fontSize: "13px", color: "#7f8c8d", fontWeight: "500" },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "16px",
  },
  previewItem: {
    position: "relative",
    borderRadius: "8px",
    overflow: "hidden",
  },
  previewImg: {
    width: "100%",
    aspectRatio: "1",
    objectFit: "cover",
    display: "block",
  },
  removeBtn: {
    position: "absolute",
    top: "4px",
    right: "4px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  },
  stepIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "12px 0",
    padding: "10px 14px",
    background: "#f0f4ff",
    borderRadius: "8px",
  },
  stepDot: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepLine: {
    height: "2px",
    width: "20px",
    background: "#dde1ea",
    flexShrink: 0,
  },
  stepText: { fontSize: "12px", color: "#5a6a85", fontWeight: "500" },
};

// ── Modal: Options (active, carPark, hasWifi) ──
function OptionsModal({ facilityId, info, onClose, onSave }) {
  const [active, setActive] = useState(info.active ?? false);
  const [carPark, setCarPark] = useState(info.carPark ?? false);
  const [hasWifi, setHasWifi] = useState(info.hasWifi ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateFacilityOptionApi(facilityId, { active, carPark, hasWifi });
      onSave({ active, carPark, hasWifi });
      onClose();
    } catch (err) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={modalStyles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={modalStyles.modal}>
        <button style={modalStyles.closeBtn} onClick={onClose}>
          ✕
        </button>
        <h2 style={modalStyles.title}>⚙️ 옵션 수정</h2>

        <div style={modalStyles.toggleList}>
          {[
            {
              icon: "🟢",
              label: "영업 가능 (Active)",
              value: active,
              setter: setActive,
            },
            {
              icon: "🚗",
              label: "주차 가능 (Car Park)",
              value: carPark,
              setter: setCarPark,
            },
            {
              icon: "📶",
              label: "WiFi 제공 (Has WiFi)",
              value: hasWifi,
              setter: setHasWifi,
            },
          ].map(({ icon, label, value, setter }) => (
            <div key={label} style={modalStyles.toggleItem}>
              <span style={modalStyles.toggleLabel}>
                {icon} {label}
              </span>
              <div
                style={{
                  ...modalStyles.switchTrack,
                  background: value ? "#667eea" : "#dde1ea",
                }}
                onClick={() => setter(!value)}
              >
                <div
                  style={{
                    ...modalStyles.switchThumb,
                    transform: value ? "translateX(20px)" : "translateX(0)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Error message ── */}
        {error && (
          <p
            style={{
              color: "#e74c3c",
              fontSize: "13px",
              marginTop: "12px",
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </p>
        )}

        <div style={modalStyles.footer}>
          <button
            style={modalStyles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            style={{
              ...modalStyles.saveBtn,
              background: loading
                ? "#b2bec3"
                : "linear-gradient(135deg,#667eea,#764ba2)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: Facility Info (name, address, description, instruction) ──
const FOOD_TYPES = [
  { value: "KOREAN_FOOD", label: "한식" },
  { value: "JAPANESE_FOOD", label: "일식" },
  { value: "CHINESE_FOOD", label: "중식" },
  { value: "VIETNAMESE_FOOD", label: "베트남 음식" },
  { value: "OTHER", label: "기타" },
];

const gradientByType = {
  SPORT: "linear-gradient(135deg,#667eea,#764ba2)",
  MOTEL: "linear-gradient(135deg,#f7971e,#ffd200)",
  RESTAURANT: "linear-gradient(135deg,#11998e,#38ef7d)",
};

const titleByType = {
  SPORT: "⚽ 스포츠 시설 정보 수정",
  MOTEL: "🏨 모텔 정보 수정",
  RESTAURANT: "🍽️ 음식점 정보 수정",
};

function InfoModal({
  facilityId,
  facilityType,
  info,
  target,
  onClose,
  onSave,
}) {
  const [name, setName] = useState(info.name ?? "");
  const [address, setAddress] = useState(info.address ?? "");
  const [description, setDescription] = useState(info.description ?? "");
  const [instruction, setInstruction] = useState(info.instruction ?? "");
  const [hourPrice, setHourPrice] = useState(target?.hourPrice ?? "");
  const [nightPrice, setNightPrice] = useState(target?.nightPrice ?? "");
  const [foodType, setFoodType] = useState(target?.foodType ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const base = { name, address, description, instruction };
      let extra = {};
      if (facilityType === "SPORT") extra = { hourPrice: Number(hourPrice) };
      if (facilityType === "MOTEL")
        extra = {
          hourPrice: Number(hourPrice),
          nightPrice: Number(nightPrice),
        };
      if (facilityType === "RESTAURANT") extra = { foodType };

      const updated = { ...base, ...extra };
      await updateFacilityInfoApi(facilityId, facilityType, updated);
      onSave(updated);
      onClose();
    } catch (err) {
      setError(err.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, children }) => (
    <div style={modalStyles.formGroup}>
      <label style={modalStyles.formLabel}>{label}</label>
      {children}
    </div>
  );

  return (
    <div
      style={modalStyles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          ...modalStyles.modal,
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <button style={modalStyles.closeBtn} onClick={onClose}>
          ✕
        </button>
        <h2 style={modalStyles.title}>
          {titleByType[facilityType] ?? "📝 시설 정보 수정"}
        </h2>

        {/* ── 공통 필드 ── */}
        <Field label="시설명">
          <input
            style={modalStyles.formInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="시설명을 입력하세요"
          />
        </Field>
        <Field label="주소">
          <input
            style={modalStyles.formInput}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="주소를 입력하세요"
          />
        </Field>
        <Field label="시설 설명">
          <textarea
            style={modalStyles.formTextarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="시설 설명을 입력하세요"
          />
        </Field>
        <Field label="찾아오는 방법">
          <textarea
            style={modalStyles.formTextarea}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="찾아오는 방법을 입력하세요"
          />
        </Field>

        {/* ── SPORT ── */}
        {facilityType === "SPORT" && (
          <Field label="⚽ 시간당 가격 (원)">
            <input
              style={modalStyles.formInput}
              type="number"
              min="0"
              value={hourPrice}
              onChange={(e) => setHourPrice(e.target.value)}
              placeholder="예: 10000"
            />
          </Field>
        )}

        {/* ── MOTEL ── */}
        {facilityType === "MOTEL" && (
          <>
            <Field label="🏨 시간당 가격 (원)">
              <input
                style={modalStyles.formInput}
                type="number"
                min="0"
                value={hourPrice}
                onChange={(e) => setHourPrice(e.target.value)}
                placeholder="예: 15000"
              />
            </Field>
            <Field label="🌙 1박 가격 (원)">
              <input
                style={modalStyles.formInput}
                type="number"
                min="0"
                value={nightPrice}
                onChange={(e) => setNightPrice(e.target.value)}
                placeholder="예: 60000"
              />
            </Field>
          </>
        )}

        {/* ── RESTAURANT ── */}
        {facilityType === "RESTAURANT" && (
          <Field label="🍴 음식 종류">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "8px",
                marginTop: "4px",
              }}
            >
              {FOOD_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFoodType(value)}
                  style={{
                    padding: "9px 6px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .15s",
                    background:
                      foodType === value
                        ? "linear-gradient(135deg,#11998e,#38ef7d)"
                        : "#f0f2f7",
                    color: foodType === value ? "#fff" : "#2c3e50",
                    border: foodType === value ? "none" : "1.5px solid #e2e6ee",
                    fontWeight: foodType === value ? "700" : "500",
                  }}
                >
                  {label} {/* ← hiển thị tiếng Hàn, gửi API value enum */}
                </button>
              ))}
            </div>
          </Field>
        )}
        {error && (
          <p
            style={{
              color: "#e74c3c",
              fontSize: "13px",
              marginTop: "8px",
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </p>
        )}

        <div style={modalStyles.footer}>
          <button
            style={modalStyles.cancelBtn}
            onClick={onClose}
            disabled={loading}
          >
            취소
          </button>
          <button
            style={{
              ...modalStyles.saveBtn,
              background: loading
                ? "#b2bec3"
                : (gradientByType[facilityType] ??
                  "linear-gradient(135deg,#667eea,#764ba2)"),
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "저장 중..." : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──
function FacilityDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);

  const [showImageModal, setShowImageModal] = useState(false); // ← thêm

  const handleSaveImages = (newUrls) => {
    setFacility((prev) => ({
      ...prev,
      imageUrls: [...(prev.imageUrls || []), ...newUrls],
    }));
  };

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [localInfo, setLocalInfo] = useState(null); // lưu state local sau khi edit

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
        setLocalInfo(data.facilityInfo || {});
      } catch {
        setError("시설 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSaveOptions = (updated) => {
    setLocalInfo((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveInfo = (updated) => {
    setLocalInfo((prev) => ({ ...prev, ...updated }));
  };

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

  const info = localInfo || {};

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
          <div style={styles.editGroup}>
            <button
              style={styles.btnOptions}
              onClick={() => setShowOptionsModal(true)}
            >
              ⚙️ 옵션 수정
            </button>
            <button
              style={styles.btnInfo}
              onClick={() => setShowInfoModal(true)}
            >
              📝 정보 수정
            </button>

            <button
              style={styles.btnImage}
              onClick={() => setShowImageModal(true)}
            >
              {" "}
              📷 사진 추가
            </button>
          </div>
        )}
      </header>

      <main style={styles.mainContent}>
        {loading && <p style={styles.statusText}>⏳ 불러오는 중...</p>}
        {error && (
          <p style={{ ...styles.statusText, color: "#e74c3c" }}>{error}</p>
        )}

        {!loading && !error && facility && (
          <div style={styles.contentWrapper}>
            {/* LEFT */}
            <div style={styles.leftCol}>
              <div style={styles.card}>
                {facility.imageUrls?.length > 0 ? (
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

            {/* RIGHT */}
            <div style={styles.rightCol}>
              {/* 기본 정보 */}
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
                        ? new Date(info.createdAt).toLocaleDateString("ko-KR")
                        : "-"
                    }
                  />
                  <InfoItem
                    label="수정일"
                    value={
                      info.updatedAt
                        ? new Date(info.updatedAt).toLocaleDateString("ko-KR")
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
                    style={{ ...styles.descBox, backgroundColor: "#f0f8ff" }}
                  >
                    <span style={styles.noteLabel}>🗺️ 찾아오는 방법</span>
                    <p style={styles.descText}>{info.instruction}</p>
                  </div>
                )}
              </div>

              {/* 서비스 정보 */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>💰 서비스 정보</h2>
                {renderTargetInfo(facility.facilityTarget)}
              </div>

              {/* 이용 후기 */}
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>⭐ 이용 후기</h2>
                <div style={styles.reviewPlaceholder}>
                  <p style={styles.emptyText}>아직 등록된 후기가 없습니다.</p>
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
        )}
      </main>

      {/* MODALS */}
      {showOptionsModal && (
        <OptionsModal
          facilityId={id}
          info={info}
          onClose={() => setShowOptionsModal(false)}
          onSave={handleSaveOptions}
        />
      )}
      {showInfoModal && (
        <InfoModal
          facilityId={id}
          facilityType={facility.facilityType} // "SPORT" | "MOTEL" | "RESTAURANT"
          info={info}
          target={facility.facilityTarget} // chứa hourPrice, nightPrice, foodType
          onClose={() => setShowInfoModal(false)}
          onSave={handleSaveInfo}
        />
      )}
      {showImageModal && (
        <ImageUploadModal
          facilityId={id}
          onClose={() => setShowImageModal(false)}
          onSave={handleSaveImages}
        />
      )}
    </div>
  );
}

// ── Helper ──
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
  editGroup: { display: "flex", gap: "10px" },
  btnOptions: {
    padding: "9px 18px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg,#667eea,#764ba2)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(102,126,234,0.35)",
  },
  btnInfo: {
    padding: "9px 18px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg,#11998e,#38ef7d)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(17,153,142,0.35)",
  },
  mainContent: { padding: "30px", maxWidth: "1200px", margin: "0 auto" },
  statusText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: "80px",
    fontSize: "16px",
  },
  contentWrapper: { display: "flex", gap: "24px", alignItems: "flex-start" },
  leftCol: { width: "300px", flexShrink: 0 },
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
  tag: { fontSize: "12px", fontWeight: "600" },
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
  descText: {
    margin: 0,
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    marginTop: "6px",
  },
  noteLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#95a5a6",
    textTransform: "uppercase",
    display: "block",
  },
  emptyText: { color: "#aaa", fontSize: "14px", textAlign: "center" },
  reviewPlaceholder: {
    minHeight: "100px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
};

const modalStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,20,35,0.45)",
    backdropFilter: "blur(3px)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#fff",
    borderRadius: "18px",
    padding: "30px 28px 24px",
    width: "100%",
    maxWidth: "460px",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "18px",
    background: "#f0f2f7",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    cursor: "pointer",
    fontSize: "14px",
    color: "#7f8c8d",
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e2b3a",
    marginBottom: "22px",
    marginTop: 0,
  },
  toggleList: { display: "flex", flexDirection: "column", gap: "12px" },
  toggleItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 16px",
    background: "#f8f9fc",
    borderRadius: "10px",
    border: "1.5px solid #eef0f6",
  },
  toggleLabel: { fontSize: "14px", fontWeight: "500", color: "#2c3e50" },
  switchTrack: {
    width: "46px",
    height: "26px",
    borderRadius: "99px",
    cursor: "pointer",
    position: "relative",
    transition: "background .2s",
    flexShrink: 0,
  },
  switchThumb: {
    position: "absolute",
    width: "20px",
    height: "20px",
    background: "#fff",
    borderRadius: "50%",
    top: "3px",
    left: "3px",
    transition: "transform .2s",
    boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "14px",
  },
  formLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ba5b4",
    textTransform: "uppercase",
    letterSpacing: ".5px",
  },
  formInput: {
    padding: "10px 13px",
    border: "1.5px solid #e2e6ee",
    borderRadius: "9px",
    fontSize: "13.5px",
    fontFamily: "inherit",
    color: "#2c3e50",
    background: "#fafbfc",
    outline: "none",
    width: "100%",
  },
  formTextarea: {
    padding: "10px 13px",
    border: "1.5px solid #e2e6ee",
    borderRadius: "9px",
    fontSize: "13.5px",
    fontFamily: "inherit",
    color: "#2c3e50",
    background: "#fafbfc",
    outline: "none",
    width: "100%",
    resize: "vertical",
    minHeight: "80px",
    lineHeight: "1.55",
  },
  footer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "20px",
  },
  cancelBtn: {
    padding: "9px 20px",
    borderRadius: "8px",
    border: "1.5px solid #dde1ea",
    background: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    color: "#7f8c8d",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  saveBtn: {
    padding: "9px 20px",
    borderRadius: "8px",
    border: "none",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnImage: {
    padding: "9px 18px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg,#3498db,#2980b9)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(52,152,219,0.35)",
  },
};

export default FacilityDetailsPage;
