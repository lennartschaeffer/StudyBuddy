import { Outlet } from "react-router-dom";
import "./App.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { useAuth, UserProvider } from "./Context/useAuth";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { API_URL } from "./apiRoute";
import { FriendsAndInvitesProvider } from "./Context/useGetFriendsAndInvites";
import { StudyGroupProvider } from "./Context/useGetStudyGroups";
import { ThemeProvider } from "./components/lightdarkmodes/theme-provider";

const queryClient = new QueryClient();

function App() {
  
  const socket = io(API_URL);
  useEffect(() => {
    socket.on("receive_message", (data) => {
      
    });
  }, [socket]);
  
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <FriendsAndInvitesProvider>
            <StudyGroupProvider>
              <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
              <Outlet />
              </ThemeProvider>
            </StudyGroupProvider>
          </FriendsAndInvitesProvider>
        </UserProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
