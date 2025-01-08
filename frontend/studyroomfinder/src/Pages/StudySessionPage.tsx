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
  completeActiveSessionEarly,
  completeActiveStudySession,
  completeTask,
  getActiveSession,
} from "../endpoints/StudySessions";
import { format, parseISO } from "date-fns";
import { BiGroup, BiUser } from "react-icons/bi";
import CreateGroupStudySessionModal from "../Components/CreateGroupStudySessionModal";
import { GroupStudySession, SoloStudySession } from "../Models/StudySession";
import ActiveSoloStudySession from "../Components/ActiveSoloStudySession";

const StudySessionPage = () => {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGroupSessionModal, setShowGroupSessionModal] = useState(false);
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
        console.log("Fetched active study session.");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Failed to fetch active study session.");
      },
    }
  );

  console.log(activeStudySession);

  useEffect(() => {
    if (activeStudySession?.soloSession) {
      const interval = setInterval(() => {
        const now = new Date();
        const endTime = new Date(activeStudySession?.soloSession?.end_time!);
        const timeDifference = endTime.getTime() - now.getTime();
        if (timeDifference <= 0) {
          clearInterval(interval);
          setTimeLeft("Session ended");
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
  }, [activeStudySession, user?.user_id]);

  return (
    <div className="Main h-100">
      {activeStudySession?.soloSession ? (
        <ActiveSoloStudySession
          soloSession={activeStudySession.soloSession}
          timeLeft={timeLeft}
          user={user!}
        />
      ) : (
        <div className="container h-100 d-flex flex-column justify-content-center align-items-center">
          <div className="row w-100 d-flex justify-content-center">
            <div className="col-5">
              <div className="card h-100">
                <div className="card-body">
                  <h3>
                    <strong>Solo Study Session</strong>
                  </h3>
                  <p className="text-muted">
                    Focus on your individual study goals
                  </p>
                  <button
                    className="btn btn-dark d-block w-100"
                    onClick={() => setShowSessionModal(true)}
                  >
                    <BiUser className="mr-1" />
                    Start Solo Session
                  </button>
                </div>
              </div>
            </div>
            <div className="col-5">
              <div className="card h-100">
                <div className="card-body">
                  <h3>
                    <strong>Group Study Session</strong>
                  </h3>
                  <p className="text-muted">
                    Collaborate with your study buddies
                  </p>
                  <button
                    className="btn btn-dark d-block w-100"
                    onClick={() => setShowGroupSessionModal(true)}
                  >
                    <BiGroup className="mr-1" />
                    Start Group Session
                  </button>
                </div>
              </div>
            </div>
          </div>
          {
            activeStudySession?.groupSessions && activeStudySession.groupSessions.length > 0 && (
              <div className="row w-100 d-flex justify-content-center mt-3">
                <div className="col-5">
                  <div className="card h-100">
                    <div className="card-body">
                      <h3>
                        <strong>Active Group Study Sessions</strong>
                      </h3>
                      <p className="text-muted">
                        View your active group sessions
                      </p>
                      <ListGroup >
                      
                        
                      </ListGroup>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      )}
      <ToastContainer />
      <StudySessionModal
        show={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        onStartSession={() => refetch()}
      />
      <CreateGroupStudySessionModal
        show={showGroupSessionModal}
        onClose={() => setShowGroupSessionModal(false)}
      />
    </div>
  );
};

export default StudySessionPage;
