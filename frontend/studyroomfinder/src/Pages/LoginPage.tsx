import { useState } from "react";
import "./HomePage.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useAuth } from "../Context/useAuth";
import StudyIcon from "../icons/studying.png";
import { toast, ToastContainer } from "react-toastify";

const LoginPage = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { loginUser } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error("Please fill out all fields.");
      return;
    }
    loginUser(username, password);
  };

  return (
    <div className="vh-100 Main">
      <div className="h-100 d-flex flex-column justify-content-center align-items-center">
        <div
          className="p-5 rounded-lg"
          style={{ boxShadow: "0px 0px 20px 1px rgba(0,0,0,0.75)" }}
        >
          <div className="d-flex align-items-center justify-content-around border-bottom">
            <h1 className=" text-light m-0">Sign In</h1>
            <img
              src={StudyIcon}
              alt="studyIcon"
              className="mb-3 img-fluid"
              height={70}
              width={70}
              style={{ color: "white", filter: "invert(1)" }}
            />
          </div>
          <Form className="p-4">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className="text-light">Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username..."
                onChange={(e) => setUserName(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label className="text-light">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              className="btn-block"
              onClick={handleLogin}
            >
              Log In
            </Button>
          </Form>
        </div>
      </div>
      <ToastContainer/>
    </div>
  );
};

export default LoginPage;
