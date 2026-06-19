export const GET_USER_BOOKINGS = `
  query GetUserBookings($page: Int!, $size: Int!) {
    bookings(roleName: USER, page: $page, size: $size) {
      data {
        id
        usageDate
        startTime
        endTime
        status
        packageInfo {
          id
          infoDetails {
            packageName
          }
        }
        facility {
          facilityInfo {
            name
          }
          imageUrls
        }
      }
      pageInfo {
        page
        size
        hasNext
        totalElements
        totalPages
      }
    }
  }
`;

export const GET_UPCOMING_BOOKINGS = `
  query GetUpcomingBookings($daysLatter: Int!) {
    upcomingBookings(daysLatter: $daysLatter) {
      data {
        id
        usageDate
        startTime
        endTime
        facility {
          facilityInfo {
            name
          }
          imageUrls
        }
        packageInfo {
          infoDetails {
            packageName
          }
        }
      }
    }
  }
`;

export const GET_BOOKING_DETAIL = `
  query GetBookingDetail($bookingId: ID!) {
    booking(bookingId: $bookingId) {
      id
      amount
      basisPrice
      usageDate
      startTime
      endTime
      status
      payMethod
      createdAt
      packageInfo {
        id
        infoDetails {
          packageName
          note
        }
      }
      facility {
        id
        facilityType
        facilityInfo {
          name
          address
        }
        imageUrls
      }
    }
  }
`;
