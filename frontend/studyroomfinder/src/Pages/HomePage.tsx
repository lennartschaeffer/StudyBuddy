import NavBar from "../Components/NavBar";
import "./HomePage.css";
import { useAuth } from "../Context/useAuth";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getRecentStudySessions } from "../endpoints/StudySessions";
import { StudySession } from "../Models/StudySession";
import { ListGroup } from "react-bootstrap";
import { FaMapMarker, FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { IoSchoolOutline } from "react-icons/io5";
import { FaUser, FaUserGroup } from "react-icons/fa6";
const HomePage = () => {
  const { user } = useAuth();
  const {data: recentStudySessions} = useQuery(
    "recentStudySessions", () => getRecentStudySessions(user?.user_id!), {
    enabled: !!user?.user_id,
    onError: (error) => {
      console.error("Failed to fetch recent study sessions:", error);
    },
    onSuccess: (data) => {
      console.log(recentStudySessions);
    }
  }
);
  
  return (
    <div className="Main vh-100 ">
      <div className="h-100 ">
        <NavBar />
        <div className="container h-75 d-flex flex-column justify-content-center align-items-center">
          <h1 className="text-center text-light">
            Welcome Back {user?.first_name}!
          </h1>
          <div className="row mt-5">
            <div className="col-8">
              <div className="row">
                <div className="col-6 mb-2">
                  <div
                    className="card h-100"
                    style={{ boxShadow: "10px 10px 5px 3px rgba(0,0,0,0.75)" }}
                  >
                    <div className="card-body">
                      <h4 className="m-0">
                        <strong>Start a Study Session</strong>
                      </h4>
                      <p className="text-muted">
                        Begin a solo or group study session
                      </p>
                      <Link
                        to={"/studysession"}
                        className="btn btn-dark d-block"
                      >
                        <IoSchoolOutline className="m-2"/>
                        <strong>Start</strong>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-6 mb-2">
                  <div
                    className="card h-100"
                    style={{ boxShadow: "10px 10px 5px 3px rgba(0,0,0,0.75)" }}
                  >
                    <div className="card-body">
                      <h4 className="m-0">
                        
                        <strong>Find a Spot</strong>{" "}
                      </h4>
                      <p className="text-muted">
                        Discover nearby places to study
                      </p>
                      <Link to={"/map"} className="btn btn-dark d-block">
                      <FaMapMarkerAlt className="m-2"/>
                        <strong>View Map</strong>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className="card h-100 "
                    style={{ boxShadow: "10px 10px 5px 3px rgba(0,0,0,0.75)" }}
                  >
                    <div className="card-body">
                      <h4 className="m-0">
                        <strong>Create A Group</strong>
                      </h4>
                      <p className="text-muted">
                        Start a study group with friends
                      </p>
                      <Link to={"/home"} className="btn btn-dark d-block">
                      <FaUserGroup className="m-2"/>
                        <strong>Connect with Friends</strong>
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div
                    className="card h-100 "
                    style={{ boxShadow: "10px 10px 5px 3px rgba(0,0,0,0.75)" }}
                  >
                    <div className="card-body">
                      <h4 className="m-0">
                        <strong>Find StudyBuddies</strong>
                      </h4>
                      <p className="text-muted">
                        Connect with other students
                      </p>
                      <Link to={"/home"} className="btn btn-dark d-block">
                      <FaSearch className="m-2"/>
                        <strong>Search Buddies</strong>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="card">
                <div className="card-body">
                  <h3>
                    <strong>Recent Study Sessions</strong>
                  </h3>
                  <p className="text-muted">View your recent study sessions</p>
                  <ListGroup>
                  {
                    recentStudySessions?.userSessions.length > 0 ? (
                      recentStudySessions?.userSessions.map((session: StudySession, id: number) => (
                        <ListGroup.Item key={id}>
                          <div className="row">
                            <div className="col-12 d-flex justify-content-between">
                              <b>{session.session_name}</b>
                              <FaUser/>
                            </div>
                            <div className="col-6">
                              <p
                                className="text-muted"
                                style={{ fontSize: "12px" }}
                              >
                                {new Date(session.start_time)
                                  .toLocaleString("en-US", {
                                    month: "numeric",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                  .replace(",", " at")}
                              </p>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <h6 className="card-text">No recent solo sessions.</h6>
                    )
                  }
                  {
                    recentStudySessions?.groupSessions.length > 0 ? (
                      recentStudySessions?.groupSessions.map((session: StudySession, id: number) => (
                        <ListGroup.Item key={id}>
                          <div className="row">
                            <div className="col-12 d-flex justify-content-between">
                              <b>{session.session_name}</b>
                              <FaUserGroup/>
                            </div>
                            <div className="col-6">
                              <p
                                className="text-muted"
                                style={{ fontSize: "12px" }}
                              >
                                {new Date(session.start_time)
                                  .toLocaleString("en-US", {
                                    month: "numeric",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                  .replace(",", " at")}
                              </p>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <h6 className="card-text mt-2">No recent group sessions.</h6>
                    )
                  }
                  </ListGroup>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
