import { useEffect, useState } from "react";
import StudySessionModal from "../components/studysessions/StudySessionModal";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../Context/useAuth";
import { useMutation, useQuery, useQueryClient } from "react-query";
import {
  completeActiveSessionEarly,
  completeActiveStudySession,
  completeTask,
  getActiveSession,
} from "../endpoints/StudySessions";
import { format, parseISO } from "date-fns";
import { BiGroup, BiUser } from "react-icons/bi";
import CreateGroupStudySessionModal from "../components/studysessions/CreateGroupStudySessionModal";
import { GroupStudySession, SoloStudySession } from "../Models/StudySession";
import ActiveSoloStudySession from "../components/studysessions/ActiveSoloStudySession";
import ActiveGroupStudySession from "../components/studysessions/ActiveGroupStudySession";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Progress } from "@/components/ui/progress";
import { LoadingSymbol } from "@/components/ui/LoadingSymbol";
import { useToast } from "@/hooks/use-toast";

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
  const {toast} = useToast()

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
        toast({
          title: "Error.",
          description: "Couldnt fetch active study session."
        })
      },
    }
  );

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
    <div className="min-h-screen flex items-center justify-center">
      <main className="container px-4 ">
        {activeStudySession?.soloSession ? (
          <ActiveSoloStudySession
            soloSession={activeStudySession.soloSession}
            timeLeft={timeLeft}
            user={user!}
          />
        ) :  isLoading ? (
          <div className="w-full flex items-center justify-center">
 <LoadingSymbol />
          </div>
         
        ) : joinedActiveGroupSession ? (
          <ActiveGroupStudySession groupSession={joinStudyGroupInfo!} user={user!} onLeave={() => setJoinedActiveGroupSession(false)}/>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
            <StudySessionModal />
            <CreateGroupStudySessionModal />
            <Card className="w-full max-w-4xl mx-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Active Group Study Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className=" pr-4">
                  <div className="space-y-4">
                    {activeStudySession?.groupSessions.map((session, id) => (
                      <Card
                        key={id}
                        className="p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <h3 className="font-medium">
                                {session.group_name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>
                                  {session.members?.length} participants
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {format(parseISO(session.start_time), "HH:mm")} - {format(parseISO(session.end_time), "HH:mm")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => {
                              setJoinStudyGroupInfo(session);
                              setJoinedActiveGroupSession(true);
                            }}
                            variant="default"
                          >
                            Join Session
                          </Button>
                        </div>
                      </Card>
                    ))}
                    {
                      activeStudySession?.groupSessions.length === 0 && (
                        <p className="text-center">No active group sessions.</p>
                      )
                    }
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudySessionPage;
