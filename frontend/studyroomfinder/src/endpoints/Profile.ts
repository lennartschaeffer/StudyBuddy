import axios from "axios";
import { API_URL } from "../apiRoute";
import { UserProfileInfo } from "../Models/User";

export const getUserProfileInfo = async (userId: number) => {
    try {
        const res = await axios.get(`${API_URL}/users/getProfileInfo/${userId}`,{
            withCredentials: true
        });
        //convert study time in minutes to hours and minutes
        let hours = Math.floor(res.data.totalStudyTime / 60);
        let minutes = Math.floor(res.data.totalStudyTime % 60);
        const userProfileInfo: UserProfileInfo = {
            totalStudyTime: hours + "h " + minutes + "m",
            numberOfStudyGroups: res.data.numberOfStudyGroups,
            numberOfStudySessions: res.data.numberOfStudySessions,
        };
        return userProfileInfo;
        
    } catch (error) {
        console.error(error);
        throw new Error("Error getting user profile");
    }
}
