import axios from "axios";
import { API_URL } from "../apiRoute";
import { SoloStudySession, Task } from "../Models/StudySession";
import { GroupStudySession } from "../Models/StudySession";

export const getActiveSession = async (userId: number) => {
  const res = await axios.get(
    `${API_URL}/studysessions/activeStudySession/${userId}`,{
      withCredentials: true
    }
  );
  console.log(res.data);
  let session: SoloStudySession | undefined;
  let groupSessions: GroupStudySession[] = [];
  if (res.data.soloSession) {
    let tasks: Task[] = [];
    if (res.data.soloSession.tasks.length > 0) {
      tasks = res.data.soloSession.tasks.map((task: Task) => ({
        task_id: task.task_id,
        task_name: task.task_name,
        task_completed: task.task_completed,
      }));
    }
    session = {
      session_id: res.data.soloSession.session_id,
      session_name: res.data.soloSession.session_name,
      start_time: res.data.soloSession.start_time,
      end_time: res.data.soloSession.end_time,
      user_id: res.data.soloSession.user_id,
      checklist_id: res.data.soloSession.checklist_id,
      tasks: tasks,
    };
  }
  if (res.data.groupSessions && res.data.groupSessions.length > 0) {
    groupSessions = res.data.groupSessions.map(
      (session: GroupStudySession) => ({
        session_name: session.session_name,
        start_time: session.start_time,
        end_time: session.end_time,
        group_name: session.group_name,
        members: session.members ?? [],
        group_studysession_id: session.group_studysession_id,
      })
    );
  }
  return { soloSession: session, groupSessions: groupSessions ?? [] };
};

export const completeTask = async (task: Task) => {
  const res = await axios.put(
    `${API_URL}/studysessions/completeTask/${task?.task_id}`,{
      withCredentials: true
    }
  );
  return res.data;
};

export const completeActiveStudySession = async (
  session_id: number,
  session_type: string
) => {
  if (!session_id || !session_type) {
    throw new Error("Missing required fields");
  }
  try {
    const res = await axios.put(
      `${API_URL}/studysessions/completeActiveStudySession/${session_id}/${session_type}`,{
        withCredentials: true
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to complete active study session:", error);
    throw error;
  }
};

export const getRecentStudySessions = async (userId: number) => {
  console.log("Fetching recent study sessions");
  try {
    const res = await axios.get(
      `${API_URL}/studysessions/recentStudySessions/${userId}`,
      {
        withCredentials: true,
      }
    );
    console.log(res.data);
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
      `${API_URL}/studysessions/completeActiveStudySessionEarly/${sessionId}/${sessionType}`,{
        withCredentials: true
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to complete active session early:", error);
    throw error;
  }
};
