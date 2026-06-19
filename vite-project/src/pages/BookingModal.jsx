import { useState, useEffect, useCallback } from "react";
import { getCookie } from "../api/cookie";

// ── GraphQL query lấy ngày đã đặt ───────────────────────────────────────────
const GET_BOOKED_DATES = `
  query GetBookedDates($packageId: ID!) {
    facilityPackage(packageId: $packageId) {
      selectedDate
    }
  }
`;

const PAY_METHODS = [
  { value: "KAKAO_PAY", label: "카카오페이", emoji: "💛", discount: 10 },
  { value: "NAVER_PAY", label: "네이버페이", emoji: "💚", discount: 5 },
  { value: "APPLE_PAY", label: "애플페이", emoji: "🍎", discount: 20 },
];

// ── Helper: tạo lịch tháng ───────────────────────────────────────────────────
function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function toDateStr(year, month, day) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

// ── BookingModal ─────────────────────────────────────────────────────────────
export default function BookingModal({
  pkg,
  facilityType,
  onClose,
  onSuccess,
}) {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [payMethod, setPayMethod] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isRestaurant = facilityType === "RESTAURANT";
  const packageId = pkg?.id;
  const pkgName = pkg?.infoDetails?.packageName || "패키지";
  const salePrice = pkg?.infoDetails?.salePrice;
  const price =
    salePrice != null && salePrice > 0 ? salePrice : pkg?.infoDetails?.price;
  const startTimePkg = pkg?.packageTarget?.startTime;

  // 선택된 결제 수단 & 최종 금액 계산
  const selectedPayMethod = PAY_METHODS.find((p) => p.value === payMethod);
  const discountRate = selectedPayMethod?.discount ?? 0;
  const finalPrice =
    price != null ? Math.round(price * (1 - discountRate / 100)) : null;

  // ── Fetch booked dates ──────────────────────────────────────────────────────
  const fetchBookedDates = useCallback(async () => {
    if (!packageId) return;
    setLoadingDates(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: GET_BOOKED_DATES,
          variables: { packageId },
        }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);
      setBookedDates(json.data?.facilityPackage?.selectedDate || []);
    } catch (err) {
      console.error("Lỗi fetch booked dates:", err);
      setBookedDates([]);
    } finally {
      setLoadingDates(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchBookedDates();
  }, [fetchBookedDates]);

  // ── Submit booking ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selectedDate) return setError("날짜를 선택해주세요.");
    if (isRestaurant && !startTime)
      return setError("시작 시간을 입력해주세요.");
    if (!payMethod) return setError("결제 수단을 선택해주세요.");

    setError("");
    setSubmitting(true);

    const csrfToken = getCookie("XSRF-TOKEN");
    const body = {
      packageId: Number(packageId),
      usageDate: selectedDate,
      payMethod,
      ...(isRestaurant && startTime ? { startTime } : {}),
    };

    try {
      const res = await fetch(import.meta.env.VITE_API_URL + "/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {}),
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      onSuccess?.(data);
      onClose();
    } catch (err) {
      setError(err.message || "예약 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Calendar helpers ────────────────────────────────────────────────────────
  const cells = buildCalendar(calYear, calMonth);
  const todayStr = toDateStr(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else setCalMonth((m) => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else setCalMonth((m) => m + 1);
    setSelectedDate(null);
  };

  const MONTH_NAMES = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];
  const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={s.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h2 style={s.title}>📅 예약하기</h2>
            <p style={s.subtitle}>{pkgName}</p>
          </div>
          <button style={s.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={s.body}>
          {/* ── 1. 날짜 선택 (Calendar) ── */}
          <div style={s.block}>
            <label style={s.label}>
              1. 날짜 선택 <span style={s.required}>*</span>
            </label>

            {loadingDates ? (
              <p style={s.hint}>⏳ 예약 현황 불러오는 중...</p>
            ) : (
              <div style={s.calendar}>
                {/* Month nav */}
                <div style={s.calNav}>
                  <button style={s.calNavBtn} onClick={prevMonth}>
                    ‹
                  </button>
                  <span style={s.calMonthLabel}>
                    {calYear}년 {MONTH_NAMES[calMonth]}
                  </span>
                  <button style={s.calNavBtn} onClick={nextMonth}>
                    ›
                  </button>
                </div>

                {/* Day headers */}
                <div style={s.calGrid}>
                  {DAY_NAMES.map((d, i) => (
                    <div
                      key={d}
                      style={{
                        ...s.calDayHeader,
                        color:
                          i === 0 ? "#e74c3c" : i === 6 ? "#3b5bdb" : "#7f8c8d",
                      }}
                    >
                      {d}
                    </div>
                  ))}

                  {/* Cells */}
                  {cells.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} />;

                    const dateStr = toDateStr(calYear, calMonth, day);
                    const isBooked = bookedDates.includes(dateStr);
                    const isPast = dateStr < todayStr;
                    const isSelected = selectedDate === dateStr;
                    const disabled = isRestaurant ? isPast : isBooked || isPast;
                    const col = idx % 7;

                    return (
                      <button
                        key={dateStr}
                        disabled={disabled}
                        style={{
                          ...s.calCell,
                          ...(isSelected ? s.calCellSelected : {}),
                          ...(!isRestaurant && isBooked ? s.calCellBooked : {}),
                          ...(isPast ? s.calCellPast : {}),
                          ...(!disabled && col === 0
                            ? { color: "#e74c3c" }
                            : {}),
                          ...(!disabled && col === 6
                            ? { color: "#3b5bdb" }
                            : {}),
                        }}
                        onClick={() => !disabled && setSelectedDate(dateStr)}
                      >
                        {day}
                        {!isRestaurant && isBooked && (
                          <span style={s.bookedDot} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={s.legend}>
                  <span style={s.legendItem}>
                    <span
                      style={{
                        ...s.legendDot,
                        background: "#e8f5e9",
                        border: "2px solid #4CAF50",
                      }}
                    />{" "}
                    선택
                  </span>
                  <span style={s.legendItem}>
                    <span style={{ ...s.legendDot, background: "#fff0f0" }} />
                    예약불가
                  </span>
                  <span style={s.legendItem}>
                    <span style={{ ...s.legendDot, background: "#f0f0f0" }} />
                    지난날짜
                  </span>
                </div>
              </div>
            )}

            {selectedDate && (
              <p style={s.selectedDateBadge}>
                ✅ 선택된 날짜: <strong>{selectedDate}</strong>
              </p>
            )}
          </div>

          {/* ── 2. 시작 시간 (RESTAURANT only) ── */}
          {isRestaurant && (
            <div style={s.block}>
              <label style={s.label}>
                2. 시작 시간 <span style={s.required}>*</span>
                <span style={s.hint2}>(레스토랑 예약)</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={s.timeInput}
              />
            </div>
          )}

          {/* ── 결제 수단 ── */}
          <div style={s.block}>
            <label style={s.label}>
              {isRestaurant ? "3." : "2."} 결제 수단{" "}
              <span style={s.required}>*</span>
            </label>
            <div style={s.payRow}>
              {PAY_METHODS.map((pm) => {
                const isActive = payMethod === pm.value;
                const discountedPrice =
                  price != null
                    ? Math.round(price * (1 - pm.discount / 100))
                    : null;
                return (
                  <button
                    key={pm.value}
                    style={{
                      ...s.payBtn,
                      ...(isActive ? s.payBtnActive : {}),
                    }}
                    onClick={() => setPayMethod(pm.value)}
                  >
                    {/* 상단: 이모지 + 이름 + 할인 배지 */}
                    <div style={s.payBtnTop}>
                      <span style={s.payEmoji}>{pm.emoji}</span>
                      <span style={s.payLabel}>{pm.label}</span>
                      <span
                        style={{
                          ...s.discountBadge,
                          ...(isActive ? s.discountBadgeActive : {}),
                        }}
                      >
                        -{pm.discount}%
                      </span>
                    </div>
                    {/* 하단: 할인 적용 금액 */}
                    {discountedPrice != null && (
                      <div
                        style={{
                          ...s.payBtnPrice,
                          ...(isActive ? { color: "#2e7d32" } : {}),
                        }}
                      >
                        {discountedPrice.toLocaleString()}원
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 요약 ── */}
          <div style={s.summary}>
            <div style={s.summaryRow}>
              <span style={s.summaryKey}>패키지</span>
              <span style={s.summaryVal}>{pkgName}</span>
            </div>
            {!isRestaurant && startTimePkg && (
              <div style={s.summaryRow}>
                <span style={s.summaryKey}>이용 시간</span>
                <span style={s.summaryVal}>
                  {startTimePkg} ~ {pkg?.packageTarget?.endTime}
                </span>
              </div>
            )}
            <div style={s.summaryRow}>
              <span style={s.summaryKey}>날짜</span>
              <span style={s.summaryVal}>{selectedDate || "—"}</span>
            </div>
            {isRestaurant && (
              <div style={s.summaryRow}>
                <span style={s.summaryKey}>시작 시간</span>
                <span style={s.summaryVal}>{startTime || "—"}</span>
              </div>
            )}
            <div style={s.summaryRow}>
              <span style={s.summaryKey}>결제 수단</span>
              <span style={s.summaryVal}>
                {selectedPayMethod
                  ? `${selectedPayMethod.emoji} ${selectedPayMethod.label}`
                  : "—"}
              </span>
            </div>

            {/* 결제 금액 */}
            <div
              style={{
                ...s.summaryRow,
                marginTop: "8px",
                borderTop: "1px solid #eee",
                paddingTop: "10px",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  ...s.summaryKey,
                  fontWeight: "bold",
                  color: "#2c3e50",
                }}
              >
                결제 금액
              </span>
              <div style={{ textAlign: "right" }}>
                {/* 원가 취소선 (할인이 있을 때만) */}
                {payMethod && discountRate > 0 && price != null && (
                  <div style={s.originalPrice}>
                    {Number(price).toLocaleString()}원
                  </div>
                )}
                {/* 최종 금액 */}
                <span style={s.finalPrice}>
                  {finalPrice != null
                    ? finalPrice.toLocaleString() + "원"
                    : "—"}
                </span>
                {/* 할인 적용 안내 */}
                {payMethod && discountRate > 0 && (
                  <div style={s.discountApplied}>
                    {selectedPayMethod?.emoji} {discountRate}% 할인 적용
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <div style={s.errorBox}>⚠️ {error}</div>}
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button
            style={{
              ...s.submitBtn,
              ...(submitting ? s.submitBtnDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "처리 중..." : "예약 확인 →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "480px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "20px 24px 16px",
    borderBottom: "1px solid #eaeaea",
  },
  title: { fontSize: "18px", fontWeight: "bold", color: "#2c3e50", margin: 0 },
  subtitle: { fontSize: "13px", color: "#7f8c8d", margin: "4px 0 0 0" },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#aaa",
    padding: "4px 6px",
    lineHeight: 1,
  },
  body: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  /* Block */
  block: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: "bold", color: "#2c3e50" },
  required: { color: "#e74c3c", marginLeft: "2px" },
  hint: { fontSize: "12px", color: "#aaa" },
  hint2: {
    fontSize: "11px",
    color: "#aaa",
    fontWeight: "normal",
    marginLeft: "6px",
  },

  /* Calendar */
  calendar: {
    border: "1px solid #eaeaea",
    borderRadius: "10px",
    overflow: "hidden",
    backgroundColor: "#fafafa",
  },
  calNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #f0f0f0",
  },
  calNavBtn: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    color: "#555",
    padding: "2px 8px",
    borderRadius: "4px",
  },
  calMonthLabel: { fontSize: "14px", fontWeight: "bold", color: "#2c3e50" },
  calGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: "2px",
    padding: "8px",
  },
  calDayHeader: {
    textAlign: "center",
    fontSize: "11px",
    fontWeight: "bold",
    padding: "4px 0",
  },
  calCell: {
    position: "relative",
    textAlign: "center",
    padding: "7px 2px",
    fontSize: "13px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: "#2c3e50",
  },
  calCellSelected: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontWeight: "bold",
  },
  calCellBooked: {
    backgroundColor: "#fff0f0",
    color: "#ccc",
    cursor: "not-allowed",
  },
  calCellPast: {
    backgroundColor: "transparent",
    color: "#ccc",
    cursor: "not-allowed",
  },
  bookedDot: {
    position: "absolute",
    bottom: "3px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4px",
    height: "4px",
    borderRadius: "50%",
    backgroundColor: "#e74c3c",
  },
  legend: {
    display: "flex",
    gap: "14px",
    padding: "8px 12px",
    borderTop: "1px solid #f0f0f0",
    backgroundColor: "#fff",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "11px",
    color: "#999",
  },
  legendDot: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    borderRadius: "3px",
  },
  selectedDateBadge: {
    fontSize: "13px",
    color: "#2e7d32",
    backgroundColor: "#e8f5e9",
    border: "1px solid #c8e6c9",
    borderRadius: "6px",
    padding: "6px 12px",
    margin: 0,
  },

  /* Time input */
  timeInput: {
    padding: "10px 12px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
    width: "160px",
  },

  /* Pay methods */
  payRow: {
    display: "flex",
    gap: "8px",
  },
  payBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    padding: "12px 14px",
    fontSize: "13px",
    fontWeight: "500",
    borderRadius: "10px",
    border: "1.5px solid #e0e0e0",
    backgroundColor: "#fafafa",
    cursor: "pointer",
    color: "#34495e",
    flex: "1 1 0",
    minWidth: 0,
    transition: "all 0.15s ease",
  },
  payBtnActive: {
    border: "2px solid #4CAF50",
    backgroundColor: "#f0faf0",
    color: "#2e7d32",
    fontWeight: "bold",
    boxShadow: "0 2px 10px rgba(76,175,80,0.18)",
  },
  payBtnTop: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    width: "100%",
  },
  payLabel: {
    flex: 1,
    fontSize: "12px",
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  payEmoji: { fontSize: "16px", flexShrink: 0 },
  discountBadge: {
    fontSize: "10px",
    fontWeight: "bold",
    backgroundColor: "#fff3cd",
    color: "#856404",
    border: "1px solid #ffc107",
    borderRadius: "4px",
    padding: "1px 5px",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  discountBadgeActive: {
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #4CAF50",
  },
  payBtnPrice: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#2c3e50",
  },

  /* Summary */
  summary: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #eee",
    borderRadius: "10px",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryKey: { fontSize: "13px", color: "#7f8c8d" },
  summaryVal: { fontSize: "13px", color: "#2c3e50", fontWeight: "500" },
  originalPrice: {
    fontSize: "12px",
    color: "#bbb",
    textDecoration: "line-through",
    textAlign: "right",
    marginBottom: "2px",
  },
  finalPrice: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#e74c3c",
  },
  discountApplied: {
    fontSize: "11px",
    color: "#4CAF50",
    marginTop: "3px",
    textAlign: "right",
  },

  /* Error */
  errorBox: {
    backgroundColor: "#fff5f5",
    border: "1px solid #feb2b2",
    color: "#c53030",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
  },

  /* Footer */
  footer: {
    display: "flex",
    gap: "10px",
    padding: "16px 24px",
    borderTop: "1px solid #eaeaea",
    justifyContent: "flex-end",
  },
  cancelBtn: {
    padding: "10px 20px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    color: "#555",
    cursor: "pointer",
  },
  submitBtn: {
    padding: "10px 24px",
    fontSize: "14px",
    fontWeight: "bold",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    cursor: "pointer",
  },
  submitBtnDisabled: {
    backgroundColor: "#a5d6a7",
    cursor: "not-allowed",
  },
};
