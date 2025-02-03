import axios from "axios";
import { FriendRequest, GroupInvite } from "../Models/RequestsAndInvites";
import { Buddy } from "../Models/StudyBuddy";

export const getFriendRequestsAndGroupInvites = async (userId: number) => {
  
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/friends/${userId}`,{
      withCredentials: true
    });
    console.log(res.data);
    
    const requests: FriendRequest[] = res.data.friendRequests.map(
      (request: FriendRequest) => ({
        first_name: request.first_name,
        last_name: request.last_name,
        username: request.username,
        request_id: request.request_id,
      })
    );
    
    const friends : Buddy[] = res.data.friends.map(
      (friend: Buddy) => ({
        first_name: friend.first_name,
        last_name: friend.last_name,
        username: friend.username,
        user_id: friend.user_id,
      })
    );

    const invites: GroupInvite[] = res.data.groupInvites.map(
      (invite: GroupInvite) => ({
        studygroup_id: invite.studygroup_id,
        invite_id: invite.invite_id,
        first_name: invite.first_name,
        last_name: invite.last_name,
        username: invite.username,
        group_name: invite.group_name,
      })
    );
    
    return {
      friendRequests: requests,
      groupInvites: invites,
      friends: friends,
    };
  } catch (error) {
    //console.error("Failed to fetch friend requests and group invites:", error);
    throw error;
  }
};

export const respondToFriendRequest = async (
  request_id: number,
  response: string
) => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/friends/respond`, {
      request_id: request_id,
      response: response,
    },{
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    console.error("Failed to respond to friend request:", error);
    throw error;
  }
};

export const respondToGroupInvite = async (
  studygroup_id: number,
  invite_id: number,
  response: string,
  userId: number
) => {
  try {
    console.log(studygroup_id, invite_id, response, userId);
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/studygroups/respond`, {
      studygroup_id: studygroup_id,
      studygroup_invite_id: invite_id,
      response: response,
      user_id: userId,
    },{
      withCredentials: true
    });
    return res.data;
  } catch (error) {
    console.error("Failed to respond to group invite:", error);
    throw error;
  }
};

export const removeFriend = async (friend_id: number, userId: number) => {
  try {
    const res = await axios.delete(
      `${import.meta.env.VITE_API_URL}/friends/removeFriend/${userId}/${friend_id}`,{
        withCredentials: true
      }
    );
    return res.data;
  } catch (error) {
    console.error("Failed to remove friend:", error);
    throw error;
  }
};

export const sendFriendRequest = async (senderId: number, receiverId: number) => {
  try {
    const res = await axios
    .post(`${import.meta.env.VITE_API_URL}/friends/send`, {
      sender_id: senderId,
      receiver_id: receiverId,
    })
    return res.data;
  } catch (error) {
    console.error("Failed to send buddy request:", error);
    throw error;
  }
      
  };
