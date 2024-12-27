import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, InputGroup, ListGroup, Modal } from "react-bootstrap";
import { IoLibrary } from "react-icons/io5";
import { API_URL } from "../apiRoute";
import { useAuth } from "../Context/useAuth";
import { toast } from "react-toastify";
import { Location } from "../Models/Map";

interface StudySessionModalProps {
  show: boolean;
  onClose: () => void;
  onStartSession: (initialLoad: boolean) => void;
}

const StudySessionModal: React.FC<StudySessionModalProps> = ({
  show,
  onClose,
  onStartSession,
}) => {
  const [time, setTime] = useState<string>("");
  const [sessionName, setSessionName] = useState<string>("");
  const [showChecklistInput, setShowChecklistInput] = useState<boolean>(false);
  const [task, setTask] = useState<string>("");
  const [checklist, setChecklist] = useState<string[]>([]);
  const [location, setLocation] = useState<Location>();
  const { user } = useAuth();

  const handleStartSession = async () => {
    if (!time) {
      alert("Please fill out all fields.");
      return;
    }
    //get current date
    const currentDate = new Date();
    const [hours, minutes] = time.split(":").map(Number);

    //set hours and minutes
    currentDate.setHours(hours, minutes, 0, 0);

    //convcert to ISO string
    const endTimeISO = currentDate.toISOString();

    await axios
      .post(`${API_URL}/studysessions`, {
        session_name: sessionName,
        end_time: endTimeISO,
        user_id: user?.user_id,
        checklist: checklist,
        lat: location?.lat,
        lon: location?.lon,
      })
      .then((res) => {
        setTime("");
        setChecklist([]);
        setTask("");
        onStartSession(true);
        onClose();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error creating session." + err);
      });
  };

  //get user geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position.coords.latitude, position.coords.longitude);
      setLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      });
    });
  }, []);

  const addCheckListItem = () => {
    // add checklist item to state
    if (task) {
      setChecklist([...checklist, task]);
      setTask("");
    }
  };

  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Start a Study Session <IoLibrary className="ml-3 mb-1" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>What are you studying today?</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your review topic..."
              onChange={(e) => setSessionName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>What time will you be studying until?</Form.Label>
            <Form.Control
              type="time"
              onChange={(e) => setTime(e.target.value)}
            />
          </Form.Group>
        </Form>
        <p>Study Session Checklist</p>
        {showChecklistInput && (
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Enter your task here..."
              aria-label="Enter your task"
              aria-describedby="basic-addon2"
              onChange={(e) => setTask(e.target.value)}
            />
            <Button
              variant="outline-success"
              id="button-addon2"
              onClick={addCheckListItem}
            >
              +
            </Button>
          </InputGroup>
        )}
        <ListGroup>
          {checklist.map((item, index) => (
            <ListGroup.Item key={index}>{item}</ListGroup.Item>
          ))}
        </ListGroup>
        <button
          className="btn btn-dark mt-2 btn-block"
          onClick={() => setShowChecklistInput(true)}
        >
          Add a task to your checklist
        </button>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={handleStartSession}>
          Start
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StudySessionModal;
