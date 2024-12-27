import axios from "axios";
import { API_URL } from "../apiRoute";

export const getStudyGroups = async (userId: number) => {
  try {
    const res = await axios.get(`${API_URL}/studygroups/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch study groups:", error);
    throw error;
  }
};

export const handleInviteToStudyGroup = async (sender_id:number, receiver_id: number, studygroup_id: number) => {
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
