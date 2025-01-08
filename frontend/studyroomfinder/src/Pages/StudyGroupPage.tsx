import { useState } from "react";
import NavBar from "../Components/NavBar";
import "./HomePage.css";
import { useAuth } from "../Context/useAuth";
import { StudyGroup } from "../Models/StudyGroup";
import CreateStudyGroupModal from "../Components/CreateStudyGroupModal";
import StudyGroupInviteModal from "../Components/StudyGroupInviteModal";
import { useQuery } from "react-query";
import {
  getStudyGroups,
  getUpcomingGroupSessions,
} from "../endpoints/StudyGroups";
import SessionSchedulingModal from "../Components/SessionSchedulingModal";
import { FaCalendar } from "react-icons/fa6";
import { FaUserGroup } from "react-icons/fa6";
import { ListGroup } from "react-bootstrap";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { useGetStudyGroups } from "../Context/useGetStudyGroups";
import { GroupStudySession } from "../Models/StudySession";

const StudyGroupPage = () => {
  const { user } = useAuth();
  const [showCreateGroupModal, setShowCreateGroupModal] =
    useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showSessionModal, setShowSessionModal] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [groupId, setGroupId] = useState<number>();

  const { studyGroups } = useGetStudyGroups();

  const { data: upcomingSessions } = useQuery(
    "upcomingSessions",
    () => getUpcomingGroupSessions(user?.user_id!),
    {
      enabled: !!user?.user_id,
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
    <div className="Main h-100">
      <div className="container pt-5 ">
        <div className="row mt-5">
          <div className="col-8">
            <div className="d-flex justify-content-around mb-5">
              <h1 className="text-light text-center m-0">
                <strong>My Study Groups</strong>
              </h1>
              <button
                className="btn btn-light"
                onClick={() => setShowCreateGroupModal(true)}
              >
                <b>+ </b>
                <b>Create a New Group</b>
              </button>
            </div>
            {typeof studyGroups !== "string" ? (
              <div className="row ">
                {studyGroups?.map((group: StudyGroup, id: number) => (
                  <div className="col-6 mb-4" key={id}>
                    <div className="card h-100">
                      <div className="card-header">
                        <h3 className="card-title">
                          <b>{group.group_name}</b>
                        </h3>
                      </div>
                      <div className="card-body d-flex flex-column justify-content-center">
                        {/* <h5 className="card-subtitle mb-2 text-muted">
                          Members:
                        </h5>
                        <div className="d-flex gap-2 mb-2">
                          {group.members?.map((member, id) => (
                            <span
                              className="bg-dark text-light rounded-2 p-1"
                              key={id}
                              style={{ fontSize: "12px" }}
                            >
                              <strong>{member.member_name}</strong>
                            </span>
                          ))}
                        </div> */}
                        <div className="d-grid gap-2 d-md-block">
                          <button
                            className="btn btn-sm btn-outline-dark col-7"
                            onClick={() =>
                              handleShowInviteModal(
                                group.studygroup_id,
                                group.group_name
                              )
                            }
                          >
                            <FaUserGroup /> Invite a Buddy
                          </button>
                          <button className="btn btn-sm btn-outline-dark col-5">
                            View Group
                          </button>
                        </div>
                        <button
                          className="btn d-block btn-outline-dark mt-2"
                          onClick={() =>
                            handleShowSessionModal(
                              group.studygroup_id,
                              group.group_name
                            )
                          }
                        >
                          <RiCalendarScheduleLine /> Schedule a Session
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <h3 className="text-light text-center">No study groups found.</h3>
            )}
          </div>
          <div className="col-4">
            <div className="card">
              <div className="card-body">
                <h4 className="card-title d-flex align-items-center ">
                  <FaCalendar className="mr-1" /> <b>Upcoming Sessions</b>
                </h4>
                <p className="card-text ">
                  View and manage your upcoming study sessions.
                </p>
                <ListGroup>
                    {upcomingSessions && upcomingSessions.length > 0 ? (
                    upcomingSessions?.map(
                      (groupSessions: GroupStudySession[], groupId: number) => (
                      groupSessions.map((session: GroupStudySession, id: number) => (
                        <ListGroup.Item key={`${groupId}-${id}`}>
                        <div className="row">
                          <div className="col-7">
                          <b>{session.session_name}</b>
                          </div>
                          <div className="col-5">
                          <p
                            className="text-muted text-center"
                            style={{ fontSize: "12px" }}
                          >
                            {new Date(session.start_time)
                            .toLocaleString("en-US", {
                              month: "numeric",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                            .replace(",", " at")}
                          </p>
                          </div>
                          <div className="col-12">
                          <div className="card-text text-info">
                            <strong>{session.studygroups.group_name ?? "Study Group"}</strong>
                          </div>
                          </div>
                        </div>
                        </ListGroup.Item>
                      ))
                      )
                    )
                    ) : (
                    <h6 className="card-text">No upcoming sessions.</h6>
                  )}
                </ListGroup>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateStudyGroupModal
        show={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      />
      <StudyGroupInviteModal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        name={groupName}
        studygroup_id={groupId!}
      />
      <SessionSchedulingModal
        show={showSessionModal}
        onClose={() => setShowSessionModal(false)}
        name={groupName}
        groupId={groupId!}
      />
    </div>
  );
};

export default StudyGroupPage;
