import axios from "axios";
import { API_URL } from "../apiRoute";
import { FriendRequest, GroupInvite } from "../Models/RequestsAndInvites";

export const getFriendRequestsAndGroupInvites = async (userId: number) => {
  try {
    const res = await axios.get(`${API_URL}/friends/${userId}`);
    const requests: FriendRequest[] = res.data.friendRequests.map(
      (request: FriendRequest) => ({
        first_name: request.first_name,
        last_name: request.last_name,
        username: request.username,
        friendrequest_id: request.friendrequest_id,
      })
    );

    const invites: GroupInvite[] = res.data.groupInvites.map(
      (invite: GroupInvite) => ({
        name: invite.name,
        studygroup_id: invite.studygroup_id,
        studygroup_invite_id: invite.studygroup_invite_id,
        first_name: invite.first_name,
        last_name: invite.last_name,
        username: invite.username,
      })
    );

    return {
      friendRequests: requests,
      groupInvites: invites,
      friends: res.data.friends,
    };
  } catch (error) {
    console.error("Failed to fetch friend requests and group invites:", error);
    throw error;
  }
};

export const respondToFriendRequest = async (
  request_id: number,
  response: string
) => {
  try {
    const res = await axios.post(`${API_URL}/friends/respond`, {
      request_id: request_id,
      response: response,
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
    const res = await axios.post(`${API_URL}/studygroups/respond`, {
      studygroup_id: studygroup_id,
      studygroup_invite_id: invite_id,
      response: response,
      user_id: userId,
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
      `${API_URL}/friends/removeFriend/${userId}/${friend_id}`
    );
    return res.data;
  } catch (error) {
    console.error("Failed to remove friend:", error);
    throw error;
  }
};
