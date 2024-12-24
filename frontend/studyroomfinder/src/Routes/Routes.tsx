import { createBrowserRouter } from "react-router-dom";
import WelcomePage from "../Pages/WelcomePage";
import MapPage from "../Pages/MapPage";
import RegistrationPage from "../Pages/RegistrationPage";
import HomePage from "../Pages/HomePage";
import LoginPage from "../Pages/LoginPage";
import ProfilePage from "../Pages/ProfilePage";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";
import StudySessionPage from "../Pages/StudySessionPage";
import FindBuddiesPage from "../Pages/FindBuddiesPage";
import StudyGroupPage from "../Pages/StudyGroupPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <WelcomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegistrationPage /> },
      {
        path: "home",
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "map",
        element: (
          <ProtectedRoute>
            <MapPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: "studysession",
        element: (
          <ProtectedRoute>
            <StudySessionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "findbuddies",
        element: (
          <ProtectedRoute>
            <FindBuddiesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "studygroups",
        element: (
          <ProtectedRoute>
            <StudyGroupPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
