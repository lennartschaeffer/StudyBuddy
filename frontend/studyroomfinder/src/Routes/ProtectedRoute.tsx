import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../Context/useAuth";
import SideBar from "../Components/SideBar";

type Props = { children: React.ReactNode };

const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const [minimizeSideBar, setMinimizeSideBar] = useState<boolean>(false);
  const [sideBarSize, setSideBarSize] = useState<string>("col-2");
  const [mainComponentSize, setMainComponentSize] = useState<string>("col-10");
  useEffect(() => {
    if (minimizeSideBar) {
      setSideBarSize("col-1");
      setMainComponentSize("col-11");
    } else {
      setSideBarSize("col-2");
      setMainComponentSize("col-10");
    }
  }, [minimizeSideBar]);
  return isLoggedIn() ? (
    <div className="row w-100 m-0 h-100">
      <div className={`${sideBarSize} p-0`}>
        <SideBar minimize={() => setMinimizeSideBar(!minimizeSideBar)}/>
      </div>
      <div className={`${mainComponentSize} p-0`}>{children}</div>
    </div>
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

export default ProtectedRoute;
