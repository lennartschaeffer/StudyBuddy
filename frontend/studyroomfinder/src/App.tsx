import { Outlet } from "react-router-dom";
import "./App.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { useAuth, UserProvider } from "./Context/useAuth";
import { Toast, ToastContainer } from "react-bootstrap";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { API_URL } from "./apiRoute";
import { toast } from "react-toastify";
import { FriendsAndInvitesProvider } from "./Context/useGetFriendsAndInvites";
import { StudyGroupProvider } from "./Context/useGetStudyGroups";
import NavBar from "./Components/NavBar";
import SideBar from "./Components/SideBar";

const queryClient = new QueryClient();

function App() {
  const socket = io(API_URL);
  useEffect(() => {
    socket.on("receive_message", (data) => {
      toast.dark(data.message);
    });
  }, [socket]);
  
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <FriendsAndInvitesProvider>
            <StudyGroupProvider>
              <Outlet />
            </StudyGroupProvider>
          </FriendsAndInvitesProvider>
        </UserProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
