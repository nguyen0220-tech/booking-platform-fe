import { useQuery } from "@apollo/client/react";
import {
  GET_USERS,
  GET_USERS_FILTER,
  SEARCH_USER,
  GET_USERS_BY_ROLE,
} from "../graphql/queries/userQueries";

// Thêm tham số role vào hook
export const useUsers = (
  size = 5,
  filter = null,
  is = null,
  search = null,
  role = null,
) => {
  const isSearching = !!search?.keyword;
  const isFilteringStatus = !isSearching && filter !== null && is !== null;
  const isFilteringRole =
    !isSearching && !isFilteringStatus && role !== null && role !== "ALL";

  // Chọn Query
  let query = GET_USERS;
  if (isSearching) query = SEARCH_USER;
  else if (isFilteringStatus) query = GET_USERS_FILTER;
  else if (isFilteringRole) query = GET_USERS_BY_ROLE;

  // Thiết lập Variables
  const variables = isSearching
    ? { searchType: search.type, keyword: search.keyword }
    : isFilteringStatus
      ? { page: 0, size, filter, is }
      : isFilteringRole
        ? { page: 0, size, role }
        : { page: 0, size };

  const { data, loading, error, fetchMore } = useQuery(query, {
    variables,
    notifyOnNetworkStatusChange: true,
    skip: isSearching && !search.keyword,
  });

  let normalizedData = { data: [], pageInfo: { hasNext: false } };

  if (data) {
    if (data.user) normalizedData.data = [data.user];
    else if (data.usersFilter) normalizedData = data.usersFilter;
    else if (data.usersFilterByRole)
      normalizedData = data.usersFilterByRole; // Thêm map data mới
    else if (data.users) normalizedData = data.users;
  }

  const loadMore = () => {
    if (isSearching || !normalizedData.pageInfo?.hasNext) return;

    // Xác định key trả về của query hiện tại để merge data
    let responseKey = "users";
    if (isFilteringStatus) responseKey = "usersFilter";
    if (isFilteringRole) responseKey = "usersFilterByRole";

    return fetchMore({
      variables: { ...variables, page: normalizedData.pageInfo.page + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          [responseKey]: {
            ...fetchMoreResult[responseKey],
            data: [
              ...prev[responseKey].data,
              ...fetchMoreResult[responseKey].data,
            ],
          },
        };
      },
    });
  };

  return { users: normalizedData, loading, error, loadMore };
};
