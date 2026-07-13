import { getCookie } from "../api/cookie";

const getCsrfHeaders = () => {
  const csrfToken = getCookie("XSRF-TOKEN");
  return csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {};
};

// FE에서는 별점(1~5)을 다루고, BE의 Rating enum(ONE~FIVE)으로 변환해서 전송한다.
export const RATING_ENUM_MAP = {
  1: "ONE",
  2: "TWO",
  3: "THREE",
  4: "FOUR",
  5: "FIVE",
};

/**
 * 리뷰 생성 API 호출
 * @param {Object} params
 * @param {number|string} params.bookingId
 * @param {number} params.rating - 1 ~ 5 사이의 별점
 * @param {string} params.content
 */

export async function createReview({ bookingId, rating, content }) {
  const ratingEnum = RATING_ENUM_MAP[rating];
  if (!ratingEnum) {
    throw new Error("평점을 선택해주세요.");
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL}/review`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getCsrfHeaders(),
    },
    body: JSON.stringify({
      bookingId,
      rating: ratingEnum,
      content,
    }),
  });

  if (!res.ok) {
    let message = "리뷰 등록에 실패했습니다.";
    try {
      const errData = await res.json();
      message = errData.message || message;
    } catch (_) {
      // 응답 본문이 JSON이 아닌 경우 기본 메시지 사용
    }
    throw new Error(message);
  }

  // ApiResponse<String> 형태로 응답 (성공 메시지 등)
  return res.json();
}
