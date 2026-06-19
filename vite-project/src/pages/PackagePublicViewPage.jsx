import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchFacilityPublicDetailApi } from "../api/facilityPublicApi";
import BookingModal from "../pages/BookingModal";

const PKG_SIZE = 5;

function PackagePublicViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [facility, setFacility] = useState(null);
  const [packages, setPackages] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [pkgPage, setPkgPage] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingPkg, setBookingPkg] = useState(null);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchDetail = useCallback(
    async (page) => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchFacilityPublicDetailApi({
          id,
          page,
          size: PKG_SIZE,
        });
        setFacility(data);
        setPackages(data.packages?.data || []);
        setPageInfo(data.packages?.pageInfo || null);
      } catch (err) {
        setError(err.message || "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchDetail(pkgPage);
  }, [fetchDetail, pkgPage]);

  // ── Loading / Error ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.centerBox}>
        <span style={{ fontSize: 32 }}>⏳</span>
        <p style={styles.stateText}>불러오는 중...</p>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div style={styles.centerBox}>
        <span style={{ fontSize: 32 }}>⚠️</span>
        <p style={styles.stateText}>{error || "시설을 찾을 수 없습니다."}</p>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
      </div>
    );
  }

  const { facilityType, facilityInfo, imageUrls = [] } = facility;

  return (
    <div style={styles.layout}>
      {/* ── NAVBAR ── */}
      <nav style={styles.navbar}>
        <div
          style={styles.navBrand}
          onClick={() => navigate("/home")}
          role="button"
        >
          🏠 CUK Booking
        </div>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← 뒤로가기
        </button>
      </nav>

      <main style={styles.main}>
        {/* ── HERO: IMAGE GALLERY + INFO ── */}
        <div style={styles.heroSection}>
          {/* Image Gallery */}
          <div style={styles.gallery}>
            <div style={styles.mainImgWrap}>
              {imageUrls.length > 0 ? (
                <img
                  src={imageUrls[activeImg]}
                  alt={facilityInfo?.name}
                  style={styles.mainImg}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div style={styles.imgFallback}>🏢</div>
              )}
            </div>
            {imageUrls.length > 1 && (
              <div style={styles.thumbRow}>
                {imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`thumb-${i}`}
                    style={{
                      ...styles.thumb,
                      ...(i === activeImg ? styles.thumbActive : {}),
                    }}
                    onClick={() => setActiveImg(i)}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Facility Info */}
          <div style={styles.infoBox}>
            <span style={styles.typeBadge}>{facilityType || "기타"}</span>
            <h1 style={styles.facilityName}>{facilityInfo?.name}</h1>
            <p style={styles.address}>📍 {facilityInfo?.address}</p>

            <div style={styles.amenities}>
              {facilityInfo?.hasWifi && (
                <span style={styles.amenityTag}>📶 Wi-Fi</span>
              )}
              {facilityInfo?.carPark && (
                <span style={styles.amenityTag}>🅿️ 주차 가능</span>
              )}
            </div>

            {facilityInfo?.description && (
              <div style={styles.descBox}>
                <p style={styles.descLabel}>소개</p>
                <p style={styles.descText}>{facilityInfo.description}</p>
              </div>
            )}

            {facilityInfo?.instruction && (
              <div style={styles.descBox}>
                <p style={styles.descLabel}>이용 안내</p>
                <p style={styles.descText}>{facilityInfo.instruction}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── PACKAGES ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📦 이용 패키지</h2>

          {packages.length === 0 ? (
            <div style={styles.emptyBox}>
              <p style={styles.stateText}>등록된 패키지가 없습니다</p>
            </div>
          ) : (
            <div style={styles.pkgList}>
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  pkg={pkg}
                  onBook={() => setBookingPkg(pkg)}
                />
              ))}
            </div>
          )}

          {/* Package pagination */}
          {pageInfo && (pkgPage > 0 || pageInfo.hasNext) && (
            <div style={styles.pkgPagination}>
              <button
                style={{
                  ...styles.pageBtn,
                  ...(pkgPage === 0 ? styles.pageBtnDisabled : {}),
                }}
                disabled={pkgPage === 0}
                onClick={() => setPkgPage((p) => p - 1)}
              >
                ← 이전
              </button>
              <span style={styles.pageIndicator}>{pkgPage + 1} 페이지</span>
              <button
                style={{
                  ...styles.pageBtn,
                  ...(!pageInfo.hasNext ? styles.pageBtnDisabled : {}),
                }}
                disabled={!pageInfo.hasNext}
                onClick={() => setPkgPage((p) => p + 1)}
              >
                다음 →
              </button>
            </div>
          )}
        </section>

        {/* ── REVIEWS (placeholder) ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>⭐ 리뷰</h2>

          <div style={styles.reviewSummary}>
            <div style={styles.reviewScore}>
              <span style={styles.reviewScoreNum}>—</span>
              <div style={styles.reviewStars}>★★★★★</div>
              <span style={styles.reviewCount}>0 리뷰</span>
            </div>
            <div style={styles.reviewBars}>
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} style={styles.reviewBarRow}>
                  <span style={styles.reviewBarLabel}>{star}★</span>
                  <div style={styles.reviewBarTrack}>
                    <div style={{ ...styles.reviewBarFill, width: "0%" }} />
                  </div>
                  <span style={styles.reviewBarCount}>0</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.emptyBox}>
            <p style={styles.stateText}>아직 리뷰가 없습니다</p>
          </div>
        </section>
      </main>

      {bookingPkg && (
        <BookingModal
          pkg={bookingPkg}
          facilityType={facilityType}
          onClose={() => setBookingPkg(null)}
          onSuccess={() => {
            setBookingPkg(null);
            alert("예약이 완료되었습니다!");
          }}
        />
      )}
    </div>
  );
}

// ── PackageCard Component ────────────────────────────────────────────────────
function PackageCard({ pkg, onBook }) {
  const { infoDetails, packageTarget } = pkg;
  const hasDiscount =
    infoDetails?.salePrice && infoDetails.salePrice < infoDetails.price;

  return (
    <div style={pkgStyles.card}>
      <div style={pkgStyles.cardHeader}>
        <div>
          <h3 style={pkgStyles.pkgName}>
            {infoDetails?.packageName || "패키지"}
          </h3>
          {infoDetails?.note && (
            <p style={pkgStyles.pkgNote}>{infoDetails.note}</p>
          )}
          {infoDetails?.totalCount && (
            <p style={pkgStyles.pkgCount}>🔢 총 {infoDetails.totalCount}회</p>
          )}
        </div>
        <div style={pkgStyles.priceBox}>
          {hasDiscount && (
            <span style={pkgStyles.originalPrice}>
              {Number(infoDetails.price).toLocaleString()}원
            </span>
          )}
          <span style={pkgStyles.salePrice}>
            {Number(
              hasDiscount ? infoDetails.salePrice : infoDetails.price,
            ).toLocaleString()}
            원
          </span>
          {hasDiscount && (
            <span style={pkgStyles.discountBadge}>
              -
              {Math.round(
                (1 - infoDetails.salePrice / infoDetails.price) * 100,
              )}
              %
            </span>
          )}
        </div>
      </div>

      <div style={pkgStyles.detailRow}>
        <PackageTargetDetail
          target={packageTarget}
          count={infoDetails?.totalCount}
        />
      </div>

      <button style={pkgStyles.bookBtn} onClick={onBook}>
        📅 예약하기
      </button>
    </div>
  );
}

// ── PackageTargetDetail ──────────────────────────────────────────────────────
function PackageTargetDetail({ target, count }) {
  if (!target) return null;

  if (target.startTime !== undefined) {
    return (
      <div style={pkgStyles.targetGrid}>
        <DetailItem icon="🕐" label="시작" value={target.startTime} />
        <DetailItem icon="🕔" label="종료" value={target.endTime} />
        {count && <DetailItem icon="🔢" label="횟수" value={`${count}회`} />}
      </div>
    );
  }

  if (target.checkIn !== undefined) {
    return (
      <div style={pkgStyles.targetGrid}>
        <DetailItem icon="🏷️" label="요금 유형" value={target.pricingType} />
        <DetailItem icon="🛎️" label="체크인" value={target.checkIn} />
        <DetailItem icon="🚪" label="체크아웃" value={target.checkOut} />
        {count && <DetailItem icon="🔢" label="횟수" value={`${count}회`} />}
      </div>
    );
  }

  if (target.maxCapacity !== undefined) {
    return (
      <div>
        <div style={pkgStyles.targetGrid}>
          <DetailItem
            icon="👥"
            label="최대 인원"
            value={`${target.maxCapacity}명`}
          />
          {count && <DetailItem icon="🔢" label="횟수" value={`${count}회`} />}
        </div>
        {target.menus?.length > 0 && (
          <div style={pkgStyles.menuList}>
            <p style={pkgStyles.menuTitle}>🍽️ 메뉴(에피타이저)</p>
            {target.menus.map((menu, i) => (
              <div key={i} style={pkgStyles.menuItem}>
                {menu.imageUrl && (
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    style={pkgStyles.menuImg}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
                <div style={pkgStyles.menuInfo}>
                  <span style={pkgStyles.menuName}>{menu.name}</span>
                  {menu.description && (
                    <span style={pkgStyles.menuDesc}>{menu.description}</span>
                  )}
                </div>
                <span style={pkgStyles.menuPrice}>
                  {Number(menu.price).toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

function DetailItem({ icon, label, value }) {
  return (
    <div style={pkgStyles.detailItem}>
      <span style={pkgStyles.detailIcon}>{icon}</span>
      <span style={pkgStyles.detailLabel}>{label}</span>
      <span style={pkgStyles.detailValue}>{value}</span>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  layout: {
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: "12px 24px",
    borderBottom: "1px solid #eaeaea",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navBrand: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2c3e50",
    cursor: "pointer",
  },
  backBtn: {
    padding: "7px 14px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    background: "#fff",
    color: "#34495e",
    cursor: "pointer",
  },
  main: {
    maxWidth: "1000px",
    width: "100%",
    margin: "0 auto",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "36px",
    boxSizing: "border-box",
  },
  centerBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: "12px",
  },
  stateText: { fontSize: "14px", color: "#aaa" },
  heroSection: {
    display: "flex",
    gap: "28px",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  gallery: {
    flex: "0 0 420px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  mainImgWrap: {
    width: "100%",
    height: "280px",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#eef0f3",
  },
  mainImg: { width: "100%", height: "100%", objectFit: "cover" },
  imgFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "60px",
  },
  thumbRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  thumb: {
    width: "64px",
    height: "48px",
    objectFit: "cover",
    borderRadius: "6px",
    cursor: "pointer",
    border: "2px solid transparent",
    opacity: 0.7,
  },
  thumbActive: { border: "2px solid #4CAF50", opacity: 1 },
  infoBox: {
    flex: 1,
    minWidth: "260px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  typeBadge: {
    display: "inline-block",
    padding: "4px 10px",
    backgroundColor: "#e8f5e9",
    color: "#2e7d32",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
  facilityName: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
  },
  address: { fontSize: "13px", color: "#7f8c8d", margin: 0 },
  amenities: { display: "flex", gap: "8px", flexWrap: "wrap" },
  amenityTag: {
    padding: "4px 10px",
    backgroundColor: "#f0f4ff",
    color: "#3b5bdb",
    borderRadius: "99px",
    fontSize: "12px",
    border: "1px solid #d0daff",
  },
  descBox: {
    backgroundColor: "#f9f9f9",
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "12px 14px",
  },
  descLabel: {
    fontSize: "11px",
    fontWeight: "bold",
    color: "#999",
    margin: "0 0 4px 0",
    textTransform: "uppercase",
  },
  descText: { fontSize: "13px", color: "#555", margin: 0, lineHeight: "1.6" },
  section: { display: "flex", flexDirection: "column", gap: "16px" },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
    paddingBottom: "10px",
    borderBottom: "2px solid #eaeaea",
  },
  emptyBox: {
    backgroundColor: "#fff",
    border: "1px dashed #ddd",
    borderRadius: "10px",
    padding: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pkgList: { display: "flex", flexDirection: "column", gap: "14px" },
  pkgPagination: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    justifyContent: "center",
    marginTop: "8px",
  },
  pageBtn: {
    padding: "7px 16px",
    fontSize: "13px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    backgroundColor: "#fff",
    cursor: "pointer",
    color: "#34495e",
  },
  pageBtnDisabled: {
    color: "#bbb",
    cursor: "not-allowed",
    backgroundColor: "#f5f5f5",
  },
  pageIndicator: { fontSize: "13px", color: "#7f8c8d" },
  reviewSummary: {
    display: "flex",
    gap: "28px",
    backgroundColor: "#fff",
    border: "1px solid #eaeaea",
    borderRadius: "12px",
    padding: "20px 24px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  reviewScore: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    minWidth: "80px",
  },
  reviewScoreNum: {
    fontSize: "40px",
    fontWeight: "bold",
    color: "#2c3e50",
    lineHeight: 1,
  },
  reviewStars: { fontSize: "18px", color: "#ddd", letterSpacing: "2px" },
  reviewCount: { fontSize: "12px", color: "#aaa" },
  reviewBars: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "200px",
  },
  reviewBarRow: { display: "flex", alignItems: "center", gap: "8px" },
  reviewBarLabel: {
    fontSize: "12px",
    color: "#7f8c8d",
    width: "24px",
    textAlign: "right",
  },
  reviewBarTrack: {
    flex: 1,
    height: "6px",
    backgroundColor: "#eee",
    borderRadius: "99px",
    overflow: "hidden",
  },
  reviewBarFill: {
    height: "100%",
    backgroundColor: "#EF9F27",
    borderRadius: "99px",
  },
  reviewBarCount: { fontSize: "12px", color: "#aaa", width: "20px" },
};

const pkgStyles = {
  card: {
    backgroundColor: "#fff",
    border: "1px solid #eaeaea",
    borderRadius: "12px",
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  pkgName: {
    fontSize: "15px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 0,
  },
  pkgNote: { fontSize: "12px", color: "#7f8c8d", margin: "4px 0 0 0" },
  pkgCount: {
    fontSize: "12px",
    color: "#3b5bdb",
    backgroundColor: "#f0f4ff",
    border: "1px solid #d0daff",
    borderRadius: "99px",
    padding: "2px 10px",
    margin: "4px 0 0 0",
    display: "inline-block",
  },
  priceBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  originalPrice: {
    fontSize: "13px",
    color: "#bbb",
    textDecoration: "line-through",
  },
  salePrice: { fontSize: "18px", fontWeight: "bold", color: "#e74c3c" },
  discountBadge: {
    backgroundColor: "#fff0f0",
    color: "#e74c3c",
    border: "1px solid #ffc9c9",
    borderRadius: "99px",
    padding: "2px 8px",
    fontSize: "11px",
    fontWeight: "bold",
  },
  detailRow: {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "12px 14px",
  },
  targetGrid: { display: "flex", gap: "16px", flexWrap: "wrap" },
  detailItem: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontSize: "13px",
  },
  detailIcon: { fontSize: "14px" },
  detailLabel: { color: "#999", fontSize: "12px" },
  detailValue: { color: "#2c3e50", fontWeight: "500" },
  menuList: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  menuTitle: {
    fontSize: "12px",
    fontWeight: "bold",
    color: "#999",
    margin: "0 0 6px 0",
    textTransform: "uppercase",
  },
  menuItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    padding: "8px 10px",
    backgroundColor: "#fff",
    borderRadius: "6px",
    border: "1px solid #eee",
  },
  menuInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  menuName: { fontSize: "13px", fontWeight: "500", color: "#2c3e50" },
  menuDesc: { fontSize: "11px", color: "#aaa" },
  menuPrice: {
    fontSize: "13px",
    fontWeight: "bold",
    color: "#e74c3c",
    flexShrink: 0,
  },
  bookBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4CAF50",
    color: "#fff",
    fontWeight: "bold",
    fontSize: "14px",
    cursor: "pointer",
    alignSelf: "flex-end",
    minWidth: "160px",
  },
  menuImg: {
    width: "52px",
    height: "52px",
    objectFit: "cover",
    borderRadius: "6px",
    flexShrink: 0,
  },
};

export default PackagePublicViewPage;
