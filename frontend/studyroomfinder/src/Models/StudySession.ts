import { Buddy } from "./StudyBuddy";
import { StudyGroup } from "./StudyGroup";

export type Task = {
  task_id: number;
  task_name: string;
  task_completed: boolean;
};

export type SoloStudySession = {
  session_id: number;
  session_name: string;
  start_time: string;
  end_time: string;
  user_id: number;
  checklist_id: number;
  tasks: Task[];
  totalTime: string | undefined;
};

export type GroupStudySession = {
    session_id: number;
    session_name: string;
    group_name: string;
    start_time: string;
    studygroups: StudyGroup | undefined;
    end_time: string;
    studygroup_id: number;
    members: Buddy[] | undefined;
    totalTime: string | undefined;
    group_studysession_id: number;
}

export type StudySessionMapInfo = {
  user:
    | {
        session_name: string;
        endtime: string;
      }
    | undefined;
  friends: FriendMapInfo[] | undefined;
};

export type FriendMapInfo = {
  username: string;
  first_name: string;
  last_name: string;
  lat: number;
  lon: number;
  session_name: string;
  endtime: string;
};
