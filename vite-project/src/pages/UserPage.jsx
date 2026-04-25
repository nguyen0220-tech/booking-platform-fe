import { useEffect, useRef, useState } from "react";
import { useUsers } from "../api/userApi";
import { getCookie } from "../api/cookie";

function UserPage() {
  // 1. Quản lý state cho Bộ lọc (Filter)
  const [filterType, setFilterType] = useState("ALL");

  // 2. Quản lý state cho Tìm kiếm (Search)
  const [searchType, setSearchType] = useState("USERNAME");
  const [tempKeyword, setTempKeyword] = useState(""); // Keyword tạm thời khi đang gõ
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

  // 3. Gọi Hook lấy dữ liệu (đã nâng cấp ở bước trước để nhận thêm searchConfig)
  const { users, loading, error, loadMore } = useUsers(
    5,
    filterParams.filter,
    filterParams.is,
    searchConfig,
  );

  const loaderRef = useRef(null);

  // Xử lý khi nhấn nút Tìm kiếm
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (tempKeyword.trim() === "") return;

    setFilterType("ALL"); // Reset filter khi tìm kiếm đích danh
    setSearchConfig({
      type: searchType,
      keyword: tempKeyword.trim(),
    });
  };

  // Xử lý khi muốn thoát chế độ tìm kiếm
  const handleClearSearch = () => {
    setTempKeyword("");
    setSearchConfig({ type: "USERNAME", keyword: "" });
  };

  // Intersection Observer cho Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Chỉ load more khi: đang nhìn thấy loader, có data, và KHÔNG ở chế độ search
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
    <div style={{ padding: "20px" }}>
      <h1>사용자 관리 (User Management)</h1>

      {/* THANH CÔNG CỤ: FILTER & SEARCH */}
      <div style={styles.toolbar}>
        {/* KHU VỰC BỘ LỌC */}
        <div style={styles.filterGroup}>
          <label htmlFor="userFilter" style={styles.label}>
            Filter
          </label>
          <select
            id="userFilter"
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              handleClearSearch(); // Xóa tìm kiếm khi chuyển sang lọc theo danh sách
            }}
            style={styles.select}
          >
            <option value="ALL">모든 사용자</option>
            <option value="BLOCKED_TRUE">차단됨</option>
            <option value="BLOCKED_FALSE">정상</option>
            <option value="ENABLED_TRUE">활성화</option>
            <option value="ENABLED_FALSE">비활성화</option>
          </select>
        </div>

        {/* KHU VỰC TÌM KIẾM */}
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

      {/* BẢNG DỮ LIỆU */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Avatar</th>
            <th>ID</th>
            <th>Username</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Roles</th>
            <th>Active</th>
            <th>Status</th>
            <th>Deleted</th>
            <th>Actions</th>
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
                  <tr key={user.id}>
                    <td>
                      <img
                        src={user.infoDetails?.avatarUrl || "/avatar.png"}
                        alt="avatar"
                        style={styles.avatar}
                      />
                    </td>
                    <td>{user.id}</td>
                    <td>{user.infoDetails?.username}</td>
                    <td>{user.infoDetails?.fullName}</td>
                    <td>{user.infoDetails?.email}</td>
                    <td>{user.infoDetails?.phone}</td>
                    <td>{user.roles?.join(", ")}</td>
                    <td>
                      {user.infoDetails?.enabled ? "🟢 활성화" : "🔴 비활성화"}
                    </td>
                    <td>
                      {user.infoDetails?.blocked ? "🔴 차단됨" : "🟢 정상"}
                    </td>
                    <td>
                      {user.infoDetails?.deleted ? "🗑️ 삭제됨" : "✔️ 정상"}
                    </td>
                    <td>
                      <button onClick={() => handleView(user)}>View</button>
                      <button onClick={() => handleToggle(user)}>
                        {user.infoDetails?.blocked ? "Unblock" : "Block"}
                      </button>
                      <button onClick={() => handleDelete(user)}>Delete</button>
                    </td>
                  </tr>
                ))
            : !loading && (
                <tr>
                  <td
                    colSpan="10"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#666",
                    }}
                  >
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              )}
        </tbody>
      </table>

      {/* LOADER & INFINITE SCROLL TARGET */}
      {/* Ẩn loader khi đang tìm kiếm vì kết quả search chỉ trả về 1 đối tượng */}
      {!searchConfig.keyword && (
        <div ref={loaderRef} style={{ textAlign: "center", padding: "20px" }}>
          {loading
            ? "Đang tải thêm..."
            : users?.pageInfo?.hasNext
              ? "Cuộn để xem thêm"
              : "Đã hết danh sách"}
        </div>
      )}

      {loading && !users && (
        <p style={{ textAlign: "center" }}>Đang khởi tạo dữ liệu...</p>
      )}
    </div>
  );
}

// Styles
const styles = {
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

    // --- CÁC THUỘC TÍNH THÊM VÀO ĐỂ FIX CỨNG ---
    position: "sticky",
    top: "0", // Đặt cách lề trên 0px (Nếu bạn có thanh Navbar cố định thì tăng số này lên, vd: "60px")
    zIndex: 100, // Đảm bảo thanh này luôn nổi lên trên các thành phần khác
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)", // Đổ bóng nhẹ để nhìn tách biệt với bảng khi cuộn
  },

  // Các style cũ giữ nguyên
  filterGroup: { display: "flex", alignItems: "center" },
  searchGroup: { display: "flex", gap: "5px" },
  label: { marginRight: "10px", fontWeight: "bold" },
  select: { padding: "8px", borderRadius: "4px", border: "1px solid #ccc" },
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
  table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
};

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
        headers: {
          "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
        },
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
