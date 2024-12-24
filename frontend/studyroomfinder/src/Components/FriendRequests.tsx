import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, ListGroupItem, Modal, Tab, Tabs } from "react-bootstrap";
import { API_URL } from "../apiRoute";
import { useAuth } from "../Context/useAuth";
import { IoPersonCircleSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import { Buddy } from "../Models/StudyBuddy";
import { set } from "date-fns";

interface FriendRequestProps {
  show: boolean;
  handleClose: () => void;
}

type FriendRequest = {
  friendrequest_id: number;
  username: string;
  first_name: string;
  last_name: string;
};

type GroupInvite = {
  name: string;
  studygroup_id: number;
  studygroup_invite_id: number;
  username: string;
  first_name: string;
  last_name: string;
};

const FriendRequests: React.FC<FriendRequestProps> = ({
  show,
  handleClose,
}) => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<
    FriendRequest[] | undefined
  >();
  const [groupInvites, setGroupInvites] = useState<GroupInvite[] | undefined>();
  const [friends, setFriends] = useState<Buddy[] | undefined>();
  const [requestsLoaded, setRequestsLoaded] = useState<boolean>(false);
  const [friendsLoaded, setFriendsLoaded] = useState<boolean>(false);

  const getPendingRequests = async () => {
    await axios
      .get(`${API_URL}/friendrequests/pending/${user?.user_id}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.friendRequests.length > 0) {
          const requests = res.data.map((request: FriendRequest) => {
            return {
              first_name: request.first_name,
              last_name: request.last_name,
              username: request.username,
              friendrequest_id: request.friendrequest_id,
            };
          });
          setPendingRequests(requests);
        }
        if (res.data.groupInvites.length > 0) {
          const invites = res.data.groupInvites.map((invite: GroupInvite) => {
            return {
              name: invite.name,
              studygroup_id: invite.studygroup_id,
              first_name: invite.first_name,
              last_name: invite.last_name,
              username: invite.username,
            };
          });
          setGroupInvites(invites);
        }
        setRequestsLoaded(true);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching friend requests " + err);
      });
  };

  const getFriends = async () => {
    await axios
      .get(`${API_URL}/friends/${user?.user_id}`)
      .then((res) => {
        if (res.data.length > 0) {
          const studyBuddies = res.data.map((buddy: Buddy) => {
            return {
              username: buddy.username,
              first_name: buddy.first_name,
              last_name: buddy.last_name,
              user_id: buddy.user_id,
            };
          });
          setFriends(studyBuddies);
        }
        setFriendsLoaded(true);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching friends " + err);
      });
  };

  const respondToFriendRequest = async (
    request_id: number,
    response: string
  ) => {
    axios
      .post(`${API_URL}/friendrequests/respond`, {
        request_id: request_id,
        response: response,
      })
      .then((res) => {
        console.log(res.data);
        getPendingRequests();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error responding to request " + err);
      });
  };

  const respondToGroupInvite = async (
    studygroup_id: number,
    invite_id: number,
    response: string
  ) => {
    axios
      .post(`${API_URL}/studygroups/respond`, {
        studygroup_id: studygroup_id,
        studygroup_invite_id: invite_id,
        response: response,
        user_id: user?.user_id,
      })
      .then((res) => {
        console.log(res.data);
        getPendingRequests();
        toast.success("Invite responded!");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error responding to invite " + err);
      });
  };

  const removeFriend = async (friend_id: number) => {
    console.log(user?.user_id, friend_id);
    if (user?.user_id && friend_id) {
      await axios
        .delete(`${API_URL}/friends/removeFriend/${user?.user_id}/${friend_id}`)
        .then((res) => {
          console.log(res.data);
          toast.success("Friend removed!");
          getFriends();
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error removing friend " + err);
        });
    }
  };

  useEffect(() => {
    if (show && !requestsLoaded) {
      getPendingRequests();
    }
    if (show && !friendsLoaded) {
      getFriends();
    }
  }, [show, requestsLoaded, friendsLoaded]);

  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Body>
        <Tabs
          defaultActiveKey="friends"
          id="uncontrolled-tab-example"
          className="mb-3"
        >
          <Tab eventKey="friends" title="Friends">
            {friends ? (
              friends.map((friend, id) => (
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
                        onClick={() => removeFriend(friend.user_id)}
                      >
                        Remove Friend
                      </button>
                    </div>
                  </div>
                </ListGroupItem>
              ))
            ) : (
              <p>No friends yet.</p>
            )}
          </Tab>
          <Tab eventKey="friendrequests" title="Friend Requests">
            {pendingRequests ? (
              pendingRequests.map((request, id) => (
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
                          respondToFriendRequest(
                            request.friendrequest_id,
                            "accepted"
                          )
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger btn-block m-0"
                        onClick={() =>
                          respondToFriendRequest(
                            request.friendrequest_id,
                            "rejected"
                          )
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
            {groupInvites ? (
              groupInvites.map((invite, id) => (
                <ListGroupItem key={id}>
                  <div className="row">
                    <div className="col-2 d-flex align-items-center">
                      <IoPersonCircleSharp size={40} />
                    </div>
                    <div className="col-4">
                      <p>
                        <b>
                          {invite?.name} (@
                          {invite?.username})
                        </b>
                      </p>
                    </div>
                    <div className="col-6 d-flex align-items-center">
                      <button
                        className="btn btn-sm btn-outline-success btn-block"
                        onClick={() =>
                          respondToGroupInvite(invite.studygroup_id, invite.studygroup_invite_id, "accepted", )
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger btn-block m-0"
                        onClick={() =>
                          respondToGroupInvite(invite.studygroup_id, invite.studygroup_invite_id, "rejected", )
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
