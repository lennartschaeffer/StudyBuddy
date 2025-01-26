import axios from "axios";
import axiosInstance from "../axiosInstanceTest/axiosInstance";
import { toast } from "@/hooks/use-toast";

export const getStudyGroups = async (userId: number) => {
  try {
    const res = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/studygroups/${userId}`,{
      withCredentials: true
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    //console.error("Failed to fetch study groups:", error);
    throw error;
  }
};

export const createStudyGroup = async (group_name: string, user_id: number) => {
  try {
    if(!group_name){
      toast({
        title: "Error",
        description: "Missing required fields",
      })
      throw new Error("Missing required fields");
    }
    const res = await axiosInstance.post(`${import.meta.env.VITE_API_URL}/studygroups`, {
      user_id: user_id,
      group_name: group_name,
    },{
      withCredentials: true
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
    const res = await axiosInstance.post(`${import.meta.env.VITE_API_URL}/studygroups/invite`, {
      sender_id: sender_id,
      receiver_id: receiver_id,
      studygroup_id: studygroup_id,
    }, {
      withCredentials: true
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
    console.log(studygroup_id, session_name, start_time, end_time);
    toast({
      title: "Error",
      description: "Missing required fields",
    })
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
    const res = await axiosInstance.post(`${import.meta.env.VITE_API_URL}/studysessions/group`, requestBody,{
      withCredentials: true
    });
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Failed to create group study session:", error);
    throw error;
  }
};

export const getUpcomingGroupSessions = async (userId: number) => {
  try {
    const res = await axiosInstance.get(
      `${import.meta.env.VITE_API_URL}/studysessions/upcomingGroupSessions/${userId}`,{
        withCredentials: true
      }
    );
    console.log(res.data);
    
    return res.data;
  } catch (error) {
    console.error("Failed to fetch upcoming group sessions:", error);
    throw error;
  }
};
