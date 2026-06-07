import React, { useState, useEffect } from "react";
import { createFacilityPackageApi } from "../api/facilityPackageApi";
import { fetchFacilityPricingApi } from "../api/facilityApi";

// ── Config ──
const TYPE_CONFIG = {
  SPORT: {
    icon: "⚽",
    label: "스포츠 패키지",
    gradient: "linear-gradient(135deg,#667eea,#764ba2)",
    accentColor: "#667eea",
    lightBg: "#f3f2ff",
    lightBorder: "#d4d0f8",
    lightText: "#4a42b8",
  },
  MOTEL: {
    icon: "🏨",
    label: "모텔 패키지",
    gradient: "linear-gradient(135deg,#f7971e,#ffd200)",
    accentColor: "#f7971e",
    lightBg: "#fff8ed",
    lightBorder: "#fde4b0",
    lightText: "#b56b00",
  },
  RESTAURANT: {
    icon: "🍽️",
    label: "음식점 패키지",
    gradient: "linear-gradient(135deg,#11998e,#38ef7d)",
    accentColor: "#11998e",
    lightBg: "#f0fdf9",
    lightBorder: "#c6f0e6",
    lightText: "#0f6e56",
  },
};

const PRICING_TYPES = [
  { value: "HOURLY", label: "🕐 시간제" },
  { value: "NIGHT", label: "🌙 1박" },
];

