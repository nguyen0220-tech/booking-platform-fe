import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useUsers } from "../api/userApi";
import { getCookie } from "../api/cookie";

function UserPage() {
  const navigate = useNavigate(); // Khởi tạo điều hướng

  // 1. Quản lý state cho Bộ lọc Trạng thái (Status)
  const [filterType, setFilterType] = useState("ALL");

  // 2. Quản lý state cho Bộ lọc Quyền (Role)
  const [roleFilter, setRoleFilter] = useState("ALL");

  // 3. Quản lý state cho Tìm kiếm (Search)
  const [searchType, setSearchType] = useState("USERNAME");
  const [tempKeyword, setTempKeyword] = useState("");
  const [searchConfig, setSearchConfig] = useState({
    type: "USERNAME",
    keyword: "",
  });

  // Xử lý logic chuyển đổi filterType sang tham số API
  const filterParams = (() => {
    switch (filterType) {
      case "BLOCKED_TRUE":
        return { filter: "BLOCKED", is: true };
      case "BLOCKED_FALSE":
        return { filter: "BLOCKED", is: false };
      case "ENABLED_TRUE":
        return { filter: "ENABLED", is: true };
      case "ENABLED_FALSE":
        return { filter: "ENABLED", is: false };
      default:
        return { filter: null, is: null };
    }
  })();

  // 4. Gọi Hook lấy dữ liệu
  const { users, loading, error, loadMore } = useUsers(
    5,
    filterParams.filter,
    filterParams.is,
    searchConfig,
    roleFilter === "ALL" ? null : roleFilter,
  );

  const loaderRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (tempKeyword.trim() === "") return;
    setFilterType("ALL");
    setRoleFilter("ALL");
    setSearchConfig({
      type: searchType,
      keyword: tempKeyword.trim(),
    });
  };

  const handleClearSearch = () => {
    setTempKeyword("");
    setSearchConfig({ type: "USERNAME", keyword: "" });
  };

  // Intersection Observer cho Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && users?.data && !searchConfig.keyword) {
          loadMore();
        }
      },
      { threshold: 1 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [users, loadMore, searchConfig.keyword]);

  if (error)
    return (
      <p style={{ color: "red", padding: "20px" }}>Error: {error.message}</p>
    );

  return (
    <div style={{ padding: "20px", maxWidth: "100%", overflowX: "hidden" }}>
      {/* TIÊU ĐỀ VÀ NÚT HOME */}
      <div style={styles.headerContainer}>
        <h1>사용자 관리</h1>
        <button style={styles.buttonHome} onClick={() => navigate("/home")}>
          🏠 Home
        </button>
      </div>

      {/* THANH CÔNG CỤ */}
      <div style={styles.toolbar}>
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={styles.filterGroup}>
            <label htmlFor="userFilter" style={styles.label}>
              Status
            </label>
            <select
              id="userFilter"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setRoleFilter("ALL");
                handleClearSearch();
              }}
              style={styles.select}
            >
              <option value="ALL">모든 상태</option>
              <option value="BLOCKED_TRUE">차단됨 (Blocked)</option>
              <option value="BLOCKED_FALSE">정상 (Normal)</option>
              <option value="ENABLED_TRUE">활성화 (Enabled)</option>
              <option value="ENABLED_FALSE">비활성화 (Disabled)</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label htmlFor="roleFilter" style={styles.label}>
              Role
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setFilterType("ALL");
                handleClearSearch();
              }}
              style={styles.select}
            >
              <option value="ALL">모든 권한</option>
              <option value="USER">User</option>
              <option value="PROVIDER">Provider</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} style={styles.searchGroup}>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            style={styles.select}
          >
            <option value="USERNAME">Username</option>
            <option value="EMAIL">Email</option>
          </select>
          <input
            type="text"
            placeholder="검색하세요..."
            value={tempKeyword}
            onChange={(e) => setTempKeyword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.buttonSearch}>
            Search
          </button>
          {searchConfig.keyword && (
            <button
              type="button"
              onClick={handleClearSearch}
              style={styles.buttonClear}
            >
              검색 취소
            </button>
          )}
        </form>
      </div>

      {/* BẢNG DỮ LIỆU VỚI WRAPPER CUỘN NGANG */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Avatar</th>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Roles</th>
              <th style={styles.th}>Active</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Created At</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users?.data?.length > 0
              ? users.data
                  .filter(
                    (user, index, self) =>
                      index === self.findIndex((u) => u.id === user.id),
                  )
                  .map((user) => (
                    <tr key={user.id} style={styles.trHover}>
                      <td style={styles.td}>
                        <img
                          src={user.infoDetails?.avatarUrl || "/avatar.png"}
                          alt="avatar"
                          style={styles.avatar}
                        />
                      </td>
                      <td style={styles.td}>{user.id}</td>
                      <td style={styles.td}>
                        <strong>{user.infoDetails?.username}</strong>
                      </td>
                      <td style={styles.td}>{user.infoDetails?.fullName}</td>
                      <td style={styles.td}>{user.infoDetails?.email}</td>
                      <td style={styles.td}>{user.infoDetails?.phone}</td>
                      <td style={styles.td}>{user.roles?.join(", ")}</td>
                      <td style={styles.td}>
                        {user.infoDetails?.enabled
                          ? "🟢 활성화"
                          : "🔴 비활성화"}
                      </td>
                      <td style={styles.td}>
                        {user.infoDetails?.blocked ? "🔴 차단됨" : "🟢 정상"}
                      </td>
                      <td style={styles.td}>
                        {user.infoDetails?.createdAt
                          ? new Date(
                              user.infoDetails.createdAt,
                            ).toLocaleString()
                          : "-"}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.actionGroup}>
                          <button
                            style={styles.btnAction}
                            onClick={() => handleView(user)}
                          >
                            보기
                          </button>
                          <button
                            style={styles.btnAction}
                            onClick={() => handleToggle(user)}
                          >
                            {user.infoDetails?.blocked ? "차단해제" : "차단"}
                          </button>
                          <button
                            style={{ ...styles.btnAction, color: "red" }}
                            onClick={() => handleDelete(user)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              : !loading && (
                  <tr>
                    <td colSpan="11" style={styles.emptyCell}>
                      Không tìm thấy người dùng nào phù hợp.
                    </td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>

      {/* LOADER */}
      {!searchConfig.keyword && (
        <div ref={loaderRef} style={{ textAlign: "center", padding: "20px" }}>
          {loading
            ? "Loading..."
            : users?.pageInfo?.hasNext
              ? "내려보기"
              : "더이터 없음"}
        </div>
      )}
    </div>
  );
}

const styles = {
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  buttonHome: {
    padding: "10px 15px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px",
    backgroundColor: "#f8f9fa",
    padding: "15px",
    borderRadius: "8px",
    position: "sticky",
    top: "0",
    zIndex: 10,
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  },
  filterGroup: { display: "flex", alignItems: "center" },
  searchGroup: { display: "flex", gap: "5px", flexWrap: "wrap" },
  label: { marginRight: "10px", fontWeight: "bold" },
  select: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "white",
  },
  input: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    minWidth: "200px",
  },
  buttonSearch: {
    padding: "8px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  buttonClear: {
    padding: "8px 15px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    backgroundColor: "white",
  },
  table: {
    width: "100%",
    minWidth: "1200px",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f2f4f6",
    color: "#333",
    fontWeight: "bold",
    padding: "12px 15px",
    textAlign: "left",
    borderBottom: "2px solid #dee2e6",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 15px",
    borderBottom: "1px solid #eee",
    whiteSpace: "nowrap",
    fontSize: "14px",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  actionGroup: {
    display: "flex",
    gap: "5px",
  },
  btnAction: {
    padding: "4px 8px",
    cursor: "pointer",
    borderRadius: "4px",
    border: "1px solid #ccc",
    backgroundColor: "white",
    fontSize: "12px",
  },
  emptyCell: {
    textAlign: "center",
    padding: "40px",
    color: "#999",
  },
};

// Các hàm xử lý giữ nguyên logic cũ
function handleView(user) {
  console.log("View:", user);
}

async function handleToggle(user) {
  try {
    const active = user.infoDetails?.blocked ? "UNBLOCK" : "BLOCK";
    const response = await fetch(
      import.meta.env.VITE_API_URL +
        `/user/act?userId=${user.id}&active=${active}`,
      {
        method: "PUT",
        headers: { "X-XSRF-TOKEN": getCookie("XSRF-TOKEN") },
        credentials: "include",
      },
    );
    if (response.ok) window.location.reload();
  } catch (error) {
    console.error("Error:", error);
  }
}

function handleDelete(user) {
  console.log("Delete:", user.id);
}

export default UserPage;
