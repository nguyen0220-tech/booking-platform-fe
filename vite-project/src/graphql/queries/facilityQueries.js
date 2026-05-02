export const GET_FACILITIES = `
  query GetFacilities($page: Int!, $size: Int!) {
    facilities(page: $page, size: $size) {
      data {
        id
        facilityType
        facilityInfo {
          name
          address
          active
          createdAt
        }
        approvalStatus {
          status
          note
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

export const GET_FACILITIES_BY_KEYWORD = `
  query GetFacilitiesByKeyword($keyword: String!, $page: Int!, $size: Int!) {
    facilitiesByKeyword(keyword: $keyword, page: $page, size: $size) {
      data {
        id
        facilityType
        facilityInfo {
          name
          address
          active
          createdAt
        }
        approvalStatus {
          status
          note
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

export const GET_FACILITY_DETAIL = `
  query GetFacilityDetail($id: ID!) {
    facility(id: $id) {
      id
      facilityType
      facilityInfo {
        name
        description
        address
        instruction
        active
        carPark
        hasWifi
        createdAt
        updatedAt
      }
      imageUrls
      facilityTarget {
        __typename
        ... on Sport {
          hourPrice
        }
        ... on Motel {
          nightPrice
          hourPrice
        }
        ... on Restaurant {
          foodType
        }
      }
    }
  }
`;
