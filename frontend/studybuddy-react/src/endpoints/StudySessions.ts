import axios from "axios";
import { SoloStudySession, Task } from "../Models/StudySession";
import { GroupStudySession } from "../Models/StudySession";

export const getActiveSession = async (userId: number) => {
  const res = await axios.get(
    `${
      import.meta.env.VITE_API_URL
    }/studysessions/activeStudySession/${userId}`,
    {
      withCredentials: true,
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
      totalTime: undefined,
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
    `${import.meta.env.VITE_API_URL}/studysessions/completeTask/${
      task?.task_id
    }`,
    {},
    {
      withCredentials: true,
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
      `${
        import.meta.env.VITE_API_URL
      }/studysessions/completeActiveStudySession/${session_id}/${session_type}`,
      {},
      {
        withCredentials: true,
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
      `${
        import.meta.env.VITE_API_URL
      }/studysessions/recentStudySessions/${userId}`,
      {
        withCredentials: true,
      }
    );
    if (res.data.userSessions) {
      res.data.userSessions.forEach((session: SoloStudySession) => {
        let startVsEndTime =
          new Date(session.end_time).getTime() -
          new Date(session.start_time).getTime();
        let hours = Math.floor(startVsEndTime / (1000 * 60 * 60));
        let minutes = Math.floor(
          (startVsEndTime % (1000 * 60 * 60)) / (1000 * 60)
        );
        session.totalTime = hours + "h " + minutes + "m";
      });
    }
    if (res.data.groupSessions) {
      res.data.groupSessions.forEach((session: GroupStudySession) => {
        let startVsEndTime =
          new Date(session.end_time).getTime() -
          new Date(session.start_time).getTime();
        let hours = Math.floor(startVsEndTime / (1000 * 60 * 60));
        let minutes = Math.floor(
          (startVsEndTime % (1000 * 60 * 60)) / (1000 * 60)
        );
        session.totalTime = hours + "h " + minutes + "m";
      });
    }
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
      `${
        import.meta.env.VITE_API_URL
      }/studysessions/completeActiveStudySessionEarly/${sessionId}/${sessionType}`,
      {
        withCredentials: true,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to complete active session early:", error);
    throw error;
  }
};

export const startSoloStudySession = async (
  sessionName: string,
  time: string,
  userId: number,
  checklist: string[]
) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/studysessions`,
      {
        session_name: sessionName,
        end_time: new Date(time).toISOString(),
        user_id: userId,
        checklist: checklist,
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to start solo session");
    throw error;
  }
};

export const addTask = async (task_name: string, checklist_id: number) => {
  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/studysessions/addTask`,
      {
        task_name: task_name,
        checklist_id: checklist_id,
      }
    );
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeTask = async (task: Task) => {
  try {
    if (!task) {
      return;
    }
    const res = await axios.delete(
      `${import.meta.env.VITE_API_URL}/studysessions/removeTask/${
        task?.task_id
      }`
    );
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
