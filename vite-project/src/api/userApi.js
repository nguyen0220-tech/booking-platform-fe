import { useQuery } from "@apollo/client/react";
import {
  GET_USERS,
  GET_USERS_FILTER,
  SEARCH_USER,
} from "../graphql/queries/userQueries";

export const useUsers = (size = 5, filter = null, is = null, search = null) => {
  // 1. Xác định Mode: SEARCH, FILTER, hoặc ALL
  const isSearching = !!search?.keyword;
  const isFiltering = !isSearching && filter !== null && is !== null;

  // 2. Chọn Query tương ứng
  let query = GET_USERS;
  if (isSearching) query = SEARCH_USER;
  else if (isFiltering) query = GET_USERS_FILTER;

  // 3. Thiết lập Variables
  const variables = isSearching
    ? { searchType: search.type, keyword: search.keyword }
    : isFiltering
      ? { page: 0, size, filter, is }
      : { page: 0, size };

  const { data, loading, error, fetchMore } = useQuery(query, {
    variables,
    notifyOnNetworkStatusChange: true,
    skip: isSearching && !search.keyword, // Không gọi search nếu keyword rỗng
  });

  // 4. Chuẩn hóa dữ liệu trả về cho UI
  let normalizedData = { data: [], pageInfo: { hasNext: false } };

  if (data) {
    if (data.user) {
      // Nếu là kết quả search (1 user), bọc vào mảng
      normalizedData.data = [data.user];
    } else if (data.usersFilter) {
      normalizedData = data.usersFilter;
    } else if (data.users) {
      normalizedData = data.users;
    }
  }

  const loadMore = () => {
    // Không load more khi đang search hoặc hết trang
    if (isSearching || !normalizedData.pageInfo?.hasNext) return;

    const responseKey = isFiltering ? "usersFilter" : "users";
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
