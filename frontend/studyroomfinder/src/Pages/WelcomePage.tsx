import NavBar from "../components/NavBar";
import "./HomePage.css";
import { Link } from "react-router-dom";
const WelcomePage = () => {
  return (
    <div className="Main vh-100 ">
      <div className="h-100 ">
        <div className="h-100 d-flex flex-column justify-content-center align-items-center">
          <div className="col-6 d-flex flex-column justify-content-start">
            <h1 className="text-center text-light display-4 mb-4">
              Welcome to StudyBuddy.
            </h1>
            <p className="text-light text-center lead">
              StudyBuddy is designed to help you find the perfect study spots
              around you. Simply use the map to explore and discover new places
              to study, complete with details on busyness levels and additional
              information to make your study sessions productive and enjoyable.
            </p>
            <div className="d-flex flex-column align-items-center"> 
            <Link to={"/login"} className="btn btn-light mt-4 w-50 ">
              <b>Log In</b>
            </Link>
            <Link to={"/register"} className="btn btn-link">
              Don't have an account? Click here to register.
            </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
