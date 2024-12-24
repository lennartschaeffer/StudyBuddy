import NavBar from "../Components/NavBar";
import "./HomePage.css";
import { useAuth } from "../Context/useAuth";
import { Link } from "react-router-dom";
import { FaMap } from "react-icons/fa";
import { IoPencil } from "react-icons/io5";
import { HiUserGroup } from "react-icons/hi2";
const HomePage = () => {
  const { user } = useAuth();
  return (
    <div className="Main vh-100 ">
      <div className="h-100 ">
        <NavBar />
        <div className="h-75 d-flex flex-column justify-content-center align-items-center">
          <div className="col-8 d-flex flex-column justify-content-start">
            <h1 className="text-center text-light">
              Welcome Back {user?.first_name}!
            </h1>
            <div className="row mt-5">
              <div className="col-4 ">
                <div className="card h-100" style={{boxShadow: "10px 10px 5px 3px rgba(0,0,0,0.75)"}}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="m-0">Start a Session</h4> 
                    <IoPencil size={30}/>
                  </div>
                  <div className="card-body">
                    {" "}
                    <Link to={"/studysession"} className="btn btn-dark btn-block">
                      Start
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="card h-100 " style={{boxShadow: "10px 10px 5px 3px rgba(0,0,0,0.75)"}}>
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="m-0">Find a Spot </h4> 
                    <FaMap size={30}/>
                  </div>
                  <div className="card-body d-flex align-items-center">
                    {" "}
                    <Link to={"/map"} className="btn btn-dark btn-block">
                      Start
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-4">
                <div className="card h-100 " style={{boxShadow: "10px 10px 5px 3px rgba(0,0,0,0.75)"}}>
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="m-0">Create A Group</h4> 
                    <HiUserGroup size={30}/>
                  </div>
                  <div className="card-body">
                    <Link to={"/home"} className="btn btn-dark btn-block">
                      Start
                    </Link>
                  </div>
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
