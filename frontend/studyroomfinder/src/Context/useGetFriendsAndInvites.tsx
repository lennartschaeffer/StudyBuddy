import { createContext, useContext } from "react";
import { FriendsAndInvites } from "../Models/RequestsAndInvites";
import { useAuth } from "./useAuth";
import { useQuery } from "react-query";
import { getFriendRequestsAndGroupInvites } from "../endpoints/FriendRequests";
import { useState } from "react";

type FriendsAndInvitesContext = {
  friendsAndInvites: FriendsAndInvites | undefined;
  refetch: () => void;
  fetchFriendsAndInvites: () => void;
  isLoading: boolean;
  error: any;
};

const FriendsAndInvitesContext = createContext<FriendsAndInvitesContext>(
  {} as FriendsAndInvitesContext
);

export type Props = { children: React.ReactNode };

export const FriendsAndInvitesProvider = ({ children }: Props) => {
  const { user, isLoggedIn } = useAuth();
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data: friendsAndInvites, refetch, isLoading, error } = useQuery(
    ["requestsAndInvites", user?.user_id],
    () => getFriendRequestsAndGroupInvites(user?.user_id!),
    {
      enabled: shouldFetch && isLoggedIn() && !!user?.user_id,
      staleTime: 5000,
      onSuccess: () => {
        setShouldFetch(false);
      },
      onError: (error) => {
        console.log("Error fetching friends and invites: ", error);
        setShouldFetch(false);
      }
    }
  );

  const fetchFriendsAndInvites = () => {
    setShouldFetch(true);
    refetch();
  };

  return (
    <FriendsAndInvitesContext.Provider value={{ friendsAndInvites, refetch, fetchFriendsAndInvites, isLoading, error }}>
      {children}
    </FriendsAndInvitesContext.Provider>
  );
};

export const useGetFriendsAndInvites = () =>
  useContext(FriendsAndInvitesContext);
