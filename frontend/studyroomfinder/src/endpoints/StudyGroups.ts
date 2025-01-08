import axios from "axios";
import { API_URL } from "../apiRoute";

export const getStudyGroups = async (userId: number) => {
  try {
    const res = await axios.get(`${API_URL}/studygroups/${userId}`);
    console.log(res.data);
    return res.data;
  } catch (error) {
    //console.error("Failed to fetch study groups:", error);
    throw error;
  }
};

export const createStudyGroup = async (group_name: string, user_id: number) => {
  try {
    const res = await axios.post(`${API_URL}/studygroups`, {
      user_id: user_id,
      group_name: group_name,
    });
    return res.data;
  } catch (error) {
    console.error("Failed to create study group:", error);
    throw error;
  }
};

export const inviteToStudyGroup = async (
  sender_id: number,
  receiver_id: number,
  studygroup_id: number
) => {
  try {
    const res = await axios.post(`${API_URL}/studygroups/invite`, {
      sender_id: sender_id,
      receiver_id: receiver_id,
      studygroup_id: studygroup_id,
    });
    return res.data;
  } catch (error) {
    console.error("Failed to invite to study group:", error);
    throw error;
  }
};

export const createGroupStudySession = async (
  studygroup_id: number,
  session_name: string,
  start_time: string,
  end_time: string
) => {
  if(!studygroup_id || !session_name || !end_time){
    throw new Error("Missing required fields");
  }
  try {
    const requestBody: any = {
      studygroup_id: studygroup_id,
      name: session_name,
      end_time: new Date(end_time).toISOString(),
    };

    if (start_time) {
      requestBody.start_time = new Date(start_time).toISOString();
    }

    const res = await axios.post(`${API_URL}/studysessions/group`, requestBody);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to create group study session:", error);
    throw error;
  }
};

export const getUpcomingGroupSessions = async (userId: number) => {
  try {
    const res = await axios.get(
      `${API_URL}/studysessions/upcomingGroupSessions/${userId}`
    );
    console.log(res.data);
    
    return res.data;
  } catch (error) {
    console.error("Failed to fetch upcoming group sessions:", error);
    throw error;
  }
};
