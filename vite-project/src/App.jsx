import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ForgotAccountPage from "./pages/ForgotAccountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RegistryResponsePage from "./pages/RegistryResponsePage";
import UserPage from "./pages/UserPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import ProfileVerifyPage from "./pages/ProfileVerifyPage";
import FacilityPage from "./pages/FacilityPage";
import FacilityRegistryPage from "./pages/FacilityRegistryPage";
import FacilityDetailsPage from "./pages/FacilityDetailsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-account" element={<ForgotAccountPage />} />
      <Route path="/forgot-password" element={<ResetPasswordPage />} />
      <Route path="/verify" element={<RegistryResponsePage />} />
      <Route path="/users" element={<UserPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/verify" element={<ProfileVerifyPage />} />
      <Route path="/facilities" element={<FacilityPage />} />
      <Route path="/facility-registry" element={<FacilityRegistryPage />} />
      <Route
        path="/facility-details/:id"
        element={<FacilityDetailsPage />}
      />{" "}
    </Routes>
  );
}

export default App;
