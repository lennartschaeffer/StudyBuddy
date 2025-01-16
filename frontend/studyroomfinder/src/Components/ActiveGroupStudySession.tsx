import React, { useEffect, useState } from "react";
import { GroupStudySession, SoloStudySession } from "../Models/StudySession";
import { MdOutlineTimer } from "react-icons/md";
import { format, parseISO } from "date-fns";
import { VscChecklist } from "react-icons/vsc";
import { UserProfile } from "../Models/User";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { IoIosCheckmark } from "react-icons/io";
import { FaCheckCircle } from "react-icons/fa";
import { GiNightSleep } from "react-icons/gi";
import { useMutation, useQueryClient } from "react-query";
import {
  completeActiveSessionEarly,
  completeActiveStudySession,
  completeTask,
} from "../endpoints/StudySessions";
import { toast } from "react-toastify";
import { FaUserGroup } from "react-icons/fa6";
interface ActiveSoloStudySessionProps {
  groupSession: GroupStudySession;
  user: UserProfile;
}
const ActiveGroupStudySession: React.FC<ActiveSoloStudySessionProps> = ({
  groupSession,
  user,
}) => {
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState<string>("");

  const completeSessionMutation = useMutation(
    ({ sessionId, sessionType }: { sessionId: number; sessionType: string }) =>
      completeActiveStudySession(sessionId, sessionType),
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

  useEffect(() => {
    if (groupSession.end_time) {
      const interval = setInterval(() => {
        const now = new Date();
        const endTime = new Date(groupSession.end_time!);
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
  }, [groupSession, user?.user_id]);

  return (
    <div className="row w-100 h-100 d-flex justify-content-center align-items-center">
      <div className="col-12 ">
        <div className="row">
          <div className="col-12">
            <h1 className="text-light text-center">
              {groupSession?.session_name}
            </h1>
          </div>
        </div>
        <div className="row mt-5 d-flex justify-content-center">
          <div className="col-md-3 d-flex flex-column justify-content-center align-items-center">
            <div className="card h-100 w-100 bg-light">
              <div className="card-body d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h3 className="m-0">
                    <strong>Session Timer</strong>
                  </h3>
                  <MdOutlineTimer size={25} />
                </div>
                <h2 className="text-center">
                  <strong>{timeLeft}</strong>
                </h2>
                <div className="d-flex justify-content-center w-100">
                  <button
                    className="btn btn-outline-dark d-flex justify-content-around align-items-center w-100"
                    onClick={() =>
                      completeSessionMutation.mutate({
                        sessionId: groupSession?.group_studysession_id!,
                        sessionType: "group",
                      })
                    }
                  >
                    {" "}
                    <h5 className="m-0">End Session Early</h5>{" "}
                    <GiNightSleep size={20} />
                  </button>
                </div>
                <div className="w-100 d-flex justify-content-between align-items-center">
                  <h4>
                    <strong>Members:</strong>
                  </h4>
                  <FaUserGroup size={25} />
                </div>
                <ListGroup>
                  {groupSession?.members?.map((member, id) => (
                    <ListGroup.Item key={id}>
                      <h6 className="m-0">{member.first_name}</h6>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12 d-flex justify-content-center mt-5"></div>
      </div>
    </div>
  );
};

export default ActiveGroupStudySession;
