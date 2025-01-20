import { useState } from "react";
import "./HomePage.css";
import { useAuth } from "../Context/useAuth";
import { StudyGroup } from "../Models/StudyGroup";
import CreateStudyGroupModal from "../components/modals/CreateStudyGroupModal";
import StudyGroupInviteModal from "../components/modals/StudyGroupInviteModal";
import { useQuery } from "react-query";
import {
  getStudyGroups,
  getUpcomingGroupSessions,
} from "../endpoints/StudyGroups";
import SessionSchedulingModal from "../components/modals/SessionSchedulingModal";
import { FaCalendar } from "react-icons/fa6";
import { FaUserGroup } from "react-icons/fa6";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { useGetStudyGroups } from "../Context/useGetStudyGroups";
import { GroupStudySession } from "../Models/StudySession";
import axios from "axios";
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
import { LoadingSymbol } from "@/components/LoadingSymbol";

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
                    <Button variant="outline" size="sm" className="w-full" >
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
    </div>
    // <div className="Main h-100">
    //   <div className="container pt-5 ">
    //     <div className="row mt-5">
    //       <div className="col-8">
    //         <div className="d-flex justify-content-around mb-5">
    //           <h1 className="text-light text-center m-0">
    //             <strong>My Study Groups</strong>
    //           </h1>
    //           <button
    //             className="btn btn-light"
    //             onClick={() => setShowCreateGroupModal(true)}
    //           >
    //             <b>+ </b>
    //             <b>Create a New Group</b>
    //           </button>
    //         </div>
    //         {typeof studyGroups !== "string" ? (
    //           <div className="row ">
    //             {studyGroups?.map((group: StudyGroup, id: number) => (
    //               <div className="col-6 mb-4" key={id}>
    //                 <div className="card h-100">
    //                   <div className="card-header">
    //                     <h3 className="card-title">
    //                       <b>{group.group_name}</b>
    //                     </h3>
    //                   </div>
    //                   <div className="card-body d-flex flex-column justify-content-center">
    //                     {/* <h5 className="card-subtitle mb-2 text-muted">
    //                       Members:
    //                     </h5>
    //                     <div className="d-flex gap-2 mb-2">
    //                       {group.members?.map((member, id) => (
    //                         <span
    //                           className="bg-dark text-light rounded-2 p-1"
    //                           key={id}
    //                           style={{ fontSize: "12px" }}
    //                         >
    //                           <strong>{member.member_name}</strong>
    //                         </span>
    //                       ))}
    //                     </div> */}
    //                     <div className="d-grid gap-2 d-md-block">
    //                       <button
    //                         className="btn btn-sm btn-outline-dark col-7"
    //                         onClick={() =>
    //                           handleShowInviteModal(
    //                             group.studygroup_id,
    //                             group.group_name
    //                           )
    //                         }
    //                       >
    //                         <FaUserGroup /> Invite a Buddy
    //                       </button>
    //                       <button className="btn btn-sm btn-outline-dark col-5">
    //                         View Group
    //                       </button>
    //                     </div>
    //                     <button
    //                       className="btn d-block btn-outline-dark mt-2"
    //                       onClick={() =>
    //                         handleShowSessionModal(
    //                           group.studygroup_id,
    //                           group.group_name
    //                         )
    //                       }
    //                     >
    //                       <RiCalendarScheduleLine /> Schedule a Session
    //                     </button>
    //                   </div>
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //         ) : (
    //           <h3 className="text-light text-center">No study groups found.</h3>
    //         )}
    //       </div>
    //       <div className="col-4">
    //         <div className="card">
    //           <div className="card-body">
    //             <h4 className="card-title d-flex align-items-center ">
    //               <FaCalendar className="mr-1" /> <b>Upcoming Sessions</b>
    //             </h4>
    //             <p className="card-text ">
    //               View and manage your upcoming study sessions.
    //             </p>
    //             <ListGroup>
    //               {upcomingSessions && upcomingSessions.length > 0 ? (
    //                 upcomingSessions.map(
    //                   (session: GroupStudySession, id: number) => (
    //                     <ListGroup.Item key={`${groupId}-${id}`}>
    //                       <div className="row">
    //                         <div className="col-7">
    //                           <b>{session.session_name}</b>
    //                         </div>
    //                         <div className="col-5">
    //                           <p
    //                             className="text-muted text-center"
    //                             style={{ fontSize: "12px" }}
    //                           >
    //                             {new Date(session.start_time)
    //                               .toLocaleString("en-US", {
    //                                 month: "numeric",
    //                                 day: "numeric",
    //                                 year: "numeric",
    //                                 hour: "2-digit",
    //                                 minute: "2-digit",
    //                                 hour12: false,
    //                               })
    //                               .replace(",", " at")}
    //                           </p>
    //                         </div>
    //                         <div className="col-12">
    //                           <div className="card-text text-info">
    //                             <strong>
    //                               {session.group_name ??
    //                                 "Study Group"}
    //                             </strong>
    //                           </div>
    //                         </div>
    //                       </div>
    //                     </ListGroup.Item>
    //                   )
    //                 )
    //               ) : (
    //                 <h6 className="card-text">No upcoming sessions.</h6>
    //               )}
    //             </ListGroup>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    //   <CreateStudyGroupModal
    //     show={showCreateGroupModal}
    //     onClose={() => setShowCreateGroupModal(false)}
    //   />
    //   <StudyGroupInviteModal
    //     show={showInviteModal}
    //     onClose={() => setShowInviteModal(false)}
    //     name={groupName}
    //     studygroup_id={groupId!}
    //   />
    //   <SessionSchedulingModal
    //     show={showSessionModal}
    //     onClose={() => setShowSessionModal(false)}
    //     name={groupName}
    //     groupId={groupId!}
    //   />
    // </div>
  );
};

export default StudyGroupPage;
