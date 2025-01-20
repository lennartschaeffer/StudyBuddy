import React, { useEffect, useState } from "react";
import { GroupStudySession, SoloStudySession } from "../Models/StudySession";
import { MdOutlineTimer } from "react-icons/md";
import { format, parseISO } from "date-fns";
import { VscChecklist } from "react-icons/vsc";
import { UserProfile } from "../Models/User";
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
import { CheckCircle2, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
interface ActiveSoloStudySessionProps {
  groupSession: GroupStudySession;
  user: UserProfile;
  onLeave: () => void;
}
const ActiveGroupStudySession: React.FC<ActiveSoloStudySessionProps> = ({
  groupSession,
  user,
  onLeave,
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
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Active Study Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-center mb-4">{timeLeft}</div>
          <Button
            onClick={() =>
              completeSessionMutation.mutate({
                sessionId: groupSession?.session_id!,
                sessionType: "group",
              })
            }
            className="w-full"
          >
            End Session
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Member List</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {groupSession?.members?.map((member,id) => (
              <li
                key={id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <label
                    htmlFor={`member-${id}`}
                  >
                    {member.first_name}
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Button variant="destructive" className="w-full mt-3" onClick={onLeave}>Leave</Button>
    </div>
  );
};

export default ActiveGroupStudySession;
