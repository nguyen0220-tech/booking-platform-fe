import { gql } from "@apollo/client";

export const SEARCH_USER = gql`
  query SearchUser($searchType: SearchType!, $keyword: String!) {
    user(searchType: $searchType, keyword: $keyword) {
      id
      roles
      infoDetails {
        username
        fullName
        phone
        email
        avatarUrl
        enabled
        blocked
        createdAt
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers($page: Int!, $size: Int) {
    users(page: $page, size: $size) {
      data {
        id
        roles
        infoDetails {
          username
          fullName
          phone
          email
          avatarUrl
          enabled
          blocked
          createdAt
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

export const GET_USERS_FILTER = gql`
  query GetUsersFilter(
    $page: Int!
    $size: Int!
    $filter: FilterUser!
    $is: Boolean!
  ) {
    usersFilter(page: $page, size: $size, filter: $filter, is: $is) {
      data {
        id
        roles
        infoDetails {
          username
          fullName
          phone
          email
          avatarUrl
          enabled
          blocked
          createdAt
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
