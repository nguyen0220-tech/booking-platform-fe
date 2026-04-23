import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfileApi,
  uploadAvatarApi,
  updateProfileApi,
} from "../api/profileApi";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Quản lý thông báo tại chỗ cho từng field
  // field: 'AVATAR', 'FULL_NAME', 'EMAIL', 'PHONE'
  const [inlineMsg, setInlineMsg] = useState({
    field: null,
    message: "",
    type: "success",
  });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  // Hàm hiển thị thông báo ngay tại vị trí đang sửa
  const showInlineMsg = (field, message, type = "success") => {
    setInlineMsg({ field, message, type });
    setTimeout(() => {
      setInlineMsg({ field: null, message: "", type: "" });
    }, 4000); // Hiện lâu hơn chút vì text có thể dài
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getProfileApi();
      setProfile(res.data);
    } catch (err) {
      navigate("/");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (!uploading) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      // Xóa các thông báo inline cũ của AVATAR (nếu có) để bắt đầu quá trình mới
      setInlineMsg({ field: null, message: "", type: "" });

      const res = await uploadAvatarApi(file);

      // Backend trả về link ảnh mới trong res.data
      // Cập nhật profile state để ảnh trên giao diện thay đổi ngay lập tức
      if (res.data) {
        setProfile((prev) => ({ ...prev, avatarUrl: res.data }));
      }

      // Hiển thị thông báo thành công từ Backend
      showInlineMsg("AVATAR", res.message || "업로드 성공!", "success");
    } catch (err) {
      showInlineMsg("AVATAR", err.message || "업로드 실패", "error");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleSaveEdit = async () => {
    const currentField = editingField; // Lưu lại field đang sửa để hiện thông báo đúng chỗ
    if (!confirmPassword) {
      showInlineMsg(currentField, "비밀번호를 입혁해 주세요!", "error");
      return;
    }

    try {
      setIsSaving(true);
      const res = await updateProfileApi({
        type: currentField,
        newInfo: editValue,
        confirmPassword: confirmPassword,
      });

      // Hiện thông báo thành công (bao gồm cả tiếng Hàn từ BE)
      showInlineMsg(currentField, res.message, "success");

      setEditingField(null);
      setConfirmPassword("");
      fetchProfile();
    } catch (err) {
      showInlineMsg(currentField, err.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Component phụ hiển thị dòng thông báo nhỏ
  const MessageLabel = ({ fieldID }) => {
    if (inlineMsg.field !== fieldID) return null;
    return (
      <div
        style={{
          ...styles.inlineMessage,
          color: inlineMsg.type === "error" ? "#e74c3c" : "#27ae60",
        }}
      >
        {inlineMsg.type === "error" ? "⚠️ " : ""}
        {inlineMsg.message}
      </div>
    );
  };

  const renderField = (label, typeEnum, currentValue) => {
    const isEditing = editingField === typeEnum;

    return (
      <div style={styles.infoGroup}>
        <div style={styles.labelRow}>
          <label style={styles.label}>{label}</label>
          {/* Hiển thị thông báo ngay cạnh Label nếu field này đang có thông báo */}
          <MessageLabel fieldID={typeEnum} />
        </div>

        {!isEditing ? (
          <div style={styles.valueRow}>
            <div style={styles.valueText}>{currentValue}</div>
            <button
              style={styles.smallEditBtn}
              onClick={() => {
                setEditingField(typeEnum);
                setEditValue(currentValue);
                setConfirmPassword("");
              }}
            >
              ✏️
            </button>
          </div>
        ) : (
          <div style={styles.editContainer}>
            <input
              style={styles.inputField}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={`Nhập ${label}`}
            />
            <input
              style={styles.inputField}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인"
            />
            <div style={styles.actionRow}>
              <button
                style={styles.saveBtn}
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? "..." : "저장"}
              </button>
              <button
                style={styles.cancelBtn}
                onClick={() => setEditingField(null)}
                disabled={isSaving}
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div style={styles.center}>Đang tải...</div>;
  if (error) return <div style={styles.centerError}>{error}</div>;
  if (!profile) return null;

  return (
    <div style={styles.layout}>
      <button style={styles.backBtn} onClick={() => navigate("/home")}>
        ⬅ Home
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>개인 정보</h2>

        <div style={styles.avatarSection}>
          <div style={styles.avatarContainer} onClick={handleAvatarClick}>
            <img
              src={profile.avatarUrl || "/avatar.png"} // Ảnh sẽ tự cập nhật khi setProfile được gọi
              alt="Avatar"
              style={styles.avatarImg}
            />
            {uploading && (
              <div style={styles.uploadOverlay}>
                <span className="spinner" style={styles.rotatingSpinner}>
                  ⏳
                </span>
              </div>
            )}
            {!uploading && <div style={styles.hoverOverlay}>📷 사진 변경</div>}
          </div>

          {/* Khu vực thông báo tại chỗ cho Avatar */}
          <div style={{ height: "20px", marginTop: "5px" }}>
            {uploading ? (
              <div style={{ ...styles.inlineMessage, color: "#3498db" }}>
                프로필 사진 업로드 중... (Đang tải lên...)
              </div>
            ) : (
              <MessageLabel fieldID="AVATAR" />
            )}
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {renderField("이름", "FULL_NAME", profile.fullName)}
        {renderField("Email", "EMAIL", profile.email)}
        {renderField("전화 번호", "PHONE", profile.phone)}
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
  card: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "20px",
  },
  avatarContainer: {
    position: "relative",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    cursor: "pointer",
    overflow: "hidden",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    marginBottom: "5px",
  },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  inlineMessage: {
    fontSize: "12px",
    fontWeight: "500",
    marginTop: "2px",
    animation: "fadeIn 0.3s",
  },
  labelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "5px",
  },
  label: { fontSize: "13px", color: "#7f8c8d", fontWeight: "bold" },
  valueRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #eee",
  },
  valueText: { color: "#2c3e50", fontSize: "14px" },
  smallEditBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
  },
  editContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "10px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    border: "1px solid #2196F3",
  },
  inputField: {
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },
  actionRow: { display: "flex", justifyContent: "flex-end", gap: "8px" },
  saveBtn: {
    padding: "6px 12px",
    backgroundColor: "#2196F3",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  cancelBtn: {
    padding: "6px 12px",
    backgroundColor: "#95a5a6",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  title: { textAlign: "center", marginBottom: "25px", color: "#2c3e50" },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: "20px",
    padding: "8px 12px",
    cursor: "pointer",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#fff",
  },
};

export default ProfilePage;
