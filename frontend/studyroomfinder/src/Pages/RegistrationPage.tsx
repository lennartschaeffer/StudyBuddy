import { useState } from "react";
import "./HomePage.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useAuth } from "../Context/useAuth";
import { toast, ToastContainer } from "react-toastify";

const RegistrationPage = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const { registerUser } = useAuth();

  const handleRegister = async () => {
    if (!username || !password || !firstName || !lastName || !email) {
      toast.error("Please fill out all fields.");
      return;
    }
    registerUser(username, password, firstName, lastName, email);
  };
  return (
    <div className="vh-100 Main">
      <div className="h-100 d-flex flex-column justify-content-center align-items-center">
        <div
          className="card bg-light p-3"
          style={{ boxShadow: "0px 0px 20px 1px rgba(0,0,0,0.75)" }}
        >
          <div className="card-body">
            <div className="d-flex flex-column align-items-center justify-content-around border-bottom ">
              <h2 className="">
                <strong>Get Started.</strong>
              </h2>
              <p className="text-muted">
                Sign Up and Start Your Ideal Study Session.
              </p>
            </div>
            <Form className="p-4">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="">Email</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter email..."
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="">Username</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter username..."
                  onChange={(e) => setUserName(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="">First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter First Name..."
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label className="">Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Last Name..."
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label className="">Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>
              <Button variant="dark" className="w-100" onClick={handleRegister}>
                Register
              </Button>
            </Form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default RegistrationPage;
