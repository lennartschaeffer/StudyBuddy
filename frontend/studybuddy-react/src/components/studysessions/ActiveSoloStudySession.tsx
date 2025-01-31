import React from "react";
import { SoloStudySession } from "../../Models/StudySession";
import { UserProfile } from "../../Models/User";
import { useMutation, useQueryClient } from "react-query";
import { completeActiveStudySession, completeTask } from "../../endpoints/StudySessions";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Check, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  const {toast} = useToast()
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
        toast({
          title: "Error.",
          description: "Could not end session."+ error,
        })
      },
    }
  );

  const completeTaskMutation = useMutation(completeTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["activeStudySession", user?.user_id]);
      toast({
        title: "Task completed.",
        description: "Good work!",
      })
    },
    onError: (error) => {
      toast({
        title: "Error.",
        description: "Could not complete task."+ error,
      })
    },
  });

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
                sessionId: soloSession?.session_id!,
                sessionType: "solo",
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
          <CardTitle className="text-xl font-bold">Task List</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {soloSession.tasks.map((task) => (
              <li
                key={task.task_id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <label
                    htmlFor={`task-${task.task_id}`}
                    className={`${
                      task.task_completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.task_name}
                  </label>
                </div>
                <div>
                  {!task.task_completed ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => completeTaskMutation.mutate(task)}
                      className="mr-2"
                    >
                      <CheckCircle2/>
                    </Button>
                  ) : (
                    <Check />
                  )}
                </div>
              </li>
            ))}
          </ul>
          {soloSession.tasks.length === 0 && (
            <div className="text-center text-gray-500 mt-4">
              No tasks to complete!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ActiveSoloStudySession;
