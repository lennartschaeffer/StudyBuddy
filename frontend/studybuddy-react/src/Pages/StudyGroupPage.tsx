import { useState } from "react";
import { useAuth } from "../Context/useAuth";
import CreateStudyGroupModal from "../components/studygroups/CreateStudyGroupModal";
import { useQuery } from "react-query";
import {
  getUpcomingGroupSessions,
} from "../endpoints/StudyGroups";
import SessionSchedulingModal from "../components/studysessions/SessionSchedulingModal";
import { useGetStudyGroups } from "../Context/useGetStudyGroups";
import { GroupStudySession } from "../Models/StudySession";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Eye, UserPlus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { LoadingSymbol } from "@/components/ui/LoadingSymbol";
import StudyGroupInviteModal from "@/components/studygroups/StudyGroupInviteModal";

const StudyGroupPage = () => {
  const { user } = useAuth();
  const [showCreateGroupModal, setShowCreateGroupModal] =
    useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [groupId, setGroupId] = useState<number>();

  const { studyGroups,isLoading } = useGetStudyGroups();

  const { data: upcomingSessions, isLoading: isLoadingUpcomingSessions } = useQuery(
    "upcomingSessions",
    () => getUpcomingGroupSessions(user?.user_id!),
    {
      enabled: !!user?.user_id,
      staleTime: 5000,
      onError: (error) => {
        console.error("Failed to fetch upcoming sessions:", error);
      },
    }
  );

  const handleShowInviteModal = (groupId: number, groupName: string) => {
    setGroupId(groupId);
    setGroupName(groupName);
    setShowInviteModal(true);
  };

  const handleShowSessionModal = (groupId: number, groupName: string) => {
    setGroupId(groupId);
    setGroupName(groupName);
    setShowSessionModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <main className="grid gap-8 md:grid-cols-3">
        <section className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Your Study Groups</h2>
            <Button onClick={() => setShowCreateGroupModal(true)}>
              <Users className="mr-2 h-4 w-4" /> Create New Group
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {
              isLoading && (
                <div className="w-full flex items-center justify-center">
                  <LoadingSymbol />
                </div>
              )
            }
            {studyGroups?.map((group, id) => (
              <Card key={id}>
                <CardHeader>
                  <CardTitle>{group.group_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">{0} members</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="flex lg:flex-row flex-col w-full overflow-auto">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 " /> View Group
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleShowInviteModal(group.studygroup_id, group.group_name)} >
                      <UserPlus className="mr-2 h-4 w-1/2" /> Invite
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => handleShowSessionModal(group.studygroup_id, group.group_name)}>
                    <Calendar className="mr-2 h-4" /> Schedule
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {
              studyGroups?.length === 0 && (
                <p className="text-center">No study groups Yet!</p>
              )
            }
          </div>
        </section>
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Group Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {
                  isLoadingUpcomingSessions && (
                    <div className="w-full flex items-center justify-center">
                      <LoadingSymbol />
                    </div>
                  )
                }
                {upcomingSessions?.map(
                  (session: GroupStudySession, id: number) => (
                    <li key={id} className="flex items-center">
                      <div className="flex justify-between w-full">
                        <div>
                        <h1 className="font-semibold text-lg">{session.session_name}</h1>
                        <p className="text-blue-600">{session.studygroups?.group_name}</p>
                        </div>
                        <div className="flex items-start">
                        <Clock className="mr-2 h-4 w-4 text-gray-500 mt-1" />
                        {format(parseISO(session.start_time), "HH:mm")} - {format(parseISO(session.end_time), "HH:mm")}
                        </div>
                        <p className="text-sm text-gray-500">
                          
                        </p>
                      </div>
                    </li>
                  )
                )}
              </ul>
              {
                upcomingSessions?.length === 0 && (
                  <p className="text-center">No upcoming sessions.</p>
                )
              }
            </CardContent>
          </Card>
          <CreateStudyGroupModal show={showCreateGroupModal} setShow={setShowCreateGroupModal} />
          <SessionSchedulingModal show={showSessionModal} setShow={setShowSessionModal} name={groupName} groupId={groupId!} />
        </section>
      </main>
      <StudyGroupInviteModal show={showInviteModal} setShow={setShowInviteModal} name={groupName} studygroup_id={groupId!}/>
    </div>
  );
};

export default StudyGroupPage;
