import { useEffect, useState } from "react";
import "./HomePage.css";
import NavBar from "../Components/NavBar";
import StudySessionModal from "../Components/StudySessionModal";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { MdOutlineTimer } from "react-icons/md";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../Context/useAuth";
import { IoIosCheckmark } from "react-icons/io";
import { VscChecklist } from "react-icons/vsc";
import { GiNightSleep } from "react-icons/gi";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  completeActiveStudySession,
  completeTask,
  getActiveSession,
} from "../endpoints/StudySessions";
import { format, parseISO } from "date-fns";

const StudySessionPage = () => {
  
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: activeStudySession, refetch } = useQuery(
    ["activeStudySession", user?.user_id],
    () => getActiveSession(user?.user_id!),
    {
      enabled: !!user?.user_id,
      refetchOnMount: true,
      onSuccess: () => {
        toast.success("Active study session fetched.");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch active study session.");
      },
    }
  );

  const completeTaskMutation = useMutation(completeTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["activeStudySession", user?.user_id]);
      toast.success("Task completed. Nice work!");
    },
    onError: (error) => {
      toast.error("Error handling task completion." + error);
    },
  });

  const completeSessionMutation = useMutation(completeActiveStudySession, {
    onSuccess: () => {
      queryClient.invalidateQueries(["activeStudySession", user?.user_id]);
      toast("Session completed. Good work!");
    },
    onError: (error) => {
      toast("Error: Could not end session. " + error);
    },
  });

  useEffect(() => {
    if (activeStudySession) {
      const interval = setInterval(() => {
        const now = new Date();
        const endTime = new Date(activeStudySession.end_time);

        const timeDifference = endTime.getTime() - now.getTime();
        if (timeDifference <= 0) {
          clearInterval(interval);
          setTimeLeft("Session ended");
          completeSessionMutation.mutate(user?.user_id!);
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
  }, [activeStudySession, user?.user_id, completeSessionMutation]);

  return (
    <div className="Main vh-100">
      <NavBar />
      {activeStudySession ? (
        <div className="row h-75 mt-5 w-100">
          <div className="col-12">
            <div className="row">
              <div className="col-12">
                <h1 className="text-light text-center">
                  {activeStudySession?.session_name}
                </h1>
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
                    <h6 className="">
                      Ends at: {format(parseISO(activeStudySession?.end_time), "HH:mm")}
                    </h6>
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
                                  onClick={() =>
                                    completeTaskMutation.mutate(task)
                                  }
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
                <h5 className="m-0">End Session Early</h5>{" "}
                <GiNightSleep size={20} />
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
        onStartSession={() => refetch()}
      />
    </div>
  );
};

export default StudySessionPage;
