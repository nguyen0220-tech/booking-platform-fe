import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchFacilityDetailApi,
  updateFacilityOptionApi,
  updateFacilityInfoApi,
  uploadImagesApi,
  addFacilityImagesApi,
} from "../api/facilityApi";

/* ────────────────────────────────────────────────
   DESIGN TOKENS
   Đồng bộ với tông teal (#208a8a) dùng ở navbar
──────────────────────────────────────────────────*/
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
  dangerBg: "#fdf1f0",
  success: "#1ea672",
  successBg: "#eafaf3",
  gold: "#f5a623",
  goldBg: "#fffaf0",
};

function ImageUploadModal({ facilityId, onClose, onSave }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("select");
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
      setStep("uploading");
      const imageUrls = await uploadImagesApi(files);
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

        {loading && (
          <div style={imgModalStyles.stepIndicator}>
            <span
              style={{ ...imgModalStyles.stepDot, background: tokens.teal700 }}
            >
              1
            </span>
            <span style={imgModalStyles.stepLine} />
            <span
              style={{
                ...imgModalStyles.stepDot,
                background: step === "saving" ? tokens.teal700 : "#dde1ea",
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

        {error && <p style={modalStyles.errorText}>⚠️ {error}</p>}

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
                : `linear-gradient(135deg, ${tokens.teal600}, ${tokens.teal900})`,
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

const imgModalStyles = {
  dropZone: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: `2px dashed ${tokens.teal100}`,
    borderRadius: "12px",
    padding: "28px 20px",
    cursor: "pointer",
    backgroundColor: tokens.teal50,
    transition: "border-color .2s",
    marginBottom: "16px",
  },
  dropIcon: { fontSize: "28px" },
  dropText: { fontSize: "13px", color: tokens.ink400, fontWeight: "500" },
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
    background: tokens.teal50,
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
  stepText: { fontSize: "12px", color: tokens.ink600, fontWeight: "500" },
};

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
                  background: value ? tokens.teal700 : "#dde1ea",
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

        {error && <p style={modalStyles.errorText}>⚠️ {error}</p>}

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
                : `linear-gradient(135deg, ${tokens.teal600}, ${tokens.teal900})`,
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

const FOOD_TYPES = [
  { value: "KOREAN_FOOD", label: "한식" },
  { value: "JAPANESE_FOOD", label: "일식" },
  { value: "CHINESE_FOOD", label: "중식" },
  { value: "VIETNAMESE_FOOD", label: "베트남 음식" },
  { value: "OTHER", label: "기타" },
];

const gradientByType = {
  SPORT: "linear-gradient(135deg,#5b6dc9,#3d4d9e)",
  MOTEL: "linear-gradient(135deg,#e8a13d,#c97f1e)",
  RESTAURANT: `linear-gradient(135deg, ${tokens.teal600}, ${tokens.teal900})`,
};

const titleByType = {
  SPORT: "⚽ 스포츠 시설 정보 수정",
  MOTEL: "🏨 모텔 정보 수정",
  RESTAURANT: "🍽️ 음식점 정보 수정",
};

const ModalField = ({ label, children }) => (
  <div style={modalStyles.formGroup}>
    <label style={modalStyles.formLabel}>{label}</label>
    {children}
  </div>
);

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
  const [openTime, setOpenTime] = useState(target?.openTime ?? "");
  const [closeTime, setCloseTime] = useState(target?.closeTime ?? "");
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
      if (facilityType === "RESTAURANT")
        extra = { foodType, openTime, closeTime };

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

        <ModalField label="시설명">
          <input
            style={modalStyles.formInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="시설명을 입력하세요"
          />
        </ModalField>
        <ModalField label="주소">
          <input
            style={modalStyles.formInput}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="주소를 입력하세요"
          />
        </ModalField>
        <ModalField label="시설 설명">
          <textarea
            style={modalStyles.formTextarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="시설 설명을 입력하세요"
          />
        </ModalField>
        <ModalField label="찾아오는 방법">
          <textarea
            style={modalStyles.formTextarea}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="찾아오는 방법을 입력하세요"
          />
        </ModalField>

        {facilityType === "SPORT" && (
          <ModalField label="⚽ 시간당 가격 (원)">
            <input
              style={modalStyles.formInput}
              type="number"
              min="0"
              value={hourPrice}
              onChange={(e) => setHourPrice(e.target.value)}
              placeholder="예: 10000"
            />
          </ModalField>
        )}

        {facilityType === "MOTEL" && (
          <>
            <ModalField label="🏨 시간당 가격 (원)">
              <input
                style={modalStyles.formInput}
                type="number"
                min="0"
                value={hourPrice}
                onChange={(e) => setHourPrice(e.target.value)}
                placeholder="예: 15000"
              />
            </ModalField>
            <ModalField label="🌙 1박 가격 (원)">
              <input
                style={modalStyles.formInput}
                type="number"
                min="0"
                value={nightPrice}
                onChange={(e) => setNightPrice(e.target.value)}
                placeholder="예: 60000"
              />
            </ModalField>
          </>
        )}

        {facilityType === "RESTAURANT" && (
          <>
            <ModalField label="🍴 음식 종류">
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
                          ? `linear-gradient(135deg, ${tokens.teal600}, ${tokens.teal900})`
                          : "#f0f2f7",
                      color: foodType === value ? "#fff" : tokens.ink900,
                      border:
                        foodType === value ? "none" : "1.5px solid #e2e6ee",
                      fontWeight: foodType === value ? "700" : "500",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ModalField>
            <div style={{ display: "flex", gap: "12px" }}>
              <ModalField label="⏰ 영업 시작 시간">
                <input
                  style={modalStyles.formInput}
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                />
              </ModalField>
              <ModalField label="⏰ 영업 종료 시간">
                <input
                  style={modalStyles.formInput}
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                />
              </ModalField>
            </div>
          </>
        )}

        {error && <p style={modalStyles.errorText}>⚠️ {error}</p>}

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
                  `linear-gradient(135deg, ${tokens.teal600}, ${tokens.teal900})`),
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

  const [showImageModal, setShowImageModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [localInfo, setLocalInfo] = useState(null);

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

  const handleSaveImages = (newUrls) => {
    setFacility((prev) => ({
      ...prev,
      imageUrls: [...(prev.imageUrls || []), ...newUrls],
    }));
  };

  const handleSaveOptions = (updated) => {
    setLocalInfo((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveInfo = (updated) => {
    setLocalInfo((prev) => ({ ...prev, ...updated }));
  };

  const facilityTypeLabel = {
    SPORT: "⚽ 스포츠 시설",
    MOTEL: "🏨 모텔",
    RESTAURANT: "🍽️ 음식점",
  };

  const renderTargetInfo = (target) => {
    if (!target) return <span style={styles.emptyText}>정보 없음</span>;
    switch (target.__typename) {
      case "Sport":
        return (
          <>
            <div style={styles.infoGrid}>
              <InfoItem label="유형" value="⚽ 스포츠" />
              <InfoItem
                label="시간당 가격"
                value={`${target.hourPrice?.toLocaleString()}원`}
              />
            </div>
            <button
              style={styles.btnMenu}
              onClick={() => navigate(`/facilities/${id}/package-sport`)}
            >
              📦 패키지 관리
            </button>
          </>
        );
      case "Motel":
        return (
          <>
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
            <button
              style={styles.btnMenu}
              onClick={() => navigate(`/facilities/${id}/package-motel`)}
            >
              📦 패키지 관리
            </button>
          </>
        );
      case "Restaurant":
        return (
          <>
            <div style={styles.infoGrid}>
              <InfoItem label="유형" value="🍽️ 음식점" />
              <InfoItem label="음식 종류" value={target.foodType} />
              <InfoItem label="⏰ 영업 시작" value={target.openTime || "-"} />
              <InfoItem label="⏰ 영업 종료" value={target.closeTime || "-"} />
            </div>
            <div style={styles.btnRow}>
              <button
                style={styles.btnMenu}
                onClick={() => navigate(`/facilities/${id}/menus`)}
              >
                🍴 메뉴 관리
              </button>
              <button
                style={styles.btnMenu}
                onClick={() => navigate(`/facilities/${id}/package-restaurant`)}
              >
                📦 패키지 관리
              </button>
            </div>
          </>
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
            ← 목록
          </button>
          <div style={styles.headerDivider} />
          <div>
            <h1 style={styles.pageTitle}>시설 상세 정보</h1>
            {facility && (
              <span style={styles.pageSubtitle}>
                {facilityTypeLabel[facility.facilityType] ??
                  facility.facilityType}
              </span>
            )}
          </div>
        </div>

        {facility && (
          <div style={styles.editGroup}>
            <button
              style={styles.btnSecondary}
              onClick={() => setShowOptionsModal(true)}
            >
              ⚙️ 옵션 수정
            </button>
            <button
              style={styles.btnSecondary}
              onClick={() => setShowImageModal(true)}
            >
              📷 사진 추가
            </button>
            <button
              style={styles.btnPrimary}
              onClick={() => setShowInfoModal(true)}
            >
              📝 정보 수정
            </button>
          </div>
        )}
      </header>

      <main style={styles.mainContent}>
        {loading && <p style={styles.statusText}>⏳ 불러오는 중...</p>}
        {error && (
          <p style={{ ...styles.statusText, color: tokens.danger }}>{error}</p>
        )}

        {!loading && !error && facility && (
          <div style={styles.contentWrapper}>
            {/* LEFT */}
            <div style={styles.leftCol}>
              <div style={styles.card}>
                {facility.imageUrls?.length > 0 ? (
                  <>
                    <div style={styles.mainImageWrap}>
                      <img
                        src={facility.imageUrls[selectedImg]}
                        alt="main"
                        style={styles.mainImage}
                      />
                      <div style={styles.imageCountBadge}>
                        {selectedImg + 1} / {facility.imageUrls.length}
                      </div>
                    </div>
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
                                  ? `2px solid ${tokens.teal700}`
                                  : "2px solid transparent",
                              opacity: selectedImg === idx ? 1 : 0.7,
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
                  <h2 style={styles.cardTitle}>기본 정보</h2>
                  <button
                    type="button"
                    style={styles.ratingBox}
                    onClick={() => navigate(`/facilities/${id}/reviews`)}
                    title="이용 후기 보러 가기"
                  >
                    <span style={styles.ratingStar}>★</span>
                    <span style={styles.ratingValue}>
                      {info.averageRating != null
                        ? Number(info.averageRating).toFixed(1)
                        : "—"}
                    </span>
                    <span style={styles.ratingCount}>
                      ({info.totalReviews ?? 0}개 평가)
                    </span>
                    <span style={styles.ratingArrow}>›</span>
                  </button>
                </div>

                <div style={styles.tagRow}>
                  <Badge
                    on={!!info.active}
                    onLabel="영업 가능"
                    offLabel="영업 불가"
                  />
                  <Badge
                    on={!!info.carPark}
                    onLabel="🚗 주차 가능"
                    offLabel="🚗 주차 불가"
                  />
                  <Badge
                    on={!!info.hasWifi}
                    onLabel="📶 WiFi 가능"
                    offLabel="📶 WiFi 불가"
                  />
                </div>

                <div style={styles.divider} />

                <table style={styles.infoTable}>
                  <tbody>
                    <tr style={styles.infoTableRow}>
                      <th style={styles.infoTableLabel}>시설명</th>
                      <td style={styles.infoTableValue}>{info.name || "-"}</td>
                    </tr>
                    <tr style={styles.infoTableRow}>
                      <th style={styles.infoTableLabel}>유형</th>
                      <td style={styles.infoTableValue}>
                        {facilityTypeLabel[facility.facilityType] ??
                          facility.facilityType}
                      </td>
                    </tr>
                    <tr style={styles.infoTableRow}>
                      <th style={styles.infoTableLabel}>주소</th>
                      <td style={styles.infoTableValue}>
                        {info.address || "-"}
                      </td>
                    </tr>
                    <tr style={styles.infoTableRow}>
                      <th style={styles.infoTableLabel}>등록일</th>
                      <td style={styles.infoTableValue}>
                        {info.createdAt
                          ? new Date(info.createdAt).toLocaleDateString("ko-KR")
                          : "-"}
                      </td>
                    </tr>
                    <tr style={styles.infoTableRowLast}>
                      <th style={styles.infoTableLabel}>수정일</th>
                      <td style={styles.infoTableValue}>
                        {info.updatedAt
                          ? new Date(info.updatedAt).toLocaleDateString("ko-KR")
                          : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>

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
                      backgroundColor: tokens.teal50,
                    }}
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
          facilityType={facility.facilityType}
          info={info}
          target={facility.facilityTarget}
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

function Badge({ on, onLabel, offLabel }) {
  return (
    <span
      style={{
        ...styles.badge,
        color: on ? tokens.success : tokens.danger,
        backgroundColor: on ? tokens.successBg : tokens.dangerBg,
      }}
    >
      <span
        style={{
          ...styles.badgeDot,
          backgroundColor: on ? tokens.success : tokens.danger,
        }}
      />
      {on ? onLabel : offLabel}
    </span>
  );
}

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
    color: tokens.ink400,
    marginBottom: "3px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: ".4px",
  },
  value: { fontSize: "14px", color: tokens.ink900, fontWeight: "500" },
};

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
  editGroup: { display: "flex", gap: "8px" },
  btnPrimary: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: "none",
    background: `linear-gradient(135deg, ${tokens.teal600}, ${tokens.teal900})`,
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(32,138,138,0.28)",
  },
  btnSecondary: {
    padding: "10px 18px",
    borderRadius: "8px",
    border: `1.5px solid ${tokens.border}`,
    background: "#fff",
    color: tokens.ink600,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  mainContent: { padding: "28px 32px", maxWidth: "1200px", margin: "0 auto" },
  statusText: {
    textAlign: "center",
    color: tokens.ink400,
    marginTop: "80px",
    fontSize: "16px",
  },
  contentWrapper: { display: "flex", gap: "22px", alignItems: "flex-start" },
  leftCol: { width: "320px", flexShrink: 0, position: "sticky", top: "90px" },
  rightCol: { display: "flex", flexDirection: "column", gap: "18px", flex: 1 },
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
    margin: 0,
  },
  cardTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
    flexWrap: "wrap",
    gap: "8px",
  },
  tagRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    fontWeight: "700",
    padding: "5px 12px",
    borderRadius: "999px",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  divider: {
    height: "1px",
    backgroundColor: tokens.border,
    margin: "0 0 16px",
  },
  mainImageWrap: {
    position: "relative",
    marginBottom: "10px",
  },
  mainImage: {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    borderRadius: "10px",
    display: "block",
  },
  imageCountBadge: {
    position: "absolute",
    bottom: "10px",
    right: "10px",
    backgroundColor: "rgba(15,23,42,0.65)",
    color: "#fff",
    fontSize: "11px",
    fontWeight: "700",
    padding: "3px 9px",
    borderRadius: "999px",
  },
  thumbRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  thumb: {
    width: "56px",
    height: "56px",
    objectFit: "cover",
    borderRadius: "7px",
    cursor: "pointer",
    transition: "opacity .15s",
  },
  noImage: {
    height: "160px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ccc",
    fontSize: "16px",
    backgroundColor: tokens.bg,
    borderRadius: "10px",
  },
  /* dùng cho phần 서비스 정보 (Sport/Motel/Restaurant) */
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },

  /* ── INFO TABLE ── */
  infoTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "4px",
  },
  infoTableRow: {
    borderBottom: `1px solid ${tokens.border}`,
  },
  infoTableRowLast: {
    borderBottom: "none",
  },
  infoTableLabel: {
    textAlign: "left",
    verticalAlign: "top",
    padding: "11px 16px 11px 0",
    width: "110px",
    fontSize: "12px",
    fontWeight: "700",
    color: tokens.ink400,
    textTransform: "uppercase",
    letterSpacing: ".4px",
    whiteSpace: "nowrap",
  },
  infoTableValue: {
    textAlign: "left",
    padding: "11px 0",
    fontSize: "14px",
    color: tokens.ink900,
    fontWeight: "500",
  },

  /* ── RATING (clickable) ── */
  ratingBox: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: tokens.goldBg,
    border: "1px solid #fde8a0",
    borderRadius: "999px",
    padding: "5px 10px 5px 12px",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  ratingStar: {
    fontSize: "14px",
    color: tokens.gold,
  },
  ratingValue: {
    fontSize: "13px",
    fontWeight: "700",
    color: tokens.ink900,
  },
  ratingCount: {
    fontSize: "11.5px",
    color: tokens.ink400,
  },
  ratingArrow: {
    fontSize: "15px",
    color: tokens.ink400,
    fontWeight: "700",
    marginLeft: "2px",
  },

  descBox: {
    backgroundColor: tokens.bg,
    borderRadius: "10px",
    padding: "12px 14px",
    marginTop: "8px",
  },
  descText: {
    margin: 0,
    fontSize: "14px",
    color: tokens.ink600,
    lineHeight: "1.6",
    marginTop: "6px",
  },
  noteLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: tokens.ink400,
    textTransform: "uppercase",
    display: "block",
    letterSpacing: ".4px",
  },
  emptyText: {
    color: tokens.ink400,
    fontSize: "14px",
    textAlign: "center",
    margin: 0,
  },
  btnMenu: {
    padding: "9px 16px",
    borderRadius: "8px",
    border: `1.5px solid ${tokens.teal100}`,
    backgroundColor: tokens.teal50,
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    color: tokens.teal900,
    marginTop: "10px",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
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
    color: tokens.ink900,
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
  toggleLabel: { fontSize: "14px", fontWeight: "500", color: tokens.ink900 },
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
    color: tokens.ink900,
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
    color: tokens.ink900,
    background: "#fafbfc",
    outline: "none",
    width: "100%",
    resize: "vertical",
    minHeight: "80px",
    lineHeight: "1.55",
  },
  errorText: {
    color: tokens.danger,
    fontSize: "13px",
    marginTop: "10px",
    textAlign: "center",
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
};

export default FacilityDetailsPage;