// ── Field Component ──
function Field({ label, required, children }) {
  return (
    <div style={s.formGroup}>
      <label style={s.label}>
        {label} {required && <span style={{ color: "#e74c3c" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ── PriceInfoBox: hiển thị giá gốc cho SPORT / MOTEL ──
function PriceInfoBox({ pricing, facilityType, cfg, loading, error }) {
  if (loading) {
    return (
      <div
        style={{
          ...s.priceBox,
          background: cfg.lightBg,
          borderColor: cfg.lightBorder,
        }}
      >
        <div style={s.priceBoxSpinner} />
        <span style={{ fontSize: "12px", color: cfg.lightText }}>
          기준 요금 불러오는 중...
        </span>
      </div>
    );
  }
  if (error || !pricing) return null;

  const rows = [];
  if (facilityType === "SPORT" && pricing.hourPrice != null) {
    rows.push({ label: "시간당 기준가", value: pricing.hourPrice });
  }
  if (facilityType === "MOTEL") {
    if (pricing.hourPrice != null)
      rows.push({ label: "시간제 기준가", value: pricing.hourPrice });
    if (pricing.nightPrice != null)
      rows.push({ label: "1박 기준가", value: pricing.nightPrice });
  }
  if (rows.length === 0) return null;

  return (
    <div
      style={{
        ...s.priceBox,
        background: cfg.lightBg,
        borderColor: cfg.lightBorder,
      }}
    >
      <span style={{ ...s.priceBoxTitle, color: cfg.lightText }}>
        💡 기준 요금 참고
      </span>
      <div style={s.priceBoxRows}>
        {rows.map(({ label, value }) => (
          <div key={label} style={s.priceBoxRow}>
            <span style={{ ...s.priceBoxLabel, color: cfg.lightText }}>
              {label}
            </span>
            <span style={{ ...s.priceBoxValue, color: cfg.accentColor }}>
              {Number(value).toLocaleString("ko-KR")}원
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sport Fields ──
function SportFields({
  data,
  onChange,
  disabled,
  pricing,
  pricingLoading,
  pricingError,
  cfg,
}) {
  return (
    <>
      <PriceInfoBox
        pricing={pricing}
        facilityType="SPORT"
        cfg={cfg}
        loading={pricingLoading}
        error={pricingError}
      />
      <div style={s.row}>
        <Field label="시작 시간" required>
          <input
            style={s.input}
            type="time"
            value={data.startTime || ""}
            onChange={(e) => onChange("startTime", e.target.value)}
            disabled={disabled}
          />
        </Field>
        <Field label="종료 시간" required>
          <input
            style={s.input}
            type="time"
            value={data.endTime || ""}
            onChange={(e) => onChange("endTime", e.target.value)}
            disabled={disabled}
          />
        </Field>
      </div>
    </>
  );
}

// ── Motel Fields ──
function MotelFields({
  data,
  onChange,
  disabled,
  pricing,
  pricingLoading,
  pricingError,
  cfg,
}) {
  return (
    <>
      <PriceInfoBox
        pricing={pricing}
        facilityType="MOTEL"
        cfg={cfg}
        loading={pricingLoading}
        error={pricingError}
      />
      <Field label="요금 유형" required>
        <div style={s.segmentRow}>
          {PRICING_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              style={{
                ...s.segmentBtn,
                background:
                  data.pricingType === value
                    ? "linear-gradient(135deg,#f7971e,#ffd200)"
                    : "#f0f2f7",
                color: data.pricingType === value ? "#fff" : "#2c3e50",
                border:
                  data.pricingType === value ? "none" : "1.5px solid #e2e6ee",
                fontWeight: data.pricingType === value ? "700" : "500",
              }}
              onClick={() => onChange("pricingType", value)}
              disabled={disabled}
            >
              {label}
            </button>
          ))}
        </div>
      </Field>
      <div style={s.row}>
        <Field label="체크인" required>
          <input
            style={s.input}
            type="time"
            value={data.checkIn || ""}
            onChange={(e) => onChange("checkIn", e.target.value)}
            disabled={disabled}
          />
        </Field>
        <Field label="체크아웃" required>
          <input
            style={s.input}
            type="time"
            value={data.checkOut || ""}
            onChange={(e) => onChange("checkOut", e.target.value)}
            disabled={disabled}
          />
        </Field>
      </div>
    </>
  );
}

// ── Menu Item Card ──
function MenuItemCard({ menu, selected, onToggle, disabled }) {
  return (
    <div
      onClick={() => !disabled && onToggle(menu.id)}
      style={{
        ...s.menuCard,
        border: selected ? "2px solid #11998e" : "1.5px solid #e2e6ee",
        background: selected ? "#f0fdf9" : "#fafbfc",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <div
        style={{
          ...s.menuCheckbox,
          background: selected ? "#11998e" : "#fff",
          border: selected ? "2px solid #11998e" : "2px solid #c5cde6",
        }}
      >
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {menu.imageUrl ? (
        <img
          src={menu.imageUrl}
          alt={menu.name}
          style={s.menuImg}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        style={{
          ...s.menuImgFallback,
          display: menu.imageUrl ? "none" : "flex",
        }}
      >
        🍴
      </div>

      <div style={s.menuInfo}>
        <span style={s.menuName}>{menu.name}</span>
        {menu.description && <span style={s.menuDesc}>{menu.description}</span>}
        <span style={s.menuPrice}>
          {Number(menu.price).toLocaleString("ko-KR")}원
        </span>
      </div>
    </div>
  );
}

// ── Restaurant Fields ──
function RestaurantFields({
  data,
  onChange,
  disabled,
  menus,
  menusLoading,
  menusError,
}) {
  const selectedIds = data.menuIds || [];

  const toggleMenu = (menuId) => {
    const id = String(menuId);
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange("menuIds", next);
  };

  const totalPrice = menus
    .filter((m) => selectedIds.includes(String(m.id)))
    .reduce((sum, m) => sum + Number(m.price), 0);

  return (
    <>
      <Field label="최대 인원" required>
        <input
          style={s.input}
          type="number"
          min="1"
          placeholder="예: 4"
          value={data.capacity || ""}
          onChange={(e) => onChange("capacity", e.target.value)}
          disabled={disabled}
        />
      </Field>

      <Field label="포함 메뉴 (에피타이저)" required>
        {menusLoading ? (
          <div style={s.menuState}>
            <div style={s.menuStateSpinner} />
            <span style={s.menuStateText}>메뉴를 불러오는 중...</span>
          </div>
        ) : menusError ? (
          <div
            style={{
              ...s.menuState,
              borderColor: "#f5c6cb",
              background: "#fff5f5",
            }}
          >
            <span style={{ fontSize: "20px" }}>⚠️</span>
            <span style={{ ...s.menuStateText, color: "#e74c3c" }}>
              메뉴를 불러오지 못했습니다
            </span>
            <span style={{ fontSize: "11px", color: "#b2bec3" }}>
              {menusError}
            </span>
          </div>
        ) : menus.length === 0 ? (
          <div style={s.menuState}>
            <span style={{ fontSize: "24px" }}>🍴</span>
            <span style={s.menuStateText}>등록된 메뉴가 없습니다</span>
          </div>
        ) : (
          <>
            <div style={s.menuGrid}>
              {menus.map((menu) => (
                <MenuItemCard
                  key={menu.id}
                  menu={menu}
                  selected={selectedIds.includes(String(menu.id))}
                  onToggle={toggleMenu}
                  disabled={disabled}
                />
              ))}
            </div>
            <div
              style={{
                ...s.menuSummary,
                background: selectedIds.length > 0 ? "#f0fdf9" : "#f8f9fc",
                border:
                  selectedIds.length > 0
                    ? "1px solid #c6f0e6"
                    : "1px solid #e2e6ee",
              }}
            >
              <span
                style={{
                  ...s.menuSummaryLeft,
                  color: selectedIds.length > 0 ? "#0f6e56" : "#9ba5b4",
                }}
              >
                {selectedIds.length > 0
                  ? `${selectedIds.length}개 메뉴 선택됨`
                  : "메뉴를 1개 이상 선택해주세요"}
              </span>
              {selectedIds.length > 0 && (
                <span style={s.menuSummaryPrice}>
                  원가 합계 {totalPrice.toLocaleString("ko-KR")}원
                </span>
              )}
            </div>
          </>
        )}
      </Field>
    </>
  );
}

// ── Main Modal ──
export default function AddPackageModal({
  facilityId,
  facilityType,
  onClose,
  onSave,
}) {
  const cfg = TYPE_CONFIG[facilityType] || TYPE_CONFIG.SPORT;

  const [base, setBase] = useState({
    packageName: "",
    note: "",
    salePrice: "",
  });
  const [extra, setExtra] = useState({
    startTime: "",
    endTime: "",
    pricingType: "HOURLY",
    checkIn: "",
    checkOut: "",
    capacity: "",
    menuIds: [],
  });

  // ── Pricing state (chung cho tất cả loại) ──
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch pricing khi modal mở (mọi loại) ──
  useEffect(() => {
    const load = async () => {
      setPricingLoading(true);
      setPricingError(null);
      try {
        const data = await fetchFacilityPricingApi(facilityId);
        setPricing(data);
      } catch (e) {
        setPricingError(e.message || "알 수 없는 오류");
      } finally {
        setPricingLoading(false);
      }
    };
    load();
  }, [facilityId]);

  // menus: lấy từ pricing nếu là RESTAURANT
  const menus =
    facilityType === "RESTAURANT" && pricing?.__typename === "Restaurant"
      ? (pricing.menus ?? [])
      : [];
  const menusLoading = facilityType === "RESTAURANT" && pricingLoading;
  const menusError = facilityType === "RESTAURANT" ? pricingError : null;

  const setBaseField = (key, val) =>
    setBase((prev) => ({ ...prev, [key]: val }));
  const setExtraField = (key, val) =>
    setExtra((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    if (!base.packageName.trim()) return "패키지 이름을 입력해주세요.";
    if (!base.salePrice || Number(base.salePrice) < 0)
      return "올바른 판매 가격을 입력해주세요.";
    if (facilityType === "SPORT") {
      if (!extra.startTime) return "시작 시간을 입력해주세요.";
      if (!extra.endTime) return "종료 시간을 입력해주세요.";
      if (extra.startTime >= extra.endTime)
        return "시작 시간은 종료 시간보다 이전이어야 합니다.";
    }
    if (facilityType === "MOTEL") {
      if (!extra.pricingType) return "요금 유형을 선택해주세요.";
      if (!extra.checkIn) return "체크인 시간을 입력해주세요.";
      if (!extra.checkOut) return "체크아웃 시간을 입력해주세요.";
    }
    if (facilityType === "RESTAURANT") {
      if (!extra.capacity || Number(extra.capacity) < 1)
        return "최대 인원은 1명 이상이어야 합니다.";
    }
    return null;
  };

  const buildPayload = () => {
    const common = {
      facilityId: Number(facilityId),
      facilityType,
      packageName: base.packageName.trim(),
      note: base.note.trim() || undefined,
      salePrice: Number(base.salePrice),
    };
    if (facilityType === "SPORT")
      return { ...common, startTime: extra.startTime, endTime: extra.endTime };
    if (facilityType === "MOTEL")
      return {
        ...common,
        pricingType: extra.pricingType,
        checkIn: extra.checkIn,
        checkOut: extra.checkOut,
      };
    if (facilityType === "RESTAURANT")
      return {
        ...common,
        capacity: Number(extra.capacity),
        menuIds: extra.menuIds.map(Number),
      };
    return common;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) return setError(err);
    setLoading(true);
    setError(null);
    try {
      await createFacilityPackageApi(buildPayload());
      onSave();
      onClose();
    } catch (e) {
      setError(e.message || "패키지 추가 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={s.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={s.modal}>
        <div style={{ ...s.strip, background: cfg.gradient }} />
        <button style={s.closeBtn} onClick={onClose}>
          ✕
        </button>

        <h2 style={s.title}>
          {cfg.icon} {cfg.label} 추가
        </h2>

        <Field label="패키지 이름" required>
          <input
            style={s.input}
            placeholder="예: 주말 특가 패키지"
            value={base.packageName}
            onChange={(e) => setBaseField("packageName", e.target.value)}
            disabled={loading}
          />
        </Field>

        <Field
          label="할인가 (원) - 원가는 세트에 있는 메뉴들의 가격으로 계산됩니다"
          required
        >
          <input
            style={s.input}
            type="number"
            min="0"
            placeholder="예: 50000"
            value={base.salePrice}
            onChange={(e) => setBaseField("salePrice", e.target.value)}
            disabled={loading}
          />
        </Field>

        <Field label="메모">
          <textarea
            style={s.textarea}
            placeholder="패키지 관련 메모를 입력하세요 (선택)"
            value={base.note}
            onChange={(e) => setBaseField("note", e.target.value)}
            disabled={loading}
          />
        </Field>

        <div style={s.divider}>
          <span style={s.dividerLabel}>{cfg.icon} 상세 정보</span>
        </div>

        {facilityType === "SPORT" && (
          <SportFields
            data={extra}
            onChange={setExtraField}
            disabled={loading}
            pricing={pricing}
            pricingLoading={pricingLoading}
            pricingError={pricingError}
            cfg={cfg}
          />
        )}
        {facilityType === "MOTEL" && (
          <MotelFields
            data={extra}
            onChange={setExtraField}
            disabled={loading}
            pricing={pricing}
            pricingLoading={pricingLoading}
            pricingError={pricingError}
            cfg={cfg}
          />
        )}
        {facilityType === "RESTAURANT" && (
          <RestaurantFields
            data={extra}
            onChange={setExtraField}
            disabled={loading}
            menus={menus}
            menusLoading={menusLoading}
            menusError={menusError}
          />
        )}

        {error && <p style={s.errorMsg}>⚠️ {error}</p>}

        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose} disabled={loading}>
            취소
          </button>
          <button
            style={{
              ...s.saveBtn,
              background: loading ? "#b2bec3" : cfg.gradient,
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

const s = {
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
    width: "100%",
    maxWidth: "460px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    paddingBottom: "24px",
  },
  strip: { height: "6px", borderRadius: "18px 18px 0 0" },
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
    margin: "20px 28px 20px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "14px",
    padding: "0 28px",
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
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    padding: "0 28px",
    marginBottom: "0",
  },
  segmentRow: { display: "flex", gap: "8px" },
  segmentBtn: {
    flex: 1,
    padding: "9px 0",
    borderRadius: "8px",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .15s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 28px 16px",
  },
  dividerLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#95a5a6",
    textTransform: "uppercase",
    letterSpacing: ".5px",
    whiteSpace: "nowrap",
  },
  // ── Price info box ──
  priceBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    margin: "0 28px 16px",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1.5px solid",
  },
  priceBoxTitle: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: ".5px",
  },
  priceBoxRows: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  priceBoxRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceBoxLabel: {
    fontSize: "12.5px",
    fontWeight: "500",
  },
  priceBoxValue: {
    fontSize: "13.5px",
    fontWeight: "700",
  },
  priceBoxSpinner: {
    width: "14px",
    height: "14px",
    border: "2px solid #e2e6ee",
    borderTop: "2px solid currentColor",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    alignSelf: "center",
  },
  // ── Menu ──
  menuGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  menuCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "10px",
    transition: "border .15s, background .15s",
    userSelect: "none",
    boxSizing: "border-box",
  },
  menuCheckbox: {
    width: "18px",
    height: "18px",
    borderRadius: "5px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all .15s",
  },
  menuImg: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    objectFit: "cover",
    flexShrink: 0,
  },
  menuImgFallback: {
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    background: "#f0f2f7",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  menuInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
    minWidth: 0,
  },
  menuName: {
    fontSize: "13.5px",
    fontWeight: "600",
    color: "#1e2b3a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  menuDesc: {
    fontSize: "11.5px",
    color: "#9ba5b4",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  menuPrice: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#11998e",
  },
  menuSummary: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "10px",
    padding: "8px 12px",
    borderRadius: "8px",
    transition: "all .2s",
  },
  menuSummaryLeft: { fontSize: "12px", fontWeight: "600" },
  menuSummaryPrice: { fontSize: "12px", fontWeight: "700", color: "#11998e" },
  menuState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "28px 24px",
    border: "2px dashed #c5cde6",
    borderRadius: "10px",
    background: "#f8f9fc",
  },
  menuStateSpinner: {
    width: "20px",
    height: "20px",
    border: "2.5px solid #e2e6ee",
    borderTop: "2.5px solid #11998e",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  menuStateText: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#7f8c8d",
  },
  errorMsg: {
    color: "#e74c3c",
    fontSize: "13px",
    margin: "8px 28px 0",
    textAlign: "center",
  },
  footer: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    padding: "20px 28px 0",
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
