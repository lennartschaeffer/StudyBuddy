export type Task = {
  task_id: number;
  task_name: string;
  task_completed: boolean;
};

export type StudySession = {
  session_id: number;
  session_name: string;
  session_date: string;
  endtime: string;
  user_id: number;
  session_completed: boolean;
  checklist_id: number;
  tasks: Task[];
};

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
