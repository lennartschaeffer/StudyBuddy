import { createContext, useContext } from "react";
import { StudyGroup } from "../Models/StudyGroup";
import { Props } from "./useGetFriendsAndInvites";
import { useAuth } from "./useAuth";
import { useQuery } from "react-query";
import { getStudyGroups } from "../endpoints/StudyGroups";

type StudyGroupsContext = {
    studyGroups: StudyGroup[] | undefined;
    refetch: () => void;
}

const StudyGroupsContext = createContext<StudyGroupsContext>({} as StudyGroupsContext);


export const StudyGroupProvider = ({ children }: Props) => {
  const { user } = useAuth();

  const { data: studyGroups, refetch } = useQuery(
      "studyGroups",
      () => getStudyGroups(user?.user_id!),
      {
        enabled: !!user?.user_id,
      }
    );

  return (
    <StudyGroupsContext.Provider value={{ studyGroups, refetch }}>
      {children}
    </StudyGroupsContext.Provider>
  );
};

export const useGetStudyGroups = () =>
  useContext(StudyGroupsContext);
