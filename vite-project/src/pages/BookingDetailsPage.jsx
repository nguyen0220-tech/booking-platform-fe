import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchBookingDetail, cancelBooking } from "../api/bookingApi";
import { createReview } from "../api/reviewApi";

const STATUS_CONFIG = {
  PAID: {
    label: "결제 완료",
    color: "#155724",
    bg: "#d4edda",
    border: "#4CAF50",
  },
  COMPLETED: {
    label: "이용 완료",
    color: "#0c5460",
    bg: "#d1ecf1",
    border: "#bee5eb",
  },
  CANCELLED: {
    label: "취소됨",
    color: "#721c24",
    bg: "#f8d7da",
    border: "#f5c6cb",
  },
};

const PAY_METHOD_LABEL = {
  CARD: "신용카드",
  KAKAO_PAY: "카카오페이",
  NAVER_PAY: "네이버페이",
  TOSS: "토스",
  BANK_TRANSFER: "계좌이체",
};

// reviewEligibility.reviewStatus에 따른 버튼 표시 상태
// ELIGIBLE: 클릭 가능 / ALREADY_REVIEWED, EXPIRED, NOT_YET_COMPLETED: 비활성화(흐리게) / BOOKING_CANCELLED: 버튼 자체를 숨김
const REVIEW_STATUS_CONFIG = {
  ELIGIBLE: { label: "⭐ 이용 후기 작성", disabled: false },
  ALREADY_REVIEWED: { label: "✅ 후기 작성 완료", disabled: true },
  EXPIRED: { label: "⏰ 평가 기간이 만료되었습니다", disabled: true },
  NOT_YET_COMPLETED: {
    label: "예약을 아직 이용하지 않았습니다",
    disabled: true,
  },
};

function getStatus(status) {
  return (
    STATUS_CONFIG[status] ?? {
      label: status,
      color: "#555",
      bg: "#f0f0f0",
      border: "#ccc",
    }
  );
}

function formatAmount(amount) {
  return Number(amount).toLocaleString("ko-KR") + "원";
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// usageDate (예: "2025-06-10") 가 오늘보다 이전인지 확인
function isDatePast(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const usage = new Date(dateStr);
  usage.setHours(0, 0, 0, 0);
  return usage < today;
}

// ── 이미지 슬라이더 ───────────────────────────────────────────────────────────
function ImageSlider({ images, alt }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -40) next();
    else if (dx > 40) prev();
    touchStartX.current = null;
  };

  if (!images || images.length === 0) {
    return <div style={sl.empty}>🏢</div>;
  }

  return (
    <div style={sl.wrap} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <img src={images[current]} alt={`${alt} ${current + 1}`} style={sl.img} />
      <div style={sl.overlay} />
      {images.length > 1 && (
        <>
          <button
            style={{ ...sl.navBtn, left: "12px" }}
            onClick={prev}
            aria-label="이전 이미지"
          >
            ‹
          </button>
          <button
            style={{ ...sl.navBtn, right: "12px" }}
            onClick={next}
            aria-label="다음 이미지"
          >
            ›
          </button>
          <div style={sl.dots}>
            {images.map((_, i) => (
              <button
                key={i}
                style={{ ...sl.dot, ...(i === current ? sl.dotActive : {}) }}
                onClick={() => setCurrent(i)}
                aria-label={`이미지 ${i + 1}`}
              />
            ))}
          </div>
          <span style={sl.counter}>
            {current + 1} / {images.length}
          </span>
        </>
      )}
    </div>
  );
}

// ── MetaChip ──────────────────────────────────────────────────────────────────
function MetaChip({ icon, label, value }) {
  return (
    <div style={s.chip}>
      <span style={s.chipIcon}>{icon}</span>
      <span style={s.chipLabel}>{label}</span>
      <span style={s.chipValue}>{value}</span>
    </div>
  );
}

