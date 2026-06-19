import {
  GET_USER_BOOKINGS,
  GET_UPCOMING_BOOKINGS,
  GET_BOOKING_DETAIL,
} from "../graphql/queries/bookingQueries";
import { getCookie } from "../api/cookie";

const getCsrfHeaders = () => {
  const csrfToken = getCookie("XSRF-TOKEN");
  return csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {};
};

/**
 * 유저 예약 목록 조회
 * @param {number} page - 0-based 페이지 번호
 * @param {number} size - 페이지 당 항목 수
 * @returns {{ data: Booking[], pageInfo: PageInfo }}
 */
export async function fetchUserBookings(page = 0, size = 10) {
  const res = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: GET_USER_BOOKINGS,
      variables: { page, size },
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data?.bookings ?? { data: [], pageInfo: null };
}

/**
 * 다가오는 예약 조회
 * @param {number} daysLatter - 오늘부터 며칠 후까지 조회할지
 * @returns {{ data: Booking[] }}
 */
export async function fetchUpcomingBookings(daysLatter = 7) {
  const res = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: GET_UPCOMING_BOOKINGS,
      variables: { daysLatter },
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);

  return json.data?.upcomingBookings ?? { data: [] };
}

/**
 * 예약 상세 조회
 * @param {string|number} bookingId
 * @returns {Booking}
 */
export async function fetchBookingDetail(bookingId) {
  if (!bookingId) {
    throw new Error("bookingId가 없습니다.");
  }

  const res = await fetch(import.meta.env.VITE_API_URL + "/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      query: GET_BOOKING_DETAIL,
      variables: { bookingId: String(bookingId) },
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data?.booking ?? null;
}

/**
 * 예약 취소
 * @param {string|number} bookingId
 * @returns {string} - API response message
 */
export async function cancelBooking(bookingId) {
  if (!bookingId) {
    throw new Error("bookingId가 없습니다.");
  }

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/booking?bookingId=${bookingId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getCsrfHeaders(),
      },
      credentials: "include",
    },
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => null);
    throw new Error(errorJson?.message || `HTTP ${res.status}`);
  }

  const json = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }

  return json.data ?? null;
}
