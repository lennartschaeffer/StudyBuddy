import React, { useState } from "react";
import { Modal, Button, ToastContainer, Form } from "react-bootstrap";
import {
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { createGroupStudySession } from "../../endpoints/StudyGroups";
import { toast } from "react-toastify";
import { useGetStudyGroups } from "../../Context/useGetStudyGroups";

interface CreateGroupStudySessionModalProps {
  show: boolean;
  onClose: () => void;
}

const CreateGroupStudySessionModal: React.FC<
  CreateGroupStudySessionModalProps
> = ({ show, onClose }) => {
  const [endTime, setEndTime] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [studyGroup, setStudyGroup] = useState<number>();
  const queryClient = useQueryClient();
  const { studyGroups } = useGetStudyGroups();


  const handleStartGroupStudySessionMutation = useMutation(
    () =>
      createGroupStudySession(
        studyGroup!,
        sessionName ?? "Study Session",
        "",
        endTime,
      ),
    {
      onSuccess: () => {
        toast.success("Created Group Study Session");
        queryClient.invalidateQueries("activeStudySession");
        onClose();
      },
      onError: (error) => {
        toast.error("Error creating group study session " + error);
      },
    }
  );
  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Start a Group Study Session
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
          <Form.Label>Study Group</Form.Label>
          <Form.Select aria-label="Default select example" onChange={(e) => setStudyGroup(Number(e.target.value))}>
            <option>Choose Your Study Group</option>
            {studyGroups?.map((group, index) => (
              <option key={index} value={group.studygroup_id}>{group.group_name}</option>
            ))}
          </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Session Name</Form.Label>
            <Form.Control
              type="text"
              className="mb-2"
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Chemistry Review"
            />

            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="datetime-local"
              onChange={(e) => setEndTime(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => handleStartGroupStudySessionMutation.mutate()}>Submit</Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
      <ToastContainer />
    </Modal>
  );
};

export default CreateGroupStudySessionModal;
