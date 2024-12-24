import axios from "axios";
import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import FormSelect from "react-bootstrap/FormSelect";
import { API_URL } from "../apiRoute";
import { Icon } from "leaflet";

interface AddLocationModalProps {
  show: boolean;
  onClose: () => void;
  location?: Location;
}
type Location = {
  lat: number;
  lon: number;
};

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  show,
  onClose,
  location,
}) => {
  const [locationName, setLocationName] = useState<string>("");
  const [roomName, setRoomName] = useState<string>();
  const [busyLevel, setBusyLevel] = useState<string>();
  const [comments, setComments] = useState<string>();

  useEffect(() => {
    if (location) {
      console.log(location.lat, location.lon);
      const API_URL = `https://nominatim.openstreetmap.org/reverse?lat=${location?.lat}&lon=${location?.lon}&format=json`;
      axios
        .get(API_URL)
        .then((res) => {
          console.log(res.data);
          setLocationName(res.data.name);
          setRoomName("");
          setBusyLevel("");
          setComments("");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [location]);

  const handleAddLocation = () => {
    if (!locationName || !busyLevel) {
      alert("Please fill out all fields.");
      return;
    }
    if (!location) {
      alert("Error processing location: please try again.");
      return;
    }

    console.log(locationName, location?.lat, location?.lon, busyLevel);

    axios
      .post(`${API_URL}/locations`, {
        building_name: locationName,
        room_name: roomName,
        latitude: location?.lat,
        longitude: location?.lon,
        busyness_level: busyLevel,
        additional_info: comments,
      })
      .then((res) => {
        alert("Location added successfully!");
        onClose();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleBusyLevel = (value: number) => {
    if (value < 40) {
      setBusyLevel("Low");
    } else if (value < 60) {
      setBusyLevel("Medium");
    } else if (value < 80) {
      setBusyLevel("High");
    } else {
      setBusyLevel("Very High");
    }
  };

  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Add Study Location at {locationName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Room Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Room Name..."
              onChange={(e) => setRoomName(e.target.value)}
            />
          </Form.Group>
          <Form.Label>How Busy is it?</Form.Label>
          <br />
          <Form.Range
            onChange={(e) => handleBusyLevel(Number(e.target.value))}
          />
          <Form.Label>{busyLevel}</Form.Label>
          <br />
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>Additional Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              onChange={(e) => setComments(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleAddLocation}>
          Submit
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddLocationModal;
