import { useState } from "react";
import "./HomePage.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useAuth } from "../Context/useAuth";

const RegistrationPage = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const {registerUser} = useAuth();

  const handleRegister = async () => {
    if (!username || !password || !firstName || !lastName) {
      alert("Please fill out all fields.");
      return;
    }
    registerUser(username, password, firstName, lastName);
  }
  return (
    <div className="vh-100 Main">
      <div className="h-100 d-flex flex-column justify-content-center align-items-center">
        <h2 className="text-center text-light">Get Started.</h2>
        <Form className="p-4">
        <Form.Group className="mb-3" controlId="fname">
            <Form.Label className="text-light">First Name</Form.Label>
            <Form.Control type="text" placeholder="Enter First Name..." onChange={(e) => setFirstName(e.target.value)}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="lname">
            <Form.Label className="text-light">Last Name</Form.Label>
            <Form.Control type="text" placeholder="Enter Last Name..." onChange={(e) => setLastName(e.target.value)}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label className="text-light">Username</Form.Label>
            <Form.Control type="text" placeholder="Enter username..." onChange={(e) => setUserName(e.target.value)}/>
          </Form.Group>
          <Form.Group className="mb-3" controlId="password">
            <Form.Label className="text-light">Password</Form.Label>
            <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <Button variant="primary" className="btn-block" onClick={handleRegister}>
            Register
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default RegistrationPage;
