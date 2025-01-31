import { Outlet } from "react-router-dom";
import "./App.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { UserProvider } from "./Context/useAuth";
import { FriendsAndInvitesProvider } from "./Context/useGetFriendsAndInvites";
import { StudyGroupProvider } from "./Context/useGetStudyGroups";
import { ThemeProvider } from "./components/lightdarkmodes/theme-provider";

const queryClient = new QueryClient();

function App() {
  
  
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
