//PROVIDER
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
          isSuspended
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
          isSuspended
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

//ADMIN
export const GET_FACILITY_REGISTRATION_LIST = `
  query GetFacilityRegistrationList($status: FacilityStatus!, $page: Int!, $size: Int!) {
    facilityRegistrationList(status: $status, page: $page, size: $size) {
      data {
        id
        facilityType
        facilityRegistrationId
        facilityInfo {
          name
          address
          createdAt
        }
        owner {
          id
          infoDetails {
            fullName
            avatarUrl
            phone
            email
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

export const GET_FACILITY_REGISTRATION_DETAIL = `
  query GetFacilityRegistrationDetail($id: ID!) {
    facilityRegistration(id: $id) {
      id
      status
      note
      lastUpdateAt
      facility {
        facilityType
        facilityInfo {
          name
          description
          address
          instruction
          active
          carPark
          hasWifi
          isSuspended
          createdAt
          updatedAt
        }
        owner {
          id
          infoDetails {
            fullName
            avatarUrl
            phone
            email
            createdAt
          }
        }
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
      reviewer {
        infoDetails {
          fullName
          avatarUrl
        }
      }
    }
  }
`;
