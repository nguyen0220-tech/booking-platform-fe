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
        averageRating
        totalReviews
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
          openTime
          closeTime
          menus {
            id
            name
            description
            price
            imageUrl
        }
        }
      }
    }
  }
`;

export const GET_FACILITY_PRICING = `
  query GetFacilityPricing($id: ID!) {
    facility(id: $id) {
      facilityTarget {
        __typename
        ... on Sport {
          hourPrice
        }
        ... on Motel {
          hourPrice
          nightPrice
        }
        ... on Restaurant {
          menus {
            id
            name
            price
            imageUrl
          }
        }
      }
    }
  }
`;

export const GET_RESTAURANT_MENUS = `
  query GetRestaurantMenus($id: ID!) {
    facility(id: $id) {
      facilityInfo{
      name
      description
      address
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
        openTime
        closeTime
        menus {
          id
          name
          description
          price
          imageUrl
          deleted
          soldOut
        }
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
        imageUrls
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
            openTime
            closeTime
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

//USER
export const SEARCH_FACILITIES_WITH_KEYWORD = `
  query($keyword: String!, $page: Int!, $size: Int!) {
    facilitiesWithKeyword(keyword: $keyword, page: $page, size: $size) {
      data {
        id
        facilityType
        imageUrls
        facilityInfo { name address averageRating totalReviews}
      }
      pageInfo { page size hasNext totalElements totalPages }
    }
  }
`;

export const GET_FACILITY_PUBLIC_DETAIL = `
  query GetFacilityPublicDetail($id: ID!, $page: Int!, $size: Int!) {
    facility(id: $id) {
      id
      facilityType
      facilityInfo {
        name
        description
        address
        instruction
        averageRating
        totalReviews
        carPark
        hasWifi
      }
      imageUrls
      packages(page: $page, size: $size) {
        data {
          id
          infoDetails {
            packageName
            note
            totalCount
            price
            salePrice
          }
          packageTarget {
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
              menus {
                name
                description
                price
                imageUrl
              }
            }
          }
        }
        pageInfo {
          page
          size
          hasNext
        }
      }
      reviews(page: 0, size: 5) {
        data {
          id
          rating
          content
          createdAt
          reviewer {
            id
            infoDetails {
              fullName
              avatarUrl
            }
          }
        }
      }
      ratingGroupBy {
        rating
        count
      }
    }
  }
`;

export const GET_FACILITIES_IN_POPULAR_DESTINATION = `
  query GetFacilitiesInPopularDestination(
    $destination: PopularDestination!
    $page: Int!
    $size: Int!
  ) {
    facilitiesInPopularDestination(
      destination: $destination
      page: $page
      size: $size
    ) {
      data {
        id
        facilityType
        facilityInfo {
          name
          address
          description
          averageRating
          totalReviews
        }
        imageUrls
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

export const GET_FACILITIES_SUGGESTION = `
  query GetFacilitiesSuggestion {
    facilitiesSuggestion {
      data {
        id
        facilityType
        facilityInfo {
          name
          address
          averageRating
          totalReviews
        }
        imageUrls
      }
    }
  }
`;
