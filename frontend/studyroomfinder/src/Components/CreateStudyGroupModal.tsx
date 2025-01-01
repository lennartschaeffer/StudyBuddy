import { useState } from "react";
import { Modal, Button, Form, Toast } from "react-bootstrap";
import { useAuth } from "../Context/useAuth";
import { toast, ToastContainer } from "react-toastify";
import { useMutation, useQueryClient } from "react-query";
import { createStudyGroup } from "../endpoints/StudyGroups";

interface CreateStudyGroupModalProps {
  show: boolean;
  onClose: () => void;
}

const CreateStudyGroupModal: React.FC<CreateStudyGroupModalProps> = ({
  show,
  onClose,
}) => {
  const [groupName, setGroupName] = useState<string>("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createStudyGroupMutation = useMutation(
    () =>
   createStudyGroup(groupName ?? 'Study Group', user?.user_id!),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("studyGroups");
        toast.success("Created Study Group");
        onClose();
      },
      onError: (error) => {
        toast.error("Error creating study group " + error);
      },
    }
  );

  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Create a Study Group
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Group Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Group Name..."
              onChange={(e) => setGroupName(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => createStudyGroupMutation.mutate()}>
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

export default CreateStudyGroupModal;
