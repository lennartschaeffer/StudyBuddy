import { createContext, useContext } from "react";
import { FriendsAndInvites } from "../Models/RequestsAndInvites";
import { useAuth } from "./useAuth";
import { useQuery } from "react-query";
import { getFriendRequestsAndGroupInvites } from "../endpoints/FriendRequests";

type FriendsAndInvitesContext = {
  friendsAndInvites: FriendsAndInvites | undefined;
  refetch: () => void;
};

const FriendsAndInvitesContext = createContext<FriendsAndInvitesContext>(
  {} as FriendsAndInvitesContext
);

export type Props = { children: React.ReactNode };

export const FriendsAndInvitesProvider = ({ children }: Props) => {
  const { user, isLoggedIn } = useAuth();
  console.log(isLoggedIn());
  const { data: friendsAndInvites, refetch } = useQuery(
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
    <FriendsAndInvitesContext.Provider value={{ friendsAndInvites, refetch }}>
      {children}
    </FriendsAndInvitesContext.Provider>
  );
};

export const useGetFriendsAndInvites = () =>
  useContext(FriendsAndInvitesContext);
