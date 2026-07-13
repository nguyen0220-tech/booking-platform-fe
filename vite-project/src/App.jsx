import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ForgotAccountPage from "./pages/ForgotAccountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RegistryResponsePage from "./pages/RegistryResponsePage";
import UserPage from "./pages/UserPage";
import HomeForAdmin from "./pages/HomeForAdmin";
import HomeForProvider from "./pages/HomeForProvider";
import HomeForUser from "./pages/HomeForUser";
import ProfilePage from "./pages/ProfilePage";
import ProfileVerifyPage from "./pages/ProfileVerifyPage";
import FacilityPage from "./pages/FacilityPage";
import FacilityRegistryPage from "./pages/FacilityRegistryPage";
import FacilityDetailsPage from "./pages/FacilityDetailsPage";
import RegistrationRequestPage from "./pages/RegistrationRequestPage";
import RegistrationRequestDetailsPage from "./pages/RegistrationRequestDetailsPage";
import RestaurantMenuPage from "./pages/RestaurantMenuPage";
import FacilityPackagePage from "./pages/FacilityPackagePage";
import FacilitySearchPage from "./pages/FacilitySearchPage";
import PackagePublicViewPage from "./pages/PackagePublicViewPage";
import BookingPage from "./pages/BookingPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import PopularDestinationFacilities from "./pages/PopularDestinationFacilities";
import FacilityReviewsPage from "./pages/FacilityReviewsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-account" element={<ForgotAccountPage />} />
      <Route path="/forgot-password" element={<ResetPasswordPage />} />
      <Route path="/verify" element={<RegistryResponsePage />} />
      <Route path="/users" element={<UserPage />} />
      <Route path="/admin" element={<HomeForAdmin />} />
      <Route path="/provider" element={<HomeForProvider />} />
      <Route path="/home" element={<HomeForUser />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/verify" element={<ProfileVerifyPage />} />
      <Route path="/facilities" element={<FacilityPage />} />
      <Route path="/facilities/:id/menus" element={<RestaurantMenuPage />} />
      <Route path="/facilities/:id/reviews" element={<FacilityReviewsPage />} />
      <Route path="/facility-registry" element={<FacilityRegistryPage />} />
      <Route path="/facility-details/:id" element={<FacilityDetailsPage />} />
      <Route
        path="/registration-requests"
        element={<RegistrationRequestPage />}
      />
      <Route
        path="/registration-requests/details/:id"
        element={<RegistrationRequestDetailsPage />}
      />
      <Route
        path="/facilities/:id/package-sport"
        element={<FacilityPackagePage />}
      />
      <Route
        path="/facilities/:id/package-motel"
        element={<FacilityPackagePage />}
      />
      <Route
        path="/facilities/:id/package-restaurant"
        element={<FacilityPackagePage />}
      />
      <Route path="/search" element={<FacilitySearchPage />} />
      <Route path="/facilities/:id" element={<PackagePublicViewPage />} />
      <Route path="/reservations" element={<BookingPage />} />
      <Route path="/reservations/:bookingId" element={<BookingDetailsPage />} />
      <Route
        path="/destinations/:slug"
        element={<PopularDestinationFacilities />}
      />
    </Routes>
  );
}

export default App;
