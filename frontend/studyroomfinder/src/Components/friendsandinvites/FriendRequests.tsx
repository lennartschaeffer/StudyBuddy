import React, { useEffect, useState } from "react";
import { useAuth } from "../../Context/useAuth";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useGetFriendsAndInvites } from "../../Context/useGetFriendsAndInvites";
import {
  removeFriend,
  respondToFriendRequest,
  respondToGroupInvite,
} from "../../endpoints/FriendRequests";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@radix-ui/react-dialog";
import { DialogHeader, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

interface FriendRequestProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const FriendRequests: React.FC<FriendRequestProps> = ({ show, setShow }) => {
  const { user } = useAuth();
  const { friendsAndInvites, fetchFriendsAndInvites, isLoading, error } =
    useGetFriendsAndInvites();
  const queryClient = useQueryClient();

  const respondToFriendRequestMutation = useMutation(
    ({ request_id, response }: { request_id: number; response: string }) =>
      respondToFriendRequest(request_id, response),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["requestsAndInvites", user?.user_id]);
      },
      onError: (error) => {
        toast.error("Error responding to friend request " + error);
      },
    }
  );

  const respondToGroupInviteMutation = useMutation(
    ({
      studygroup_id,
      invite_id,
      response,
      userId,
    }: {
      studygroup_id: number;
      invite_id: number;
      response: string;
      userId: number;
    }) => respondToGroupInvite(studygroup_id, invite_id, response, userId),
    {
      onSuccess: () => {
        toast.success("Responded to group invite.");
        queryClient.invalidateQueries(["requestsAndInvites", user?.user_id]);
      },
      onError: (error) => {
        toast.error("Error responding to group invite " + error);
      },
    }
  );

  const removeFriendMutation = useMutation(
    ({ friend_id, userId }: { friend_id: number; userId: number }) =>
      removeFriend(friend_id, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["requestsAndInvites", user?.user_id]);
      },
      onError: (error) => {
        toast.error("Error removing friend " + error);
      },
    }
  );

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Friend Requests & Group Invites</DialogTitle>
          <DialogDescription>
            Respond to friend requests and group invites.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className=""></div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
  );
};

export default FriendRequests;
