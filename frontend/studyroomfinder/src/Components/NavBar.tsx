import { Link } from "react-router-dom";
import "../Pages/HomePage.css";
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { API_URL } from "../apiRoute";
import { IoIosNotifications } from "react-icons/io";
import {
  Container,
  Dropdown,
  Nav,
  Navbar,
  NavDropdown,
  ToastContainer,
} from "react-bootstrap";
import { toast } from "react-toastify";
import FriendRequests from "./FriendRequests";
import { BsPersonBadge } from "react-icons/bs";
import { useAuth } from "../Context/useAuth";
import "./NavBar.css";

function NavBar() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showPendingRequests, setShowPendingRequests] =
    useState<boolean>(false);

  // const { user } = useAuth();
  // useEffect(() => {
  //   const newSocket = io(API_URL);
  //   setSocket(newSocket);

  //   //join the room to listen for study session notifications
  //   if (user?.user_id) {
  //     newSocket.emit("joinRoom", user.user_id);
  //     console.log(`User ${user.user_id} joined room ${user.user_id}`);
  //   }

  //   //friend request sent notification
  //   newSocket.on("friendRequest", (data) => {
  //     if (data.receiver_id === user?.user_id) {
  //       toast.dark(`New friend request from user ID: ${data.sender_id}`);
  //       setNotifications([
  //         ...notifications,
  //         `New friend request from user ID: ${data.sender_id}`,
  //       ]);
  //     }
  //   });

  //   //friend request response notification
  //   newSocket.on("friendRequestResponse", (data) => {
  //     console.log(data);
  //     //if the person who sent the request is the current user, notify their request was accepted
  //     if (data.sender_id === user?.user_id) {
  //       toast.dark(`Friend request from user ID: ${data.sender_id} accepted`);
  //       setNotifications([
  //         ...notifications,
  //         `User: ${data.sender_id} ${data.response} your friend request`
  //       ]);
  //     }
  //   });

  //   //study session started notification
  //   newSocket.on("studySessionStarted", (data) => {
  //     console.log(data);
  //     if (data.user_id !== user?.user_id) {
  //       toast.info(`Your friend started a study session: ${data.session_name}`);
  //       setNotifications((prevNotifications) => [
  //         ...prevNotifications,
  //         `Your friend started a study session: ${data.session_name}`,
  //       ]);
  //     }
  //   });

  //   return () => {
  //     newSocket.close();
  //   };
  // }, []);

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">StudyBuddy</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <NavDropdown title="Sessions & Groups" id="basic-nav-dropdown">
              <NavDropdown.Item>
                <Link to={"/studysession"} className="nav-link">
                  Session
                </Link>
              </NavDropdown.Item>
              <NavDropdown.Item>
                <Link to={"/studygroups"} className="nav-link">
                  Study Groups
                </Link>
              </NavDropdown.Item>
              <NavDropdown.Item></NavDropdown.Item>
              <NavDropdown.Item>
                <Link to={"/findbuddies"} className="nav-link">
                  Find Buddies
                </Link>
              </NavDropdown.Item>
              <NavDropdown.Divider />
            </NavDropdown>
            <Link to={"/profile"} className="nav-link">
              Profile
            </Link>
            <Link to={"/map"} className="nav-link">
              Map
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
