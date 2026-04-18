import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProfileApi, uploadAvatarApi } from "../api/profileApi";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfileApi();
      setProfile(res.data); // Map data từ ProfileDTO
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Kích hoạt thẻ <input type="file"> ẩn khi click vào Avatar
  const handleAvatarClick = () => {
    if (!uploading) {
      fileInputRef.current.click();
    }
  };

  // Xử lý khi chọn file xong
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadAvatarApi(file);
      // Giả sử Backend trả về link avatar mới trong res.data
      setProfile((prev) => ({ ...prev, avatarUrl: res.data }));
      alert("Cập nhật Avatar thành công!");
    } catch (err) {
      alert("Lỗi: " + err.message);
    } finally {
      setUploading(false);
      // Reset input để có thể chọn lại cùng 1 file nếu cần
      e.target.value = null;
    }
  };

  if (loading) return <div style={styles.center}>Đang tải dữ liệu...</div>;
  if (error) return <div style={styles.centerError}>{error}</div>;
  if (!profile) return null;

  return (
    <div style={styles.layout}>
      {/* Nút Back về Home */}
      <button style={styles.backBtn} onClick={() => navigate("/home")}>
        ⬅ Quay lại
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>Thông tin cá nhân</h2>

        {/* Khối Avatar */}
        <div style={styles.avatarContainer} onClick={handleAvatarClick}>
          <img
            src={profile.avatarUrl || "https://via.placeholder.com/150"}
            alt="Avatar"
            style={styles.avatarImg}
          />

          {/* Lớp phủ báo hiệu đang upload */}
          {uploading && (
            <div style={styles.uploadOverlay}>
              <span style={styles.spinner}>⏳</span>
            </div>
          )}

          {/* Lớp phủ khi hover vào ảnh (chỉ hiện khi không upload) */}
          {!uploading && (
            <div className="hover-overlay" style={styles.hoverOverlay}>
              📷 Đổi ảnh
            </div>
          )}
        </div>

        {/* Input file ẩn */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Thông tin Text */}
        <div style={styles.infoGroup}>
          <label style={styles.label}>Họ và tên</label>
          <div style={styles.valueBox}>{profile.fullName}</div>
        </div>

        <div style={styles.infoGroup}>
          <label style={styles.label}>Email</label>
          <div style={styles.valueBox}>{profile.email}</div>
        </div>

        <div style={styles.infoGroup}>
          <label style={styles.label}>Số điện thoại</label>
          <div style={styles.valueBox}>{profile.phone}</div>
        </div>

        {/* Nút sửa thông tin (UI Placeholder) */}
        <button
          style={styles.editBtn}
          onClick={() => alert("Chức năng sửa thông tin sẽ làm sau!")}
        >
          ✏️ Sửa thông tin
        </button>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    backgroundColor: "#f5f6fa",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 20px",
  },
  center: { marginTop: "50px", fontSize: "18px", color: "#555" },
  centerError: { marginTop: "50px", fontSize: "18px", color: "red" },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: "20px",
    padding: "10px 15px",
    cursor: "pointer",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    marginBottom: "30px",
    color: "#2c3e50",
  },
  avatarContainer: {
    position: "relative",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    cursor: "pointer",
    marginBottom: "30px",
    overflow: "hidden", // Để overlay bo tròn theo ảnh
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
  },
  hoverOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    color: "#fff",
    fontSize: "12px",
    textAlign: "center",
    padding: "5px 0",
    opacity: 0.8,
  },
  infoGroup: {
    width: "100%",
    marginBottom: "15px",
  },
  label: {
    fontSize: "13px",
    color: "#7f8c8d",
    marginBottom: "5px",
    display: "block",
    fontWeight: "bold",
  },
  valueBox: {
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #eee",
    color: "#2c3e50",
    fontSize: "15px",
  },
  editBtn: {
    marginTop: "20px",
    padding: "12px",
    width: "100%",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2196F3",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  },
};

export default ProfilePage;
