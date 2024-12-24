import { useState } from "react";
import { Modal, Button, Form, Toast } from "react-bootstrap";
import { useAuth } from "../Context/useAuth";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { API_URL } from "../apiRoute";

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

  const handleCreateStudyGroup = async () => {
    if (!groupName) {
      toast.error("Please fill out all fields.");
      return;
    }
    await axios
      .post(`${API_URL}/studygroups`, {
        user_id: user?.user_id,
        name: groupName,
      })
      .then((res) => {
        toast.success("Study group created successfully.");
        setGroupName("");
        onClose();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error creating study group.");
      });
  };

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
        <Button variant="primary" onClick={handleCreateStudyGroup}>
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
