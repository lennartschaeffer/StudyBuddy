import React, { useEffect, useState } from "react";
import { GroupStudySession } from "../../Models/StudySession";
import { UserProfile } from "../../Models/User";
import { useMutation, useQueryClient } from "react-query";
import { completeActiveStudySession } from "../../controllers/StudySessionsController";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Toaster } from "../ui/toaster";
import { useToast } from "@/hooks/use-toast";
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
  const {toast} = useToast();

  const completeSessionMutation = useMutation(
    ({ sessionId, sessionType }: { sessionId: number; sessionType: string }) =>
      completeActiveStudySession(sessionId, sessionType),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["activeStudySession", user?.user_id]);
        toast({
          title: "Session completed.",
          description: "Good work!",
        })
      },
      onError: (error) => {
        console.error(error);
        toast({
          title: "Error.",
          description: "Could not end session.",
        })
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
      <Toaster />
    </div>
  );
};

export default ActiveGroupStudySession;
