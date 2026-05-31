export const GET_FACILITY_PACKAGES = `
  query FacilityPackages($facilityId: ID!, $page: Int!, $size: Int!) {
    facilityPackages(facilityId: $facilityId, page: $page, size: $size) {
      data {
        id
        facilityType
        infoDetails {
          packageName
          note
          totalCount
          price
          salePrice
          active
        }
        packageTarget {
          __typename
          ... on SportPackage {
            startTime
            endTime
          }
          ... on MotelPackage {
            pricingType
            checkIn
            checkOut
          }
          ... on RestaurantPackage {
            maxCapacity
          }
        }
      }
      pageInfo {
        page
        size
        hasNext
      }
    }
  }
`;
