import { useQuery } from "react-query";
import { getUserProfileInfo } from "../endpoints/Profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Clock, BookOpen, Target, Badge, Award } from "lucide-react";
import { useAuth } from "@/Context/useAuth";

const ProfilePage = () => {
  const { user, logout } = useAuth();

  const handleLogOut = () => {
    logout();
  };

  const {data: userProfileInfo} = useQuery("userProfileInfo", () => getUserProfileInfo(user?.user_id!), {
    enabled: !!user?.user_id,
    onError: (error) => {
      console.error("Failed to fetch user profile info:", error);
    },
  });
  

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={""} alt={"avatar"} />
          <AvatarFallback>{user?.first_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">{user?.first_name} {user?.last_name}</h1>
          <h4 className="font-semibold">{user?.university ?? 'Not Enrolled'}</h4>
          <h4 className="text-gray-500">{user?.degree ?? 'N/A'}</h4>
        </div>
      </header>
      <main className="grid gap-8 md:grid-cols-1">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Study Statistics</h2>
          <div className="grid gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Study Hours</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfileInfo?.totalStudyTime}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfileInfo?.numberOfStudySessions}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Session Length</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userProfileInfo?.averageStudyTime}</div>
              </CardContent>
            </Card>
          </div>
        </section>

       
      </main>
    </div>
  );
};

export default ProfilePage;
