import { useState } from "react";
import NavBar from "../Components/NavBar";
import "./HomePage.css";
import { useAuth } from "../Context/useAuth";
import { StudyGroup } from "../Models/StudyGroup";
import CreateStudyGroupModal from "../Components/CreateStudyGroupModal";
import StudyGroupInviteModal from "../Components/StudyGroupInviteModal";
import { useQuery } from "react-query";
import { getStudyGroups } from "../endpoints/StudyGroups";

const StudyGroupPage = () => {
  const { user } = useAuth();
  const [showCreateGroupModal, setShowCreateGroupModal] =
    useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [groupId, setGroupId] = useState<number>();

  const {
    data: studyGroups,
  } = useQuery("studyGroups", () => getStudyGroups(user?.user_id!), {
    enabled: !!user?.user_id,
  });

  const handleShowInviteModal = (groupId: number, groupName: string) => {
    setGroupId(groupId);
    setGroupName(groupName);
    setShowInviteModal(true);
  };

  return (
    <div className="Main vh-100">
      <NavBar />

      <div className="container mt-5">
        <div className="d-flex justify-content-around mb-5">
          <h2 className="text-light text-center">My Study Groups</h2>
          <button
            className="btn btn-light"
            onClick={() => setShowCreateGroupModal(true)}
          >
            <b>Create a Group</b>
          </button>
        </div>
        {typeof studyGroups !== "string" ? (
          <div className="row d-flex justify-content-center">
            {studyGroups?.map((group: StudyGroup, id: number) => (
              <div className="col-4 mb-4" key={id}>
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">{group.name}</h3>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-subtitle mb-2 text-muted">Members:</h5>
                    <div>
                      {group.members?.map((member, id) => (
                        <span className="badge badge-dark mr-1" key={id}>
                          {member.member_name}
                        </span>
                      ))}
                    </div>
                    <div className="d-flex justify-content-center mt-3">
                      <button
                        className="btn btn-sm btn-dark mt-2 btn-block mr-1"
                        onClick={() =>
                          handleShowInviteModal(group.studygroup_id, group.name)
                        }
                      >
                        Invite a Buddy
                      </button>
                      <button className="btn btn-sm btn-dark btn-block">
                        Chat
                      </button>
                    </div>
                    <button className="btn btn-block btn-success mt-2">
                      Schedule a Session
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
      <CreateStudyGroupModal
        show={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
      />
      <StudyGroupInviteModal
        show={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        name={groupName}
        id={groupId!}
      />
    </div>
  );
};

export default StudyGroupPage;