// ── ReviewModal ───────────────────────────────────────────────────────────────
function ReviewModal({ onClose, onSubmit, submitting, submitError }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit({ rating, content });
  };

  return (
    <div style={rm.backdrop} onClick={onClose}>
      <div style={rm.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={rm.title}>이용 후기 작성</h2>

        <div style={rm.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              style={rm.starBtn}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(n)}
              aria-label={`${n}점`}
            >
              <span
                style={{
                  ...rm.star,
                  color: n <= (hoverRating || rating) ? "#FFB800" : "#ddd",
                }}
              >
                ★
              </span>
            </button>
          ))}
        </div>

        <textarea
          style={rm.textarea}
          placeholder="이용 후기를 남겨주세요."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          maxLength={1000}
        />

        {submitError && <div style={rm.errorBox}>⚠️ {submitError}</div>}

        <div style={rm.actions}>
          <button style={rm.cancelBtn} onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button
            style={{
              ...rm.submitBtn,
              ...(rating === 0 || submitting ? rm.submitBtnDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
          >
            {submitting ? "등록 중..." : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── BookingDetailPage ─────────────────────────────────────────────────────────
export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // 리뷰 작성 관련 상태
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState("");
  // 리뷰 등록 성공 시 서버 재조회 없이 즉시 ALREADY_REVIEWED로 낙관적 반영
  const [reviewJustSubmitted, setReviewJustSubmitted] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("잘못된 접근입니다.");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchBookingDetail(bookingId);
        setBooking(data);
      } catch (err) {
        setError(err.message || "예약 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId]);

  const handleCancel = async () => {
    if (!window.confirm("정말로 예약을 취소하시겠습니까?")) return;
    setCancelling(true);
    setCancelError("");
    try {
      await cancelBooking(bookingId);
      setBooking((prev) => ({ ...prev, status: "CANCELLED" }));
    } catch (err) {
      setCancelError(err.message || "예약 취소에 실패했습니다.");
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async ({ rating, content }) => {
    setSubmittingReview(true);
    setReviewSubmitError("");
    try {
      await createReview({ bookingId, rating, content });
      setReviewJustSubmitted(true);
      setIsReviewModalOpen(false);
    } catch (err) {
      setReviewSubmitError(err.message || "리뷰 등록에 실패했습니다.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return (
      <div style={s.page}>
        <div style={s.center}>
          <div style={s.spinner} />
          <p style={s.loadingText}>예약 정보 불러오는 중...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div style={s.page}>
        <div style={s.errorBox}>
          <span>⚠️ {error}</span>
          <button style={s.retryBtn} onClick={() => navigate(-1)}>
            돌아가기
          </button>
        </div>
      </div>
    );

  if (!booking) return null;

  const st = getStatus(booking.status);
  const facilityId = booking.facility?.id;
  const facilityName = booking.facility?.facilityInfo?.name ?? "시설명 없음";
  const address = booking.facility?.facilityInfo?.address ?? "";
  const images = booking.facility?.imageUrls ?? [];
  const packageName =
    booking.packageInfo?.infoDetails?.packageName ?? "패키지명 없음";
  const note = booking.packageInfo?.infoDetails?.note ?? "";
  const isPaid = booking.status === "PAID";

  // usageDate가 오늘 이전이면 취소 버튼 숨김
  const isPast = isDatePast(booking.usageDate);

  // BOOKING_CANCELLED면 리뷰 버튼 자체를 숨긴다.
  // 리뷰를 방금 등록했다면(reviewJustSubmitted) 서버 값과 무관하게 완료 상태로 낙관적 표시.
  const rawReviewStatus = booking.reviewEligibility?.reviewStatus;
  const effectiveReviewStatus = reviewJustSubmitted
    ? "ALREADY_REVIEWED"
    : rawReviewStatus;
  const showReviewButton =
    !!effectiveReviewStatus && effectiveReviewStatus !== "BOOKING_CANCELLED";
  const reviewBtnConfig = REVIEW_STATUS_CONFIG[effectiveReviewStatus];

  const goToFacility = () => {
    if (facilityId) navigate(`/facilities/${facilityId}`);
  };

  return (
    <div style={s.page}>
      {/* 슬라이더 */}
      <ImageSlider images={images} alt={facilityName} />

      {/* 뒤로가기 */}
      <button
        style={s.backBtn}
        onClick={() => navigate(-1)}
        aria-label="목록으로"
      >
        ←
      </button>

      {/* ── 시설 헤더 ── */}
      <div style={s.headerCard}>
        <div style={s.headerRow}>
          <div style={s.headerInfo}>
            <h1
              style={{
                ...s.facilityName,
                ...(facilityId ? s.facilityNameClickable : {}),
              }}
              onClick={facilityId ? goToFacility : undefined}
              role={facilityId ? "button" : undefined}
              tabIndex={facilityId ? 0 : undefined}
              onKeyDown={
                facilityId
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") goToFacility();
                    }
                  : undefined
              }
            >
              {facilityName}
            </h1>
            {address && <p style={s.address}>📍 {address}</p>}
          </div>
          <span
            style={{
              ...s.badge,
              color: st.color,
              backgroundColor: st.bg,
              border: `1px solid ${st.border}`,
            }}
          >
            {st.label}
          </span>
        </div>
        <div style={s.packageRow}>
          <span style={s.packageTag}>📦 {packageName}</span>
          <span style={s.bookingId}>예약 #{booking.id}</span>
        </div>
      </div>

      <div style={s.content}>
        {/* ── 예약 일정 ── */}
        <section style={s.section}>
          <p style={s.sectionLabel}>예약 일정</p>
          <div style={s.chipGrid}>
            <MetaChip icon="📅" label="이용날짜" value={booking.usageDate} />
            <MetaChip
              icon="🕐"
              label="이용시간"
              value={`${booking.startTime}${booking.endTime ? ` ~ ${booking.endTime}` : ""}`}
            />
            <MetaChip
              icon="🗓️"
              label="예약일시"
              value={formatDateTime(booking.createdAt)}
            />{" "}
            {note && <MetaChip icon="📝" label="메모" value={note} />}
          </div>
        </section>

        {/* ── 결제 정보 ── */}
        <section style={s.section}>
          <p style={s.sectionLabel}>결제 정보</p>
          <div style={s.payGrid}>
            <div style={s.payCell}>
              <span style={s.payCellLabel}>결제수단</span>
              <span style={s.payCellValue}>
                {PAY_METHOD_LABEL[booking.payMethod] ?? booking.payMethod}
              </span>
            </div>
            <div style={{ ...s.payCell, borderLeft: "1px solid #f0f0f0" }}>
              <span style={s.payCellLabel}>기본요금</span>
              <span style={s.payCellValue}>
                {formatAmount(booking.basisPrice)}
              </span>
            </div>
          </div>
          <div style={s.totalCard}>
            <span style={s.totalLabel}>최종 결제금액</span>
            <span style={s.totalValue}>{formatAmount(booking.amount)}</span>
          </div>
        </section>

        {/* ── 액션 버튼 ── */}
        {(showReviewButton || (isPaid && !isPast)) && (
          <div style={s.actions}>
            {cancelError && (
              <div style={s.cancelErrorBox}>⚠️ {cancelError}</div>
            )}
            {showReviewButton && (
              <button
                style={{
                  ...s.reviewBtn,
                  ...(reviewBtnConfig?.disabled ? s.reviewBtnDone : {}),
                }}
                onClick={() => setIsReviewModalOpen(true)}
                disabled={reviewBtnConfig?.disabled}
              >
                {reviewBtnConfig?.label ?? "⭐ 이용 후기 작성"}
              </button>
            )}
            {/* isPast이면 취소 버튼 숨김 */}
            {isPaid && !isPast && (
              <button
                style={{
                  ...s.cancelBtn,
                  ...(cancelling ? s.cancelBtnDisabled : {}),
                }}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "취소 중..." : "예약 취소"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 리뷰 작성 모달 ── */}
      {isReviewModalOpen && (
        <ReviewModal
          onClose={() => {
            if (!submittingReview) {
              setIsReviewModalOpen(false);
              setReviewSubmitError("");
            }
          }}
          onSubmit={handleReviewSubmit}
          submitting={submittingReview}
          submitError={reviewSubmitError}
        />
      )}
    </div>
  );
}

// ── Slider Styles ─────────────────────────────────────────────────────────────
const sl = {
  wrap: {
    position: "relative",
    width: "100%",
    height: "280px",
    backgroundColor: "#e8e8e8",
    overflow: "hidden",
    userSelect: "none",
  },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  empty: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "64px",
    backgroundColor: "#f0f0f0",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 35%, transparent 60%, rgba(0,0,0,0.28) 100%)",
    pointerEvents: "none",
  },
  navBtn: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: "36px",
    height: "36px",
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  dots: {
    position: "absolute",
    bottom: "14px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "6px",
    zIndex: 2,
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.5)",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "transform 0.15s",
  },
  dotActive: { backgroundColor: "#fff", transform: "scale(1.4)" },
  counter: {
    position: "absolute",
    top: "12px",
    right: "14px",
    fontSize: "12px",
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: "20px",
    padding: "2px 10px",
    zIndex: 2,
  },
};

// ── Review Modal Styles ────────────────────────────────────────────────────────
const rm = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    width: "100%",
    maxWidth: "680px",
    backgroundColor: "#fff",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    padding: "24px 20px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  title: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
    textAlign: "center",
  },
  starsRow: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
  },
  starBtn: {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    lineHeight: 1,
  },
  star: {
    fontSize: "34px",
    transition: "color 0.1s",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #eaeaea",
    borderRadius: "12px",
    padding: "12px 14px",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
  },
  errorBox: {
    backgroundColor: "#fff5f5",
    border: "1px solid #feb2b2",
    color: "#c53030",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "13px",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  cancelBtn: {
    flex: 1,
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "#f4f4f4",
    color: "#555",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
  },
  submitBtn: {
    flex: 2,
    padding: "14px",
    fontSize: "15px",
    fontWeight: "700",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};

// ── Page Styles ───────────────────────────────────────────────────────────────
const s = {
  page: {
    maxWidth: "680px",
    margin: "0 auto",
    paddingBottom: "60px",
    fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    backgroundColor: "#f4f4f4",
    minHeight: "100vh",
    position: "relative",
  },

  backBtn: {
    position: "absolute",
    top: "14px",
    left: "14px",
    zIndex: 10,
    width: "36px",
    height: "36px",
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  headerCard: {
    backgroundColor: "#fff",
    padding: "18px 20px 14px",
    borderBottom: "1px solid #eee",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "12px",
  },
  headerInfo: { display: "flex", flexDirection: "column", gap: "3px" },
  facilityName: {
    fontSize: "19px",
    fontWeight: "700",
    color: "#1a1a2e",
    margin: 0,
    lineHeight: "1.3",
  },
  facilityNameClickable: {
    cursor: "pointer",
    textDecoration: "underline",
    textDecorationColor: "transparent",
    textUnderlineOffset: "3px",
    transition: "text-decoration-color 0.15s",
  },
  address: { fontSize: "13px", color: "#888", margin: 0 },
  badge: {
    flexShrink: 0,
    fontSize: "12px",
    fontWeight: "700",
    borderRadius: "20px",
    padding: "4px 12px",
    whiteSpace: "nowrap",
  },
  packageRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  packageTag: {
    fontSize: "13px",
    color: "#4CAF50",
    fontWeight: "600",
    backgroundColor: "#f0faf0",
    borderRadius: "8px",
    padding: "5px 12px",
  },
  bookingId: { fontSize: "12px", color: "#bbb" },

  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  section: { display: "flex", flexDirection: "column", gap: "8px" },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#bbb",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    margin: 0,
  },

  chipGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1px",
    backgroundColor: "#eaeaea",
    border: "1px solid #eaeaea",
    borderRadius: "14px",
    overflow: "hidden",
  },
  chip: {
    backgroundColor: "#fff",
    padding: "14px 14px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  chipIcon: { fontSize: "16px" },
  chipLabel: { fontSize: "11px", color: "#aaa", fontWeight: "600" },
  chipValue: {
    fontSize: "13px",
    color: "#1a1a2e",
    fontWeight: "600",
    lineHeight: "1.3",
  },

  payGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1px",
    backgroundColor: "#eaeaea",
    border: "1px solid #eaeaea",
    borderRadius: "14px",
    overflow: "hidden",
  },
  payCell: {
    backgroundColor: "#fff",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  payCellLabel: { fontSize: "11px", color: "#aaa", fontWeight: "600" },
  payCellValue: { fontSize: "14px", color: "#1a1a2e", fontWeight: "600" },

  totalCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    border: "1px solid #eaeaea",
    borderRadius: "14px",
    padding: "15px 18px",
  },
  totalLabel: { fontSize: "14px", fontWeight: "600", color: "#555" },
  totalValue: { fontSize: "20px", fontWeight: "800", color: "#4CAF50" },

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "4px",
  },
  reviewBtn: {
    width: "100%",
    padding: "15px",
    fontSize: "15px",
    fontWeight: "700",
    backgroundColor: "#4CAF50",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
  },
  reviewBtnDone: {
    backgroundColor: "#eee",
    color: "#999",
    cursor: "not-allowed",
  },
  cancelBtn: {
    width: "100%",
    padding: "15px",
    fontSize: "15px",
    fontWeight: "600",
    backgroundColor: "#fff",
    color: "#e53e3e",
    border: "1.5px solid #e53e3e",
    borderRadius: "14px",
    cursor: "pointer",
  },
  cancelBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  cancelErrorBox: {
    backgroundColor: "#fff5f5",
    border: "1px solid #feb2b2",
    color: "#c53030",
    borderRadius: "10px",
    padding: "12px 16px",
    fontSize: "13px",
  },

  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "80px 0",
    gap: "14px",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #eee",
    borderTop: "3px solid #4CAF50",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: "14px", color: "#aaa", margin: 0 },
  errorBox: {
    margin: "40px 16px",
    backgroundColor: "#fff5f5",
    border: "1px solid #feb2b2",
    color: "#c53030",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  retryBtn: {
    fontSize: "13px",
    color: "#c53030",
    border: "1px solid #feb2b2",
    background: "#fff",
    borderRadius: "6px",
    padding: "5px 12px",
    cursor: "pointer",
  },
};
