import React from "react";
import { SoloStudySession } from "../Models/StudySession";
import { MdOutlineTimer } from "react-icons/md";
import { format, parseISO } from "date-fns";
import { VscChecklist } from "react-icons/vsc";
import { UserProfile } from "../Models/User";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { IoIosCheckmark } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { GiNightSleep } from "react-icons/gi";
import { useMutation, useQueryClient } from "react-query";
import { completeActiveSessionEarly, completeActiveStudySession, completeTask } from "../endpoints/StudySessions";
import { toast } from "react-toastify";
interface ActiveSoloStudySessionProps {
  soloSession: SoloStudySession;
  timeLeft: string;
  user: UserProfile;
}
const ActiveSoloStudySession: React.FC<ActiveSoloStudySessionProps> = ({
  soloSession,
  timeLeft,
  user,
}) => {
    const queryClient = useQueryClient();
    
    const completeSessionEarlyMutation = useMutation(
      ({ sessionId, sessionType }: { sessionId: number; sessionType: string }) =>
        completeActiveSessionEarly(sessionId, sessionType),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["activeStudySession", user?.user_id]);
          toast("Session completed. Good work!");
        },
        onError: (error) => {
          toast("Error: Could not end session. " + error);
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
    
  return (
    <div className="row w-100 h-100 d-flex justify-content-center align-items-center">
      <div className="col-12 ">
        <div className="row">
          <div className="col-12">
            <h1 className="text-light text-center">
              {soloSession?.session_name}
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
                  Ends at:{" "}
                  {format(
                    parseISO(soloSession?.end_time!),
                    "HH:mm"
                  )}
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
                {soloSession.tasks.length > 0 ? (
                  <div className="mt-3">
                    <ListGroup>
                      {soloSession.tasks.map((task, index) => (
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
                              onClick={() => completeTaskMutation.mutate(task)}
                            >
                              <FaCheckCircle size={20} />
                            </button>
                          )}
                        </ListGroupItem>
                      ))}
                    </ListGroup>
                  </div>
                ) : (
                  <h6 className="text-success">No more tasks to complete!</h6>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 d-flex justify-content-center mt-5">
          <button
            className="btn btn-outline-info d-flex justify-content-around align-items-center w-25 p-3"
            onClick={() =>
              completeSessionEarlyMutation.mutate({
                sessionId: soloSession?.session_id!,
                sessionType: "solo",
              })
            }
          >
            {" "}
            <h5 className="m-0">End Session Early</h5>{" "}
            <GiNightSleep size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveSoloStudySession;
