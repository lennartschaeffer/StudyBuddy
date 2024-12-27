import axios from "axios";
import { API_URL } from "../apiRoute";
import { StudySession, Task } from "../Models/StudySession";

export const getActiveSession = async (userId: number) => {
  const res = await axios.get(
    `${API_URL}/studysessions/activeStudySession/${userId}`
  );
  if(res.data.tasks){
    let tasks: Task[] = [];
    if (res.data.tasks.length > 0) {
      tasks = res.data.tasks.map((task: Task) => ({
        task_id: task.task_id,
        task_name: task.task_name,
        task_completed: task.task_completed,
      }));
    }
    const session: StudySession = {
      session_id: res.data.session_id,
      session_name: res.data.session_name,
      start_time: res.data.start_time,
      end_time: res.data.end_time,
      user_id: res.data.user_id,
      session_completed: res.data.session_completed,
      checklist_id: res.data.checklist_id,
      tasks: tasks,
    };
    return session;
  }
};

export const completeTask = async (task: Task) => {
  const res = await axios.put(
    `${API_URL}/studysessions/completeTask/${task?.task_id}`
  );
  return res.data;
};

export const completeActiveStudySession = async (userId: number) => {
  const res = await axios.put(
    `${API_URL}/studysessions/completeActiveStudySession/${userId}`
  );
  return res.data;
};
