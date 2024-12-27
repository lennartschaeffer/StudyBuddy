import "./HomePage.css";
import NavBar from "../Components/NavBar";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../apiRoute";
import { IoSchoolSharp } from "react-icons/io5";
import { useAuth } from "../Context/useAuth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { StudySession } from "../Models/StudySession";
import { format,parseISO } from "date-fns";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  

  const getRecentStudySessions = async () => {
    await axios
      .get(`${API_URL}/studysessions/recentStudySessions/${user?.user_id}`)
      .then((res) => {
        console.log(res.data);
        setRecentSessions(res.data);
      })
      .catch((err) => {
        console.log(err);
        toast.error(
          "Error occurred getting your recent study sessions :( " + err
        );
      });
  };

  useEffect(() => {
    getRecentStudySessions();
  }, []);

  const handleLogOut = () => {
    logout();
  };

  return (
    <div className="Main vh-100">
      <div className="h-100">
        <NavBar />
        <div className="h-75 d-flex flex-column justify-content-center align-items-center">
          <div className="col-6 d-flex flex-column justify-content-start">
            <h1 className="text-center text-light">
              {user?.first_name}'s Recent Sessions <IoSchoolSharp />
            </h1>
            
            <div className="row mt-5">
              {recentSessions.length > 0 ? (
                recentSessions.map((session, id) => (
                  <div className="col-4" key={id}>
                    <div className="card h-100" style={{boxShadow: "10px 10px 5px 3px rgba(0,0,0,0.75)"}}>
                      <div className="card-header">
                        <h4>{session?.session_name}</h4>
                      </div>
                      <div className="card-body">
                        <div className="card-text">Start Time: {format(parseISO(session?.start_time), "HH:mm")}</div>
                        <div className="card-text">End Time: {format(parseISO(session?.end_time), "HH:mm")}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 d-flex flex-column justify-content-center align-items-center mt-3">
                  <p className="text-center text-light">
                    You have no recent study sessions :/
                  </p>
                  <Link to={"/studysession"} className="btn btn-light">
                    <b>Start one now!</b>
                  </Link>
                </div>
              )}
            </div>
            <button className="btn btn-danger btn-block mt-5" onClick={handleLogOut}>Log Out</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
