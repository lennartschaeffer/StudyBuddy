import axios from "axios";
import { UserProfileInfo } from "../Models/User";

export const getUserProfileInfo = async (userId: number) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/getProfileInfo/${userId}`,{
            withCredentials: true
        });
        console.log(res.data)
        //convert study time in minutes to hours and minutes
        let hours = Math.floor(res.data.totalStudyTime / 60);
        let minutes = Math.floor(res.data.totalStudyTime % 60);
        //convert avg study time to hours and minutes
        let avgHours = Math.floor(res.data.averageStudyTime / 60);
        let avgMins = Math.floor(res.data.averageStudyTime % 60);
        const userProfileInfo: UserProfileInfo = {
            totalStudyTime: hours + "h " + minutes + "m",
            numberOfStudyGroups: res.data.numberOfStudyGroups,
            numberOfStudySessions: res.data.numberOfStudySessions,
            averageStudyTime: avgHours + 'h '+ avgMins + 'm'
        };
        return userProfileInfo;
        
    } catch (error) {
        console.error(error);
        throw new Error("Error getting user profile");
    }
}
