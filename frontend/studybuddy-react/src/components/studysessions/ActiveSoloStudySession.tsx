import React, { useState } from "react";
import { SoloStudySession } from "../../Models/StudySession";
import { UserProfile } from "../../Models/User";
import { useMutation, useQueryClient } from "react-query";
import {
  completeActiveStudySession,
  completeTask,
  removeTask,
} from "../../controllers/StudySessionsController";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  List,
  Sparkles,
  Trash,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
//import { Progress } from "@/components/ui/progress";
import AddTaskModal from "./AddTaskModal";
import { getActionPlan } from "@/controllers/GeminiController";
import { LoadingSymbol } from "../ui/LoadingSymbol";
import { AITask, AITaskList } from "@/Models/AITasks";
import AITaskModal from "./AITaskModal";
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
  const { toast } = useToast();
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAITaskModal, setShowAITaskModal] = useState(false);
  const [aiTasks, setAiTasks] = useState<AITaskList | undefined>();
  const [currentAITask, setCurrentAITask] = useState<AITask>();
  //const [xp, setXp] = useState(0);
  //const progressToNextLevel = (xp % 100) / 100;
  //const [level, setLevel] = useState(1);

  const completeSessionMutation = useMutation(
    ({ sessionId, sessionType }: { sessionId: number; sessionType: string }) =>
      completeActiveStudySession(sessionId, sessionType),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["activeStudySession", user?.user_id]);
        toast({
          title: "Session completed.",
          description: "Good work!",
        });
      },
      onError: (error) => {
        toast({
          title: "Error.",
          description: "Could not end session." + error,
        });
      },
    }
  );

  const completeTaskMutation = useMutation(completeTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["activeStudySession", user?.user_id]);
      toast({
        title: "Task completed.",
        description: "Good work!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error.",
        description: "Could not complete task." + error,
      });
    },
  });

  const deleteTaskMutation = useMutation(removeTask, {
    onSuccess: () => {
      queryClient.invalidateQueries(["activeStudySession", user?.user_id]);
      toast({
        title: "Task deleted.",
        description: "Task has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error.",
        description: "Could not delete task." + error,
      });
    },
  });

  const taskAIGenerationMutation = useMutation(getActionPlan, {
    onSuccess: (data) => {
      queryClient.invalidateQueries(["activeStudySession", user?.user_id]);
      toast({
        title: "Task AI generated.",
        description: "Task has been generated.",
      });
      console.log("Generated tasks:", data);
      setAiTasks(data);
    },
    onError: (error) => {
      toast({
        title: "Error.",
        description: "Could not generate task." + error,
      });
    },
  });

  //xp handling
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setXp((prev) => {
  //       const newXp = prev + 1;
  //       //every 100 xp is a new level
  //       if (newXp % 100 === 0) {
  //         setLevel((prev) => prev + 1);
  //       }
  //       return newXp;
  //     });
  //   }, 10000); //ever minute

  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div
      className={`container p-4 w-100 ${
        (aiTasks || taskAIGenerationMutation.isLoading) ? "d-flex flex-col md:flex-row gap-10" : "mx-auto max-w-2xl"
      }`}
    >
      <div>
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold ">
              {soloSession?.session_name} - Active
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!soloSession.tasks) {
                  toast({
                    title: "Error",
                    description: "No tasks to generate AI plan",
                  });
                  return;
                }
                taskAIGenerationMutation.mutate(soloSession!);
              }}
              className="mr-2"
            >
              Plan With AI
              <Sparkles />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-center mb-4">
              {timeLeft}
            </div>
            {/* <Progress value={progressToNextLevel * 100} className="w-full" />
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-lg">Level 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{xp} XP</span>
              <span className="text-muted-foreground text-sm">
                ({100 - (xp % 100)} XP to next level)
              </span>
            </div>
          </div> */}
            <Button
              variant="destructive"
              onClick={() =>
                completeSessionMutation.mutate({
                  sessionId: soloSession?.session_id!,
                  sessionType: "solo",
                })
              }
              className="w-full mt-2"
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
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => completeTaskMutation.mutate(task)}
                          className="mr-2"
                        >
                          <CheckCircle2 />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteTaskMutation.mutate(task)}
                          className="mr-2"
                        >
                          <Trash />
                        </Button>
                      </div>
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
            <Button
              className="w-full mt-2"
              onClick={() => setShowAddTaskModal(true)}
            >
              Add a Task
            </Button>
            <AddTaskModal
              checklist_id={soloSession.checklist_id!}
              session_id={soloSession.session_id!}
              show={showAddTaskModal}
              setShow={setShowAddTaskModal}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        {taskAIGenerationMutation.isLoading && <LoadingSymbol />}
        {aiTasks && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-3">
              <CardTitle className="text-xl font-bold">AI Schedule</CardTitle>
              <Calendar className="m-0" />
            </CardHeader>
            <CardContent>
              {aiTasks?.tasks.map((task: AITask, id) => (
                <Card key={id} className="mb-2">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div className="w-50">
                      <h1 className="font-bold">{task?.task}</h1>
                    </div>
                    <div className="w-50 d-flex flex-row items-center justify-center gap-2">
                      <Clock />
                      <h1>{task?.time}</h1>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setCurrentAITask(task!);
                        setShowAITaskModal(true);
                      }}
                    >
                      {" "}
                      <List /> View Plan
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
      <AITaskModal
        show={showAITaskModal}
        setShow={setShowAITaskModal}
        task={currentAITask!}
      />
    </div>
  );
};

export default ActiveSoloStudySession;
