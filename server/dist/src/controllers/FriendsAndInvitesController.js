"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFriendsInSession = exports.removeFriend = exports.getFriendsAndInvites = exports.respondToFriendRequest = exports.sendFriendRequest = void 0;
const supabaseClient_1 = require("../supabaseClient");
const sendFriendRequest = (req, res, io) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sender_id, receiver_id } = req.body;
        // Check if request already exists
        const { data: exists, error: existsError } = yield supabaseClient_1.supabase
            .from('friendrequests')
            .select('*')
            .or(`(sender_id.eq.${sender_id},receiver_id.eq.${receiver_id}), (sender_id.eq.${receiver_id},receiver_id.eq.${sender_id})`)
            .eq('status', 'pending');
        if (existsError)
            throw existsError;
        if (exists.length > 0) {
            return res.status(400).send("Friend request already sent.");
        }
        const { error: insertError } = yield supabaseClient_1.supabase
            .from('friendrequests')
            .insert([{ sender_id, receiver_id }]);
        if (insertError)
            throw insertError;
        // Emit web socket event
        io.emit("friendRequest", { sender_id, receiver_id });
        res.status(201).send("Friend Request Sent!");
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error sending friend request, please try again later.");
    }
});
exports.sendFriendRequest = sendFriendRequest;
const respondToFriendRequest = (req, res, io) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { request_id, response } = req.body;
        if (!["accepted", "rejected"].includes(response)) {
            return res.status(400).send("Invalid response.");
        }
        const { data: updatedRequest, error: updateError } = yield supabaseClient_1.supabase
            .from('friendrequests')
            .update({ status: response })
            .eq('friendrequest_id', request_id)
            .select('*')
            .single();
        if (updateError)
            throw updateError;
        if (!updatedRequest) {
            return res.status(404).send("Friend request not found.");
        }
        const { sender_id, receiver_id } = updatedRequest;
        if (response === "accepted") {
            const { error: insertError } = yield supabaseClient_1.supabase
                .from('friends')
                .insert([{ user_id: sender_id, friend_id: receiver_id }]);
            if (insertError)
                throw insertError;
        }
        io.emit("friendRequestResponse", { sender_id, receiver_id, response });
        res.status(200).send(`Friend request ${response}.`);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error responding to friend request, please try again later.");
    }
});
exports.respondToFriendRequest = respondToFriendRequest;
const getFriendsAndInvites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    try {
        const { data: friends, error: friendsError } = yield supabaseClient_1.supabase.from("friends")
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
            .or(`user_id.eq.${user_id},friend_id.eq.${user_id}`);
        if (friendsError)
            throw friendsError;
        res.json({
            friends,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error getting friends and invites, please try again later.");
    }
});
exports.getFriendsAndInvites = getFriendsAndInvites;
const removeFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, friend_id } = req.params;
        const { error: deleteFriendsError } = yield supabaseClient_1.supabase
            .from('friends')
            .delete()
            .or(`(user_id.eq.${user_id},friend_id.eq.${friend_id}), (user_id.eq.${friend_id},friend_id.eq.${user_id})`);
        if (deleteFriendsError)
            throw deleteFriendsError;
        const { error: deleteRequestsError } = yield supabaseClient_1.supabase
            .from('friendrequests')
            .delete()
            .or(`(sender_id.eq.${user_id},receiver_id.eq.${friend_id}), (sender_id.eq.${friend_id},receiver_id.eq.${user_id})`);
        if (deleteRequestsError)
            throw deleteRequestsError;
        res.json({ message: "Friend removed" });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.removeFriend = removeFriend;
const getAllFriendsInSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Database error");
    }
});
exports.getAllFriendsInSession = getAllFriendsInSession;
