import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Form, ListGroupItem, Modal } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { API_URL } from "../apiRoute";
import { Buddy } from "../Models/StudyBuddy";
import { useAuth } from "../Context/useAuth";
import { IoPersonCircleSharp } from "react-icons/io5";

interface StudyGroupInviteModalProps {
  name: string;
  id: number;
  show: boolean;
  onClose: () => void;
}

const StudyGroupInviteModal: React.FC<StudyGroupInviteModalProps> = ({
  show,
  onClose,
  name,
  id,
}) => {
  const [friends, setFriends] = useState<Buddy[]>();
  const [friendsLoaded, setFriendsLoaded] = useState<boolean>(false);
  const { user } = useAuth();

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

  const handleInviteToStudyGroup = async (
    receiver_id: number,
  ) => {
    if (!receiver_id || !id) {
      console.log(receiver_id, id);
      toast.error("Could not send invite.");
      return;
    }
    await axios
      .post(`${API_URL}/studygroups/invite`, {
        sender_id: user?.user_id,
        receiver_id: receiver_id,
        studygroup_id: id,
      })
      .then((res) => {
        toast.success("Invite sent successfully.");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error sending invite.");
      });
  };

  useEffect(() => {
    if (show && !friendsLoaded) {
      getFriends();
    }
  }, [friendsLoaded, show]);

  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Invite a Buddy to {name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
                    className="btn btn-outline-success"
                    onClick={() =>
                      handleInviteToStudyGroup(friend?.user_id)
                    }
                  >
                    Invite Friend
                  </button>
                </div>
              </div>
            </ListGroupItem>
          ))
        ) : (
          <p>No friends yet.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
      <ToastContainer />
    </Modal>
  );
};

export default StudyGroupInviteModal;