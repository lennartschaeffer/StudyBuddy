import React, { useState } from "react";
import { QueryClientProvider, useMutation, useQuery, useQueryClient } from "react-query";
import { createGroupStudySession } from "../../endpoints/StudyGroups";
import { toast } from "react-toastify";

interface SessionSchedulingModalProps {
  show: boolean;
  onClose: () => void;
  name: string;
  groupId: number;
}

const SessionSchedulingModal: React.FC<SessionSchedulingModalProps> = ({
  show,
  onClose,
  name,
  groupId,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sessionName, setSessionName] = useState("");
    const queryClient = useQueryClient();
  const handleScheduleSessionMutation = useMutation(
    () => createGroupStudySession(groupId, sessionName, startDate, endDate),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("upcomingSessions");
        onClose();
      },
      onError: (error) => {
        toast.error("Error creating group study session " + error);
        console.error("Failed to create group study session:", error);
      },
    }
  );
  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Schedule a Study Session for {name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Session Name</Form.Label>
            <Form.Control
              type="text"
              className="mb-2"
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Chemistry Review"
            />
            <Form.Label>Start Time</Form.Label>
            <Form.Control
              className="mb-2"
              type="datetime-local"
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Form.Label>End Time</Form.Label>
            <Form.Control
              type="datetime-local"
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => handleScheduleSessionMutation.mutate()}>
          Submit
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
      <ToastContainer />
    </Modal>
  );
};

export default SessionSchedulingModal;
