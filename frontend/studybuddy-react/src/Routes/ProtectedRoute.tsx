import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/useAuth";
import Page from "@/app/dashboard/page";

type Props = { children: React.ReactNode };

const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  return isLoggedIn() ? (
    <Page children={children}/>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
