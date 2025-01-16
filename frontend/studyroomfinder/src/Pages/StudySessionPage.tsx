import { useEffect, useState } from "react";
import "./HomePage.css";
import NavBar from "../Components/NavBar";
import StudySessionModal from "../Components/StudySessionModal";
import { ListGroup, ListGroupItem, Spinner } from "react-bootstrap";
import { FaCheckCircle, FaCircle, FaClock } from "react-icons/fa";
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
import ActiveGroupStudySession from "../Components/ActiveGroupStudySession";

const StudySessionPage = () => {
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showGroupSessionModal, setShowGroupSessionModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [joinStudyGroupInfo, setJoinStudyGroupInfo] =
    useState<GroupStudySession>();
  const [joinedActiveGroupSession, setJoinedActiveGroupSession] =
    useState<boolean>(false);

  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: activeStudySession,
    refetch,
    isLoading,
  } = useQuery(
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
      ) : isLoading ? (
        <div className="container h-100 d-flex flex-column justify-content-center align-items-center">
          <Spinner variant="light" animation="grow" />
        </div>
        
      ) : joinedActiveGroupSession ? (
        <ActiveGroupStudySession
          groupSession={joinStudyGroupInfo!}
          user={user!}
        />
      ) : (
        <div className="container h-100 d-flex flex-column justify-content-center align-items-center">
          <div className="row w-100 ">
            <div
              className={`${
                activeStudySession?.groupSessions &&
                activeStudySession.groupSessions.length > 0
                  ? "col-5 flex-column"
                  : "col-12 d-flex"
              } d-flex  gap-3 justify-content-center`}
            >
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
            {activeStudySession?.groupSessions &&
              activeStudySession.groupSessions.length > 0 && (
                <div className="col-5">
                  <div className="card">
                    <div className="card-body">
                      <h3>
                        <strong>Active Group Study Sessions</strong>
                      </h3>
                      <p className="text-muted">
                        View your active group sessions
                      </p>
                      <ListGroup>
                        {activeStudySession.groupSessions.map(
                          (groupSession: GroupStudySession, id: number) => (
                            <ListGroupItem key={id}>
                              <div className="row">
                                <div className="col-7 d-flex flex-column align-items-start">
                                  <h5 className="m-0">
                                    <b>{groupSession.group_name}</b>
                                  </h5>
                                  <p className="text-muted">
                                    {groupSession.session_name}
                                  </p>
                                </div>
                                <div className="col-5 d-flex flex-column">
                                  <div className="d-flex justify-content-center gap-2">
                                    <p className="text-muted text-center m-0">
                                      {format(
                                        parseISO(groupSession.start_time),
                                        "HH:mm"
                                      )}
                                      -
                                      {format(
                                        parseISO(groupSession.end_time),
                                        "HH:mm"
                                      )}
                                    </p>
                                    <FaClock className="mt-1" />
                                  </div>
                                  <button
                                    className="btn btn-sm btn-success mt-2"
                                    onClick={() => {
                                      setJoinStudyGroupInfo(groupSession);
                                      setJoinedActiveGroupSession(true);
                                    }}
                                  >
                                    <strong>Join</strong>
                                  </button>
                                </div>
                              </div>
                            </ListGroupItem>
                          )
                        )}
                      </ListGroup>
                    </div>
                  </div>
                </div>
              )}
          </div>
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
