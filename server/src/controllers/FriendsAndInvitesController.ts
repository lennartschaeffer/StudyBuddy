import { Request, Response } from "express";
import pool from "../db";
import { Server } from "socket.io";
import { supabase } from "../supabaseClient";

const sendFriendRequest = async (req: Request, res: Response, io: Server) => {
  try {
    const { sender_id, receiver_id } = req.body;
    // Check if request already exists
    const { data: exists, error: existsError } = await supabase
      .from('friendrequests')
      .select('*')
      .or(`(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}), (sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
      .eq('status', 'pending');

    if (existsError) throw existsError;
    if (exists.length > 0) {
      return res.status(400).send("Friend request already sent.");
    }

    const { error: insertError } = await supabase
      .from('friendrequests')
      .insert([{ sender_id, receiver_id }]);

    if (insertError) throw insertError;

    // Emit web socket event
    io.emit("friendRequest", { sender_id, receiver_id });

    res.status(201).send("Friend Request Sent!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending friend request, please try again later.");
  }
};

const respondToFriendRequest = async (req: Request, res: Response, io: Server) => {
  try {
    const { request_id, response } = req.body;
    if (!["accepted", "rejected"].includes(response)) {
      return res.status(400).send("Invalid response.");
    }

    const { data: updatedRequest, error: updateError } = await supabase
      .from('friendrequests')
      .update({ status: response })
      .eq('friendrequest_id', request_id)
      .select('*')
      .single();

    if (updateError) throw updateError;
    if (!updatedRequest) {
      return res.status(404).send("Friend request not found.");
    }

    const { sender_id, receiver_id } = updatedRequest;

    if (response === "accepted") {
      const { error: insertError } = await supabase
        .from('friends')
        .insert([{ user_id: sender_id, friend_id: receiver_id }]);

      if (insertError) throw insertError;
    }

    io.emit("friendRequestResponse", { sender_id, receiver_id, response });

    res.status(200).send(`Friend request ${response}.`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error responding to friend request, please try again later.");
  }
};

const getFriendsAndInvites = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    
    const {data: friends, error: friendsError} = await supabase.from("friends")
    .select(`
      user_id,
      friend_id,
      users!friends_friend_id_fkey(
        user_id,
        username,
        first_name,
        last_name
        )
      users!friends_user_id_fkey(
        user_id,
        username,
        first_name,
        last_name
        )
      `)
      .or(`user_id.eq.${user_id},friend_id.eq.${user_id}`)

    if (friendsError) throw friendsError;

    res.json({
      friends,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error getting friends and invites, please try again later.");
  }
};

const removeFriend = async (req: Request, res: Response) => {
  try {
    const { user_id, friend_id } = req.params;

    const { error: deleteFriendsError } = await supabase
      .from('friends')
      .delete()
      .or(`(user_id.eq.${user_id},friend_id.eq.${friend_id}), (user_id.eq.${friend_id},friend_id.eq.${user_id})`);

    if (deleteFriendsError) throw deleteFriendsError;

    const { error: deleteRequestsError } = await supabase
      .from('friendrequests')
      .delete()
      .or(`(sender_id.eq.${user_id},receiver_id.eq.${friend_id}), (sender_id.eq.${friend_id},receiver_id.eq.${user_id})`);

    if (deleteRequestsError) throw deleteRequestsError;

    res.json({ message: "Friend removed" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

const getAllFriendsInSession = async (req: Request, res: Response) => {
  try {
    // const { user_id } = req.params;
    // const { data: friends, error } = await supabase
    //   .from('friends')
    //   .select('u.username, u.first_name, u.last_name, u.user_id, s.endtime, s.session_name')
    //   .or(`user_id.eq.${user_id},friend_id.eq.${user_id}`)
    //   .neq('u.user_id', user_id)
    //   .join('users u', 'u.user_id', 'friends.friend_id')
    //   .join('studysessions s', 's.user_id', 'u.user_id')
    //   .eq('s.session_completed', false);

    // if (error) throw error;

    // res.json(friends);
  } catch (error) {
    console.error(error);
    res.status(500).send("Database error");
  }
};

export{
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsAndInvites,
  removeFriend,
  getAllFriendsInSession,
};
