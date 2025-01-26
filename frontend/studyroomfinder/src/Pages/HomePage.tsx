import { useAuth } from "../Context/useAuth";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { getRecentStudySessions } from "../endpoints/StudySessions";
import { GroupStudySession, SoloStudySession } from "../Models/StudySession";
import { BookOpen, MapPin, Users, UserPlus, Clock, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSymbol } from "@/components/ui/LoadingSymbol";

const HomePage = () => {
  const { user } = useAuth();
  const { data: recentStudySessions, isLoading } = useQuery(
    "recentStudySessions",
    () => getRecentStudySessions(user?.user_id!),
    {
      enabled: !!user?.user_id,
      onError: (error) => {
        console.error("Failed to fetch recent study sessions:", error);
      },
      onSuccess: (data) => {},
    }
  );
  console.log(recentStudySessions);
  return (
    <div className="min-h-screen ">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          Welcome Back {user?.first_name}!{" "}
        </h1>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to={"/studysession"}>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 w-full text-lg"
            >
              <BookOpen className="h-8 w-8 mb-2" />
              Start Session
            </Button>
          </Link>
          <Link to={"/map"}>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 text-lg w-full"
            >
              <MapPin className="h-8 w-8 mb-2" />
              Find Study Spots
            </Button>
          </Link>
          <Link to={"/studygroups"}>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 text-lg w-full"
            >
              <Users className="h-8 w-8 mb-2" />
              Create Study Group
            </Button>
          </Link>
          <Link to={"/studybuddies"}>
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center h-24 text-lg w-full"
            >
              <UserPlus className="h-8 w-8 mb-2" />
              Find Study Buddies
            </Button>
          </Link>
        </div>

        {/* Recent Study Sessions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Study Sessions</CardTitle>
            <CardDescription>
              Your solo and group study activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="solo">
              <TabsList className="mb-4">
                <TabsTrigger value="solo">Solo Sessions</TabsTrigger>
                <TabsTrigger value="group">Group Sessions</TabsTrigger>
              </TabsList>
              <TabsContent value="solo">
                <ScrollArea className="h-[300px]">
                  {isLoading && (
                    <LoadingSymbol/>
                  )}
                  {recentStudySessions?.userSessions?.map(
                    (session: SoloStudySession, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-4 border-b last:border-b-0"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {session.session_name}
                          </h3>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{session.totalTime}</span>
                        </div>
                      </div>
                    )
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="group">
                <ScrollArea className="h-[300px]">
                  {recentStudySessions?.groupSessions?.map(
                    (session: GroupStudySession, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-4 border-b last:border-b-0"
                      >
                        <div>
                          <h3 className="font-semibold">
                            {session.session_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {session.studygroups?.group_name}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{session.totalTime}</span>
                        </div>
                      </div>
                    )
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default HomePage;
