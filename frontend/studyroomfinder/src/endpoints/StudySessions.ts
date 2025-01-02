import axios from "axios";
import { API_URL } from "../apiRoute";
import { SoloStudySession, Task } from "../Models/StudySession";
import { GroupStudySession } from "../Models/StudySession";

export const getActiveSession = async (userId: number) => {
  const res = await axios.get(
    `${API_URL}/studysessions/activeStudySession/${userId}`
  );
  console.log(res.data);
  if (res.data.solo_session) {
    let tasks: Task[] = [];
    if (res.data.solo_session.tasks.length > 0) {
      tasks = res.data.solo_session.tasks.map((task: Task) => ({
        task_id: task.task_id,
        task_name: task.task_name,
        task_completed: task.task_completed,
      }));
    }
    const session: SoloStudySession = {
      session_id: res.data.solo_session.session_id,
      session_name: res.data.solo_session.session_name,
      start_time: res.data.solo_session.start_time,
      end_time: res.data.solo_session.end_time,
      user_id: res.data.solo_session.user_id,
      checklist_id: res.data.solo_session.checklist_id,
      tasks: tasks,

    };
    return { session_type: "solo", session };
  }
  if (res.data.group_session) {
    const session: GroupStudySession = {
      group_name: res.data.group_session.group_name,
      session_name: res.data.group_session.session_name,
      start_time: res.data.group_session.start_time,
      end_time: res.data.group_session.end_time,
      session_id: res.data.group_session.group_studysessions_id,
      studygroup_id: res.data.group_session.studygroup_id,
    };
    return { session_type: "group", session };
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

export const getRecentStudySessions = async (userId: number) => {
  try {
    const res = await axios.get(
      `${API_URL}/studysessions/recentStudySessions/${userId}`
    );
    return res.data;
  } catch (error) {
    console.error("Failed to fetch recent study sessions:", error);
    throw error;
  }
};

export const completeActiveSessionEarly = async (
  sessionId: number,
  sessionType: string
) => {
  try {
    if (!sessionId || !sessionType) {
      throw new Error("Missing required fields");
    }
    const res = await axios.put(
      `${API_URL}/studysessions/completeActiveStudySessionEarly/${sessionId}/${sessionType}`
    );
    return res.data;
  } catch (error) {
    console.error("Failed to complete active session early:", error);
    throw error;
  }
};
