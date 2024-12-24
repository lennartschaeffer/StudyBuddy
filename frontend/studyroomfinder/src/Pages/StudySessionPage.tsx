import React, { useEffect, useState } from "react";
import "./HomePage.css";
import NavBar from "../Components/NavBar";
import StudySessionModal from "../Components/StudySessionModal";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { API_URL } from "../apiRoute";
import { useAuth } from "../Context/useAuth";
import { IoIosCheckmark } from "react-icons/io";
import { StudySession, Task } from "../Models/StudySession";
import { VscChecklist } from "react-icons/vsc";
import { GiNightSleep } from "react-icons/gi";

const StudySessionPage = () => {
  const [activeStudySession, setActiveStudySession] =
    useState<StudySession | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const { user } = useAuth();

  const getActiveSession = async (initialLoad: boolean) => {
    await axios
      .get(`${API_URL}/studysessions/activeStudySession/${user?.user_id}`)
      .then((res) => {
        console.log(res);
        if (res.data.tasks) {
          const tasks: Task[] = res.data.tasks.map((task: Task) => {
            return {
              task_id: task.task_id,
              task_name: task.task_name,
              task_completed: task.task_completed,
            };
          });
          const session: StudySession = {
            session_id: res.data.session_id,
            session_name: res.data.session_name,
            session_date: res.data.session_date,
            endtime: res.data.endtime,
            user_id: res.data.user_id,
            session_completed: res.data.session_completed,
            checklist_id: res.data.checklist_id,
            tasks: tasks,
          };
          setActiveStudySession(session);
          setSessionStarted(true);
          if(initialLoad){
            toast.success("Study session started. You got this!");
          }
        }
      });
  };

  useEffect(() => {
    getActiveSession(false);
  }, []);

  useEffect(() => {
    if (sessionStarted) {
      const interval = setInterval(() => {
        const now = new Date();
        const endTime = new Date();
        const sessionEndTime = activeStudySession?.endtime!;
        const [hours, minutes] = sessionEndTime.split(":").map(Number);
        endTime.setHours(hours, minutes, 0, 0);

        const timeDifference = endTime.getTime() - now.getTime();
        if (timeDifference <= 0) {
          clearInterval(interval);
          setSessionStarted(false);
          setTimeLeft("Session ended");
          handleCompleteSession()
        } else {
          const hoursLeft = Math.floor(timeDifference / (1000 * 60 * 60));
          const minutesLeft = Math.floor(
            (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const secondsLeft = Math.floor((timeDifference % (1000 * 60)) / 1000);
          setTimeLeft(`${hoursLeft}h ${minutesLeft}m ${secondsLeft}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sessionStarted, activeStudySession?.endtime]);

  const handleCompleteSession = async() => {
     await axios.put(`${API_URL}/studysessions/completeActiveStudySession/${user?.user_id}`).then((res) => {
      toast('Session completed. Good work!')
     }).catch((err) => {
      console.log(err)
      toast('Error: Could not end session. '+err)
     })
  }

  const handleCompleteTask = async (task: Task) => {
    await axios
      .put(`${API_URL}/studysessions/completeTask/${task?.task_id}`)
      .then((res) => {
        getActiveSession(false);
        toast.success(`${task?.task_name} completed. Nice work!`);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error handling task completion." + err);
      });
  };

  return (
    <div className="Main vh-100">
      <NavBar />
      {sessionStarted ? (
        <div className="row h-75 mt-5 w-100">
          <div className="col-12">
            <div className="row">
              <div className="col-12">
                <h1 className="text-light text-center">{activeStudySession?.session_name}</h1>
              </div>
            </div>
            <div className="row mt-5 d-flex justify-content-center">
              <div className="col-md-3 d-flex flex-column justify-content-center align-items-center">
                <div className="card h-100 w-100 bg-light">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="m-0">Session Timer</h4>
                    <MdOutlineTimer size={25} />
                  </div>
                  <div className="card-body">
                    <h3 className="">{timeLeft}</h3>
                    <h6 className="">Ends at: {activeStudySession?.endtime}</h6>
                  </div>
                </div>
              </div>
              <div className="col-md-3 d-flex flex-column justify-content-center align-items-center">
                <div
                  className="card h-100 w-100 bg-light"
                  style={{ background: "black" }}
                >
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="m-0">{user?.first_name}'s Checklist</h4>
                    <VscChecklist size={25} />
                  </div>
                  <div className="card-body">
                    {activeStudySession?.tasks &&
                    activeStudySession.tasks.length > 0 ? (
                      <div className="mt-3">
                        <ListGroup>
                          {activeStudySession.tasks.map((task, index) => (
                            <ListGroupItem
                              key={index}
                              className="d-flex justify-content-between align-items-center bg-dark"
                            >
                              <h6 className="w-50 m-0 text-light">
                                {task?.task_name}
                              </h6>
                              {task.task_completed ? (
                                <IoIosCheckmark
                                  className="text-success"
                                  size={35}
                                />
                              ) : (
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => handleCompleteTask(task)}
                                >
                                  <FaCheckCircle size={20} />
                                </button>
                              )}
                            </ListGroupItem>
                          ))}
                        </ListGroup>
                      </div>
                    ) : (
                      <h6 className="text-success">
                        No more tasks to complete!
                      </h6>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 d-flex justify-content-center mt-5">
              <button className="btn btn-outline-info d-flex justify-content-around align-items-center w-25 p-3">
                {" "}
                <h5 className="m-0">End Session Early</h5> <GiNightSleep size={20} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container h-75 mt-5 d-flex flex-column justify-content-center align-items-center">
          <button
            className="btn btn-light btn-lg"
            onClick={() => setShowSessionModal(true)}
          >
            <b>Start a Session</b>
          </button>
        </div>
      )}
      <ToastContainer />
      <StudySessionModal
        show={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onStartSession={getActiveSession}
      />
    </div>
  );
};

export default StudySessionPage;
