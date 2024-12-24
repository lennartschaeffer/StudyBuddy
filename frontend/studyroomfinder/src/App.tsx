import { Outlet } from "react-router-dom";
import "./App.css";
import Map from "./Components/Map";
import NavBar from "./Components/NavBar";
import { UserProvider } from "./Context/useAuth";
import { Toast, ToastContainer } from "react-bootstrap";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { API_URL } from "./apiRoute";
import { toast } from "react-toastify";


function App() {
  const socket = io(API_URL)
  useEffect(() => {
    socket.on("receive_message", (data) => {
      toast.dark(data.message)
    })
  },[socket])
  return (
    <>
    <UserProvider>
      <Outlet />
      <ToastContainer/>
    </UserProvider>
    </>
  );
}

export default App;
