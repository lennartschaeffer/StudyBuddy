import React, { useState } from "react";
import "./SideBar.css";
import { Link } from "react-router-dom";
import { IoSchoolOutline } from "react-icons/io5";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaExpandArrowsAlt,
  FaBook,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import { FaUserGroup } from "react-icons/fa6";
import { RxCross1, RxExit } from "react-icons/rx";
import { GiHamburgerMenu } from "react-icons/gi";
import { useAuth } from "../Context/useAuth";
import FriendRequests from "./FriendRequests";
import { ToastContainer } from "react-toastify";

interface SideBarProps {
  minimize: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ minimize }) => {
  const [minimized, setMinimized] = useState<boolean>(false);
  const [showRequestsAndInvites, setShowRequestsAndInvites] =
    useState<boolean>(false);
  const { logout } = useAuth();
  const handleMinimizeSideBar = () => {
    setMinimized(!minimized);
    minimize();
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="bg-dark col-auto col-12 min-vh-100">
          {!minimized ? (
            <Link
              to={"/home"}
              className="text-light text-decoration-none d-flex align-items-center gap-4"
            >
              <h4 className="m-3">StudyBuddy</h4>
              <RxCross1 onClick={handleMinimizeSideBar} />
            </Link>
          ) : (
            <GiHamburgerMenu
              onClick={handleMinimizeSideBar}
              className="text-light m-3"
              size={30}
            />
          )}
          <hr className="text-light" />
          <ul className="nav nav-pills flex-column h-75">
            <li className="nav-item">
              <Link
                to={"/studysession"}
                className="nav-link text-light d-flex align-items-center gap-2"
              >
                <IoSchoolOutline size={minimized ? 25 : 15} />
                {!minimized && <h5 className="m-0">Session</h5>}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={"/studygroups"}
                className="nav-link text-light d-flex align-items-center gap-2"
              >
                <FaUserGroup size={minimized ? 25 : 15} />
                {!minimized && <h5 className="m-0">Study Groups</h5>}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={"/profile"}
                className="nav-link text-light d-flex align-items-center gap-2"
              >
                <FaUser size={minimized ? 25 : 15} />
                {!minimized && <h5 className="m-0">Profile</h5>}
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={"/findbuddies"}
                className="nav-link text-light d-flex align-items-center gap-2"
              >
                <FaSearch size={minimized ? 25 : 15} />
                {!minimized && <h5 className="m-0">Find Buddies</h5>}
              </Link>
            </li>
            <li className="nav-item">
              <button
                onClick={() => setShowRequestsAndInvites(true)}
                className="btn btn-link text-light d-flex align-items-center gap-2 text-decoration-none"
              >
                <FaUserPlus size={minimized ? 25 : 15} />
                {!minimized && <h5 className="m-0">Friend Requests</h5>}
              </button>
            </li>
            <li className="nav-item">
              <Link
                to={"/map"}
                className="nav-link text-light d-flex align-items-center gap-2"
              >
                <FaMapMarkerAlt size={minimized ? 25 : 15} />
                {!minimized && <h5 className="m-0">Map</h5>}
              </Link>
            </li>
            
          </ul>
          <ul className="nav nav-pills flex-column ">
            <li className="nav-item">
              <button
                className="btn btn-link text-light d-flex align-items-center gap-2 text-decoration-none"
                onClick={logout}
              >
                <RxExit size={25} />
                {!minimized && <h5 className="m-0 ">Log Out</h5>}
              </button>
            </li>
          </ul>
        </div>
      </div>
      <FriendRequests
        show={showRequestsAndInvites}
        handleClose={() => setShowRequestsAndInvites(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default SideBar;
