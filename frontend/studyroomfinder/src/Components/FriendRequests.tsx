import React, { useEffect, useState } from "react";
import {
  Button,
  ListGroupItem,
  Modal,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";
import { useAuth } from "../Context/useAuth";
import { IoPersonCircleSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Friend } from "../Models/RequestsAndInvites";
import { useGetFriendsAndInvites } from "../Context/useGetFriendsAndInvites";

import {
  removeFriend,
  respondToFriendRequest,
  respondToGroupInvite,
} from "../endpoints/FriendRequests";

interface FriendRequestProps {
  show: boolean;
  handleClose: () => void;
}

const FriendRequests: React.FC<FriendRequestProps> = ({
  show,
  handleClose,
}) => {
  const { user } = useAuth();
  const { friendsAndInvites, fetchFriendsAndInvites, isLoading, error } =
    useGetFriendsAndInvites();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (show) fetchFriendsAndInvites();
  }, [show]);

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
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Body>
        {isLoading ? (
          <Spinner variant="dark" animation="grow" />
        ) : (
          <Tabs
            defaultActiveKey="friends"
            id="uncontrolled-tab-example"
            className="mb-3"
          >
            <Tab eventKey="friends" title="Friends">
              {friendsAndInvites?.friends.length ?? 0 > 0 ? (
                friendsAndInvites?.friends?.map(
                  (friend: Friend, id: number) => (
                    <ListGroupItem key={id}>
                      <div className="row">
                        <div className="col-2 d-flex align-items-center">
                          <IoPersonCircleSharp size={40} />
                        </div>
                        <div className="col-4">
                          <p>
                            <b>
                              {friend?.first_name} {friend?.last_name} (@
                              {friend?.username})
                            </b>
                          </p>
                        </div>
                        <div className="col-6 d-flex align-items-center justify-content-center">
                          <button
                            className="btn btn-outline-danger"
                            onClick={() =>
                              removeFriendMutation.mutate({
                                friend_id: friend.user_id,
                                userId: user?.user_id!,
                              })
                            }
                          >
                            Remove Friend
                          </button>
                        </div>
                      </div>
                    </ListGroupItem>
                  )
                )
              ) : (
                <p>No friends yet.</p>
              )}
            </Tab>
            <Tab eventKey="friendrequests" title="Friend Requests">
              {friendsAndInvites?.friendRequests?.length ?? 0 > 0 ? (
                friendsAndInvites?.friendRequests.map((request, id) => (
                  <ListGroupItem key={id}>
                    <div className="row">
                      <div className="col-2 d-flex align-items-center">
                        <IoPersonCircleSharp size={40} />
                      </div>
                      <div className="col-4">
                        <p>
                          <b>
                            {request?.first_name} {request?.last_name} (@
                            {request?.username})
                          </b>
                        </p>
                      </div>
                      <div className="col-6 d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-success btn-block"
                          onClick={() =>
                            respondToFriendRequestMutation.mutate({
                              request_id: request.request_id,
                              response: "accepted",
                            })
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger btn-block m-0"
                          onClick={() =>
                            respondToFriendRequestMutation.mutate({
                              request_id: request.request_id,
                              response: "rejected",
                            })
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </ListGroupItem>
                ))
              ) : (
                <p>No friend requests.</p>
              )}
            </Tab>
            <Tab eventKey="studygroupinvites" title="Study Group Invites">
              {friendsAndInvites?.groupInvites.length ?? 0 > 0 ? (
                friendsAndInvites?.groupInvites.map((invite, id) => (
                  <ListGroupItem key={id}>
                    <div className="row">
                      <div className="col-2 d-flex align-items-center">
                        <IoPersonCircleSharp size={40} />
                      </div>
                      <div className="col-4">
                        <p>
                          <b>
                            {invite?.group_name} (@
                            {invite?.username}) invite id:{invite.invite_id}
                          </b>
                        </p>
                      </div>
                      <div className="col-6 d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-success btn-block"
                          onClick={() =>
                            respondToGroupInviteMutation.mutate({
                              studygroup_id: invite.studygroup_id,
                              invite_id: invite.invite_id,
                              response: "accepted",
                              userId: user?.user_id!,
                            })
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger btn-block m-0"
                          onClick={() =>
                            respondToGroupInviteMutation.mutate({
                              studygroup_id: invite.studygroup_id,
                              invite_id: invite.invite_id,
                              response: "rejected",
                              userId: user?.user_id!,
                            })
                          }
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </ListGroupItem>
                ))
              ) : (
                <p>No study group invites.</p>
              )}
            </Tab>
          </Tabs>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FriendRequests;
