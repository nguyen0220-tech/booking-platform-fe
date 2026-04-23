import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegistryResponsePage from "./pages/RegistryResponsePage";
import UserPage from "./pages/UserPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProfileVerifyPage from "./pages/ProfileVerifyPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/verify" element={<RegistryResponsePage />} />
      <Route path="/users" element={<UserPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/verify" element={<ProfileVerifyPage />} />
    </Routes>
  );
}

export default App;
