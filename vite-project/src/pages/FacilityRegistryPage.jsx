import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadImagesApi, createFacilityApi } from "../api/facilityApi";

const initialFacilityState = {
  name: "",
  type: "SPORT",
  description: "",
  address: "",
  active: true,
  carPark: true,
  hasWifi: true,
  instruction: "",
  hourPrice: "",
  nightPrice: "",
  foodType: "KOREAN_FOOD",
};

function FacilityRegistryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [newFacility, setNewFacility] = useState(initialFacilityState);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (field, value) => {
    setNewFacility((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setPreviewUrls(files.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (idx) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!newFacility.name.trim()) return alert("시설명을 입력해주세요.");
    if (!newFacility.address.trim()) return alert("주소를 입력해주세요.");

    try {
      setIsSubmitting(true);

      let imageUrls = [];
      if (selectedFiles.length > 0) {
        const uploaded = await uploadImagesApi(selectedFiles);
        imageUrls = Array.isArray(uploaded) ? uploaded : (uploaded.data ?? []);
      }

      const payload = {
        ...newFacility,
        images: imageUrls,
        hourPrice: newFacility.hourPrice ? Number(newFacility.hourPrice) : 0,
        nightPrice: newFacility.nightPrice ? Number(newFacility.nightPrice) : 0,
      };

      await createFacilityApi(payload);
      alert("✅ 시설 등록이 완료되었습니다!");
      navigate("/facilities");
    } catch (err) {
      alert("❌ 오류: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setNewFacility(initialFacilityState);
    setSelectedFiles([]);
    setPreviewUrls([]);
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
            ⬅ 돌아가기
          </button>
          <h1 style={styles.pageTitle}>➕ 새 시설 등록</h1>
        </div>
      </header>

      <main style={styles.mainContent}>
        <div style={styles.card}>
          {/* ── THÔNG TIN CƠ BẢN ── */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>📋 기본 정보</h2>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>시설 유형 *</label>
                <select
                  style={styles.input}
                  value={newFacility.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  <option value="SPORT">⚽ 스포츠</option>
                  <option value="MOTEL">🏨 모텔</option>
                  <option value="RESTAURANT">🍽️ 음식점</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>시설명 *</label>
                <input
                  style={styles.input}
                  placeholder="시설 이름을 입력하세요"
                  value={newFacility.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>주소 *</label>
              <input
                style={styles.input}
                placeholder="주소를 입력하세요"
                value={newFacility.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>시설 상세 설명</label>
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                placeholder="시설에 대한 상세 설명을 입력하세요"
                value={newFacility.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>찾아오는 방법</label>
              <textarea
                style={{ ...styles.input, ...styles.textarea }}
                placeholder="오시는 길 또는 주의사항을 입력하세요"
                value={newFacility.instruction}
                onChange={(e) => handleChange("instruction", e.target.value)}
              />
            </div>

            <div style={styles.checkboxRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newFacility.active}
                  onChange={(e) => handleChange("active", e.target.checked)}
                  style={styles.checkbox}
                />
                <span>🟢 영업 가능</span>
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newFacility.carPark}
                  onChange={(e) => handleChange("carPark", e.target.checked)}
                  style={styles.checkbox}
                />
                <span>🚗 주차 가능</span>
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newFacility.hasWifi}
                  onChange={(e) => handleChange("hasWifi", e.target.checked)}
                  style={styles.checkbox}
                />
                <span>📶 WiFi 가능</span>
              </label>
            </div>
          </section>

          {/* ── THÔNG TIN DỊCH VỤ (động theo type) ── */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>💰 서비스 정보</h2>

            {newFacility.type === "SPORT" && (
              <div style={styles.formGroup}>
                <label style={styles.label}>시간당 가격 (원)</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="예: 10000"
                  value={newFacility.hourPrice}
                  onChange={(e) => handleChange("hourPrice", e.target.value)}
                />
              </div>
            )}

            {newFacility.type === "MOTEL" && (
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>시간당 가격 (원)</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="예: 20000"
                    value={newFacility.hourPrice}
                    onChange={(e) => handleChange("hourPrice", e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>1박 가격 (원)</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="예: 80000"
                    value={newFacility.nightPrice}
                    onChange={(e) => handleChange("nightPrice", e.target.value)}
                  />
                </div>
              </div>
            )}

            {newFacility.type === "RESTAURANT" && (
              <div style={styles.formGroup}>
                <label style={styles.label}>음식 종류</label>
                <select
                  style={styles.input}
                  value={newFacility.foodType}
                  onChange={(e) => handleChange("foodType", e.target.value)}
                >
                  <option value="KOREAN_FOOD">🇰🇷 한식</option>
                  <option value="JAPANESE_FOOD">🇯🇵 일식</option>
                  <option value="CHINESE_FOOD">🇨🇳 중식</option>
                  <option value="VIETNAMESE_FOOD">🇻🇳 베트남 음식</option>
                  <option value="OTHER">🍴 기타</option>
                </select>
              </div>
            )}
          </section>

          {/* ── ẢNH ── */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>📸 시설 이미지</h2>

            <label style={styles.fileLabel}>
              <span>📂 이미지 선택 (여러 장 가능)</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>

            {previewUrls.length > 0 && (
              <div style={styles.previewGrid}>
                {previewUrls.map((url, idx) => (
                  <div key={idx} style={styles.previewItem}>
                    <img
                      src={url}
                      alt={`preview-${idx}`}
                      style={styles.previewImg}
                    />
                    <button
                      style={styles.removeBtn}
                      onClick={() => removeFile(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length === 0 && (
              <p style={styles.hintText}>아직 선택된 이미지가 없습니다.</p>
            )}
          </section>

          {/* ── ACTION BUTTONS ── */}
          <div style={styles.actionRow}>
            <button
              style={styles.resetBtn}
              onClick={handleReset}
              disabled={isSubmitting}
            >
              🔄 초기화
            </button>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                style={styles.cancelBtn}
                onClick={() => navigate("/facilities")}
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                style={{ ...styles.submitBtn, opacity: isSubmitting ? 0.7 : 1 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "⏳ 처리 중..." : "✅ 등록 신청"}
              </button>
            </div>
          </div>
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
    backgroundColor: "#fff",
    padding: "15px 30px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    borderBottom: "1px solid #eaeaea",
    display: "flex",
    alignItems: "center",
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
  mainContent: { padding: "30px", maxWidth: "800px", margin: "0 auto" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.07)",
    padding: "36px",
  },
  section: { marginBottom: "36px" },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: "18px",
    paddingBottom: "10px",
    borderBottom: "2px solid #f0f3f8",
  },
  formRow: { display: "flex", gap: "16px" },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
    marginBottom: "16px",
  },
  label: { fontSize: "13px", fontWeight: "600", color: "#555" },
  input: {
    padding: "10px 14px",
    fontSize: "14px",
    borderRadius: "7px",
    border: "1px solid #dde3ed",
    outline: "none",
    backgroundColor: "#fafbfc",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: { resize: "vertical", minHeight: "90px" },
  checkboxRow: { display: "flex", gap: "28px", marginTop: "8px" },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    cursor: "pointer",
  },
  checkbox: { width: "16px", height: "16px", cursor: "pointer" },
  fileLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    borderRadius: "7px",
    border: "2px dashed #3498db",
    color: "#3498db",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "16px",
  },
  previewGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "10px",
  },
  previewItem: { position: "relative", width: "100px", height: "100px" },
  previewImg: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  removeBtn: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#e74c3c",
    color: "#fff",
    fontSize: "11px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  hintText: { color: "#aaa", fontSize: "13px", marginTop: "4px" },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "24px",
    borderTop: "1px solid #f0f3f8",
    marginTop: "8px",
  },
  resetBtn: {
    padding: "10px 18px",
    borderRadius: "7px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    color: "#7f8c8d",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "10px 22px",
    borderRadius: "7px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    color: "#555",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 28px",
    borderRadius: "7px",
    border: "none",
    backgroundColor: "#3498db",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(52,152,219,0.35)",
  },
};

export default FacilityRegistryPage;
