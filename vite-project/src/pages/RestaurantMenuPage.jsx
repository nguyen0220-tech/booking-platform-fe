import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchRestaurantMenusApi,
  addRestaurantMenuApi,
  updateRestaurantMenuApi,
  handleRestaurantMenuApi,
} from "../api/facilityApi";

function AddMenuModal({ restaurantId, onClose, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSave = async () => {
    if (!name.trim()) return setError("메뉴 이름을 입력해주세요.");
    if (!price || Number(price) <= 0)
      return setError("올바른 가격을 입력해주세요.");

    setLoading(true);
    setError(null);
    try {
      await addRestaurantMenuApi(restaurantId, {
        name,
        description,
        price,
        file,
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || "메뉴 추가 중 오류가 발생했습니다.");
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
        <h2 style={modalStyles.title}>➕ 새 메뉴 추가</h2>

        {/* 이미지 업로드 */}
        <label style={modalStyles.imageUpload}>
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
            disabled={loading}
          />
          {preview ? (
            <img src={preview} alt="preview" style={modalStyles.imagePreview} />
          ) : (
            <div style={modalStyles.imagePlaceholder}>
              <span style={{ fontSize: "32px" }}>🖼️</span>
              <span style={{ fontSize: "13px", color: "#7f8c8d" }}>
                사진 선택 (선택)
              </span>
            </div>
          )}
        </label>

        {/* 메뉴명 */}
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>메뉴명 *</label>
          <input
            style={modalStyles.input}
            placeholder="예: 된장찌개"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 설명 */}
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>설명</label>
          <textarea
            style={modalStyles.textarea}
            placeholder="메뉴 설명을 입력하세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 가격 */}
        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>가격 (원) *</label>
          <input
            style={modalStyles.input}
            type="number"
            min="0"
            placeholder="예: 9000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
          />
        </div>

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
                : "linear-gradient(135deg,#11998e,#38ef7d)",
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

function EditMenuModal({ menu, onClose, onSave }) {
  const [name, setName] = useState(menu.name || "");
  const [description, setDescription] = useState(menu.description || "");
  const [price, setPrice] = useState(menu.price || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    if (!name.trim()) return setError("메뉴 이름을 입력해주세요.");
    if (!price || Number(price) <= 0)
      return setError("올바른 가격을 입력해주세요.");

    setLoading(true);
    setError(null);
    try {
      await updateRestaurantMenuApi({
        menuId: menu.id,
        name,
        description,
        price,
      });
      onSave();
      onClose();
    } catch (err) {
      setError(err.message || "메뉴 수정 중 오류가 발생했습니다.");
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
        <h2 style={modalStyles.title}>✏️ 메뉴 수정</h2>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>메뉴명 *</label>
          <input
            style={modalStyles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>설명</label>
          <textarea
            style={modalStyles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={modalStyles.formGroup}>
          <label style={modalStyles.label}>가격 (원) *</label>
          <input
            style={modalStyles.input}
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={loading}
          />
        </div>

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
                : "linear-gradient(135deg,#3498db,#6c5ce7)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "저장 중..." : "수정하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RestaurantMenuPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // thêm state
  const [showAddModal, setShowAddModal] = useState(false);

  // hàm reload sau khi thêm menu
  const handleMenuAdded = async () => {
    const data = await fetchRestaurantMenusApi(id);
    setFacility(data);
  };

  const [editingMenu, setEditingMenu] = useState(null); // menu đang sửa
  const [actionLoadingId, setActionLoadingId] = useState(null); // thay deletingId

  const handleMenuAction = async (menuId, act, confirmMsg) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setActionLoadingId(`${menuId}_${act}`);
    try {
      await handleRestaurantMenuApi(menuId, act);
      const data = await fetchRestaurantMenusApi(id);
      setFacility(data);
    } catch (err) {
      alert(err.message || "처리 중 오류가 발생했습니다.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const isActLoading = (menuId, act) => actionLoadingId === `${menuId}_${act}`;

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
        const data = await fetchRestaurantMenusApi(id);
        setFacility(data);
      } catch {
        setError("메뉴 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (!user) return null;

  const info = facility?.facilityInfo || {};
  const target = facility?.facilityTarget || {};
  const menus = target.menus || [];

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
            <h1 style={styles.pageTitle}>🍴 메뉴 관리</h1>
            {info.name && <span style={styles.facilityName}>{info.name}</span>}
          </div>
        </div>
      </header>

      <main style={styles.mainContent}>
        {loading && <p style={styles.statusText}>⏳ 불러오는 중...</p>}
        {error && (
          <p style={{ ...styles.statusText, color: "#e74c3c" }}>{error}</p>
        )}

        {!loading && !error && (
          <>
            {/* ── THÔNG TIN CƠ BẢN ── */}
            <div style={styles.infoCard}>
              <h2 style={styles.restaurantName}>{info.name || "-"}</h2>
              {info.address && (
                <p style={styles.restaurantAddress}>📍 {info.address}</p>
              )}
              {info.description && (
                <p style={styles.restaurantDesc}>{info.description}</p>
              )}
            </div>

            {/* 식당 요약 정보 */}
            <div style={styles.summaryCard}>
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>음식 종류</span>
                <span style={styles.summaryValue}>
                  {target.foodType || "-"}
                </span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>⏰ 영업 시간</span>
                <span style={styles.summaryValue}>
                  {target.openTime || "-"} ~ {target.closeTime || "-"}
                </span>
              </div>
              <div style={styles.summaryDivider} />
              <div style={styles.summaryItem}>
                <span style={styles.summaryLabel}>메뉴 수</span>
                <span style={styles.summaryValue}>{menus.length}개</span>
              </div>
            </div>

            {/* 메뉴 목록 */}
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>📋 메뉴 목록</h2>
              {/* ← THÊM NÚT */}
              <button
                style={styles.addMenuBtn}
                onClick={() => setShowAddModal(true)}
              >
                ➕ 메뉴 추가
              </button>
            </div>

            {menus.length === 0 ? (
              <div style={styles.emptyBox}>
                <p style={styles.emptyText}>등록된 메뉴가 없습니다.</p>
              </div>
            ) : (
              <div style={styles.menuGrid}>
                {menus.map((menu) => (
                  <div key={menu.id} style={styles.menuCard}>
                    {menu.imageUrl ? (
                      <img
                        src={menu.imageUrl}
                        alt={menu.name}
                        style={styles.menuImage}
                      />
                    ) : (
                      <div style={styles.menuImageFallback}>🍽️</div>
                    )}
                    <div style={styles.menuBody}>
                      <div style={styles.menuName}>{menu.name}</div>
                      {menu.description && (
                        <div style={styles.menuDesc}>{menu.description}</div>
                      )}
                      <div style={styles.menuPrice}>
                        {menu.price?.toLocaleString()}원
                      </div>
                      <div style={styles.menuActions}>
                        {/* 수정 */}
                        <button
                          style={styles.editBtn}
                          onClick={() => setEditingMenu(menu)}
                          disabled={!!actionLoadingId}
                        >
                          ✏️ 수정
                        </button>

                        {/* 품절 / 품절 해제 — toggle theo trạng thái menu */}
                        {menu.soldOut ? (
                          <button
                            style={{
                              ...styles.availableBtn,
                              opacity: isActLoading(menu.id, "AVAILABLE")
                                ? 0.6
                                : 1,
                              cursor: isActLoading(menu.id, "AVAILABLE")
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={() =>
                              handleMenuAction(menu.id, "AVAILABLE", null)
                            }
                            disabled={!!actionLoadingId}
                          >
                            {isActLoading(menu.id, "AVAILABLE")
                              ? "처리 중..."
                              : "✅ 품절 해제"}
                          </button>
                        ) : (
                          <button
                            style={{
                              ...styles.soldOutBtn,
                              opacity: isActLoading(menu.id, "SOLD_OUT")
                                ? 0.6
                                : 1,
                              cursor: isActLoading(menu.id, "SOLD_OUT")
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={() =>
                              handleMenuAction(menu.id, "SOLD_OUT", null)
                            }
                            disabled={!!actionLoadingId}
                          >
                            {isActLoading(menu.id, "SOLD_OUT")
                              ? "처리 중..."
                              : "🚫 품절"}
                          </button>
                        )}

                        {/* 삭제 / 복구 — toggle theo trạng thái menu */}
                        {menu.deleted ? (
                          <button
                            style={{
                              ...styles.restoreBtn,
                              opacity: isActLoading(menu.id, "RESTORE")
                                ? 0.6
                                : 1,
                              cursor: isActLoading(menu.id, "RESTORE")
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={() =>
                              handleMenuAction(
                                menu.id,
                                "RESTORE",
                                "이 메뉴를 복구하시겠습니까?",
                              )
                            }
                            disabled={!!actionLoadingId}
                          >
                            {isActLoading(menu.id, "RESTORE")
                              ? "처리 중..."
                              : "♻️ 복구"}
                          </button>
                        ) : (
                          <button
                            style={{
                              ...styles.deleteBtn,
                              opacity: isActLoading(menu.id, "DELETE")
                                ? 0.6
                                : 1,
                              cursor: isActLoading(menu.id, "DELETE")
                                ? "not-allowed"
                                : "pointer",
                            }}
                            onClick={() =>
                              handleMenuAction(
                                menu.id,
                                "DELETE",
                                "정말 이 메뉴를 삭제하시겠습니까?",
                              )
                            }
                            disabled={!!actionLoadingId}
                          >
                            {isActLoading(menu.id, "DELETE")
                              ? "처리 중..."
                              : "🗑️ 삭제"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      {showAddModal && (
        <AddMenuModal
          restaurantId={Number(id)}
          onClose={() => setShowAddModal(false)}
          onSave={handleMenuAdded}
        />
      )}

      {editingMenu && (
        <EditMenuModal
          menu={editingMenu}
          onClose={() => setEditingMenu(null)}
          onSave={handleMenuAdded}
        />
      )}
    </div>
  );
}

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
    maxWidth: "440px",
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
    marginBottom: "20px",
    marginTop: 0,
  },
  imageUpload: {
    display: "block",
    cursor: "pointer",
    marginBottom: "16px",
    borderRadius: "10px",
    overflow: "hidden",
    border: "2px dashed #c5cde6",
  },
  imagePreview: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    display: "block",
  },
  imagePlaceholder: {
    height: "120px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#f8f9fc",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "14px",
  },
  label: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#9ba5b4",
    textTransform: "uppercase",
    letterSpacing: ".5px",
  },
  input: {
    padding: "10px 13px",
    border: "1.5px solid #e2e6ee",
    borderRadius: "9px",
    fontSize: "13.5px",
    fontFamily: "inherit",
    color: "#2c3e50",
    background: "#fafbfc",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  textarea: {
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
    minHeight: "72px",
    lineHeight: "1.55",
    boxSizing: "border-box",
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
    fontFamily: "inherit",
  },
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
  facilityName: {
    fontSize: "13px",
    color: "#7f8c8d",
    marginTop: "2px",
    display: "block",
  },
  mainContent: { padding: "30px", maxWidth: "1000px", margin: "0 auto" },
  statusText: {
    textAlign: "center",
    color: "#7f8c8d",
    marginTop: "80px",
    fontSize: "16px",
  },
  // 요약 카드
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    padding: "20px 30px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "24px",
  },
  summaryItem: { display: "flex", flexDirection: "column", gap: "4px" },
  summaryLabel: {
    fontSize: "11px",
    color: "#95a5a6",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  summaryValue: { fontSize: "15px", color: "#2c3e50", fontWeight: "600" },
  summaryDivider: { width: "1px", height: "36px", backgroundColor: "#eaeaea" },
  // 섹션 헤더
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: 0,
  },
  // 메뉴 그리드
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  menuImage: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
  },
  menuImageFallback: {
    width: "100%",
    height: "160px",
    backgroundColor: "#f0f3f8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
  },
  menuBody: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  menuName: { fontSize: "15px", fontWeight: "700", color: "#2c3e50" },
  menuDesc: { fontSize: "13px", color: "#7f8c8d", lineHeight: "1.5" },
  menuPrice: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#11998e",
    marginTop: "4px",
  },
  emptyBox: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "60px",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  emptyText: { color: "#aaa", fontSize: "15px" },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    padding: "24px 30px",
    marginBottom: "16px",
    borderLeft: "4px solid #11998e",
  },
  restaurantName: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0 0 8px 0",
  },
  restaurantAddress: {
    fontSize: "13px",
    color: "#7f8c8d",
    margin: "0 0 8px 0",
  },
  restaurantDesc: {
    fontSize: "14px",
    color: "#555",
    lineHeight: "1.6",
    margin: 0,
  },
  addMenuBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg,#11998e,#38ef7d)",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 3px 10px rgba(17,153,142,0.3)",
  },

  menuActions: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
    paddingTop: "10px",
    borderTop: "1px solid #f0f2f7",
  },
  editBtn: {
    flex: 1,
    padding: "7px 0",
    borderRadius: "7px",
    border: "1.5px solid #3498db",
    background: "#fff",
    color: "#3498db",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  deleteBtn: {
    flex: 1,
    padding: "7px 0",
    borderRadius: "7px",
    border: "1.5px solid #e74c3c",
    background: "#fff",
    color: "#e74c3c",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "inherit",
  },

  soldOutBtn: {
    flex: 1,
    padding: "7px 0",
    borderRadius: "7px",
    border: "1.5px solid #f39c12",
    background: "#fff",
    color: "#f39c12",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "inherit",
  },
  availableBtn: {
    flex: 1,
    padding: "7px 0",
    borderRadius: "7px",
    border: "1.5px solid #27ae60",
    background: "#fff",
    color: "#27ae60",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "inherit",
  },
  restoreBtn: {
    flex: 1,
    padding: "7px 0",
    borderRadius: "7px",
    border: "1.5px solid #8e44ad",
    background: "#fff",
    color: "#8e44ad",
    fontSize: "12px",
    fontWeight: "700",
    fontFamily: "inherit",
  },
};

export default RestaurantMenuPage;
