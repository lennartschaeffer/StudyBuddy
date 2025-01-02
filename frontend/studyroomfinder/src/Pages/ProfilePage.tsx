import "./HomePage.css";
import NavBar from "../Components/NavBar";
import { useState } from "react";
import { useAuth } from "../Context/useAuth";
import { SoloStudySession } from "../Models/StudySession";
import { BiUserCircle } from "react-icons/bi";
import { CiSettings } from "react-icons/ci";
import { IoMdTime } from "react-icons/io";
import { IoBookOutline } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";

const ProfilePage = () => {
  const { user, logout } = useAuth();

  const handleLogOut = () => {
    logout();
  };

  return (
    <div className="Main vh-100">
      <div className="h-100">
        <div className="container pt-5">
          <div className="row w-100">
            <div className="card w-100">
              <div className="card-body">
                <div className="row">
                  <div className="col-1">
                    <BiUserCircle size={80} />
                  </div>
                  <div className="col-6">
                    <h3 className="m-0">
                      <strong>
                        {user?.first_name} {user?.last_name}
                      </strong>
                    </h3>
                    <p className="text-muted m-0">
                      <strong>Computer Science Major</strong>
                    </p>
                    <p className="text-muted">Dalhousie University</p>
                  </div>
                  <div className="col-5 d-flex justify-content-end align-items-center">
                    <button className="btn btn-dark">
                      Edit Profile <CiSettings />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          <div className="row w-100 mt-3">
              <div className="col-4">
                <div className="card w-100 h-100">
                  <div className="card-body">
                    <div className="card-text w-100 d-flex justify-content-between align-items-center">
                      <strong>Total Study Time</strong>
                      <IoMdTime />
                    </div>
                    <h4>
                      <strong>165 hours</strong>
                    </h4>
                    <p className="text-muted">This Month</p>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="card w-100 h-100">
                  <div className="card-body">
                    <div className="card-text w-100 d-flex justify-content-between align-items-center">
                      <strong>Study Sessions</strong>
                      <IoBookOutline />
                    </div>
                    <h4>
                      <strong>24</strong>
                    </h4>
                    <p className="text-muted">This Month</p>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="card w-100 h-100">
                  <div className="card-body">
                    <div className="card-text w-100 d-flex justify-content-between align-items-center">
                      <strong>Study Groups</strong>
                      <FaUserGroup />
                    </div>
                    <h4>
                      <strong>3</strong>
                    </h4>
                    <p className="text-muted">
                      Studying is better with friends.
                    </p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
