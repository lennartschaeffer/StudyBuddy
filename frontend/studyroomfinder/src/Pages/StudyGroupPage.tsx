import { useEffect, useState } from "react";
import NavBar from "../Components/NavBar";
import "./HomePage.css";
import axios from "axios";
import { API_URL } from "../apiRoute";
import { useAuth } from "../Context/useAuth";
import { toast } from "react-toastify";
import { StudyGroup } from "../Models/StudyGroup";
import CreateStudyGroupModal from "../Components/CreateStudyGroupModal";
import StudyGroupInviteModal from "../Components/StudyGroupInviteModal";

const StudyGroupPage = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] =
    useState<boolean>(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [groupName, setGroupName] = useState<string>("");
  const [groupId, setGroupId] = useState<number>();

  useEffect(() => {
    axios
      .get(`${API_URL}/studygroups/${user?.user_id}`)
      .then((res) => {
        console.log(res.data);
        if (res.data.length > 0) {
          setStudyGroups(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error fetching study groups.");
      });
  }, []);

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
        {studyGroups.length > 0 ? (
          <div className="row d-flex justify-content-center">
            {studyGroups.map((group, id) => (
              <div className="col-4" key={id}>
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
