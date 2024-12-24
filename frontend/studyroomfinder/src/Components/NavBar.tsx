import { Link } from "react-router-dom";
import "../Pages/HomePage.css";
import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";
import { API_URL } from "../apiRoute";
import { IoIosNotifications } from "react-icons/io";
import { Dropdown, ToastContainer } from "react-bootstrap";
import { toast } from "react-toastify";
import FriendRequests from "./FriendRequests";
import { BsPersonBadge } from "react-icons/bs";
import { useAuth } from "../Context/useAuth";

function NavBar() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showPendingRequests, setShowPendingRequests] =
    useState<boolean>(false);

  const { user } = useAuth();
  useEffect(() => {
    const newSocket = io(API_URL);
    setSocket(newSocket);

    //join the room to listen for study session notifications
    if (user?.user_id) {
      newSocket.emit("joinRoom", user.user_id);
      console.log(`User ${user.user_id} joined room ${user.user_id}`);
    }

    //friend request sent notification
    newSocket.on("friendRequest", (data) => {
      if (data.receiver_id === user?.user_id) {
        toast.dark(`New friend request from user ID: ${data.sender_id}`);
        setNotifications([
          ...notifications,
          `New friend request from user ID: ${data.sender_id}`,
        ]);
      }
    });

    //friend request response notification
    newSocket.on("friendRequestResponse", (data) => {
      console.log(data);
      //if the person who sent the request is the current user, notify their request was accepted
      if (data.sender_id === user?.user_id) {
        toast.dark(`Friend request from user ID: ${data.sender_id} accepted`);
        setNotifications([
          ...notifications,
          `User: ${data.sender_id} ${data.response} your friend request`
        ]);
      }
    });

    //study session started notification
    newSocket.on("studySessionStarted", (data) => {
      console.log(data);
      if (data.user_id !== user?.user_id) {
        toast.info(`Your friend started a study session: ${data.session_name}`);
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          `Your friend started a study session: ${data.session_name}`,
        ]);
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <ul className="nav d-flex justify-content-center align-items-center pt-4">
      <li className="nav-item">
        <Link to={"/home"} className="nav-link active text-light">
          <h4>StudyBuddy</h4>
        </Link>
      </li>
      <li className="nav-item">
        <Link to={"/map"} className="nav-link text-light">
          <h5>Map</h5>
        </Link>
      </li>
      <li className="nav-item">
        <Link to={"/studysession"} className="nav-link text-light">
          <h5>Session</h5>
        </Link>
      </li>
      <li className="nav-item">
        <Link to={"/profile"} className="nav-link text-light">
          <h5>Profile</h5>
        </Link>
      </li>
      <li className="nav-item">
        <Link to={"/findbuddies"} className="nav-link text-light">
          <h5>Find Buddies</h5>
        </Link>
      </li>
      <li className="nav-item">
        <Link to={"/studygroups"} className="nav-link text-light">
          <h5>Study Groups</h5>
        </Link>
      </li>
      {notifications.length > 0 && (
        <Dropdown className="mb-2 ml-4">
          <Dropdown.Toggle variant="outline-success" id="dropdown-basic">
            <IoIosNotifications size={20} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {notifications.map((noti, id) => (
              <Dropdown.Item key={id}>{noti}</Dropdown.Item>
            ))}
            <Dropdown.Item>
              <button
                className="btn btn-dark btn-block"
                onClick={() => setShowPendingRequests(true)}
              >
                <BsPersonBadge />
              </button>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
      <li className="nav-item">
        <button
          className="btn btn-link text-light"
          onClick={() => setShowPendingRequests(true)}
        >
          <BsPersonBadge size={30} />
        </button>
      </li>
      <FriendRequests
        show={showPendingRequests}
        handleClose={() => setShowPendingRequests(false)}
      />
      <ToastContainer />
    </ul>
  );
}

export default NavBar;
