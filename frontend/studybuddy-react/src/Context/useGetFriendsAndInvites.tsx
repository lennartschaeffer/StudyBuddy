import { createContext, useContext } from "react";
import { FriendsAndInvites } from "../Models/RequestsAndInvites";
import { useAuth } from "./useAuth";
import { useQuery } from "react-query";
import { getFriendRequestsAndGroupInvites } from "../controllers/FriendRequestsController";

type FriendsAndInvitesContext = {
  friendsAndInvites: FriendsAndInvites | undefined;
  refetch: () => void;
  isLoading: boolean;
  error: any;
};

const FriendsAndInvitesContext = createContext<FriendsAndInvitesContext>(
  {} as FriendsAndInvitesContext
);

export type Props = { children: React.ReactNode };

export const FriendsAndInvitesProvider = ({ children }: Props) => {
  const { user, isLoggedIn } = useAuth();

  const { data: friendsAndInvites, refetch, isLoading, error } = useQuery(
    ["requestsAndInvites", user?.user_id],
    () => getFriendRequestsAndGroupInvites(user?.user_id!),
    {
      enabled: isLoggedIn() && !!user?.user_id,
      staleTime: 5000,
      onSuccess: () => {
        
      },
      onError: (error) => {
        console.log("Error fetching friends and invites: ", error);
       
      }
    }
  );


  return (
    <FriendsAndInvitesContext.Provider value={{ friendsAndInvites, refetch, isLoading, error }}>
      {children}
    </FriendsAndInvitesContext.Provider>
  );
};

export const useGetFriendsAndInvites = () =>
  useContext(FriendsAndInvitesContext);
