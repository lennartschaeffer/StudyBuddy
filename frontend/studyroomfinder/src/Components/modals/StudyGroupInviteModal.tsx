import React, { useEffect, useState } from "react";
import { Button, Form, ListGroupItem, Modal } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../Context/useAuth";
import { IoPersonCircleSharp } from "react-icons/io5";
import { useGetFriendsAndInvites } from "../../Context/useGetFriendsAndInvites";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { inviteToStudyGroup } from "../../endpoints/StudyGroups";

interface StudyGroupInviteModalProps {
  name: string;
  studygroup_id: number;
  show: boolean;
  onClose: () => void;
}

const StudyGroupInviteModal: React.FC<StudyGroupInviteModalProps> = ({
  show,
  onClose,
  name,
  studygroup_id,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { friendsAndInvites } = useGetFriendsAndInvites();

  const inviteToStudyGroupMutation = useMutation(
      ({
        sender_id,
        receiver_id,
        studygroup_id
      }: {
        sender_id: number;
        receiver_id: number;
        studygroup_id: number;
      }) => inviteToStudyGroup(sender_id, receiver_id, studygroup_id),
      {
        onSuccess: () => {
          toast.success("Sent group invite.");
          queryClient.invalidateQueries("studyGroups");
        },
        onError: (error) => {
          toast.error("Error responding to group invite " + error);
        },
      }
    );

  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Invite a Buddy to {name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {friendsAndInvites?.friends.length ?? 0 > 0 ? (
          friendsAndInvites?.friends.map((friend, id) => (
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
                      inviteToStudyGroupMutation.mutate({
                        sender_id: user?.user_id!,
                        receiver_id: friend.user_id,
                        studygroup_id: studygroup_id,
                      })
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
