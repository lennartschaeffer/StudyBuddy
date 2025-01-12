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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFriendsInSession = exports.removeFriend = exports.getFriendsAndInvites = exports.respondToFriendRequest = exports.sendFriendRequest = void 0;
const prismaClient_1 = __importDefault(require("../prismaClient"));
const sendFriendRequest = (req, res, io) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sender_id, receiver_id } = req.body;
        // Check if request already exists
        const exists = yield prismaClient_1.default.friendrequests.findFirst({
            where: {
                OR: [
                    { sender_id: sender_id, receiver_id: receiver_id },
                    { sender_id: receiver_id, receiver_id: sender_id },
                ],
                status: "pending",
            },
        });
        if (exists) {
            return res.status(400).send("Friend request already exists.");
        }
        yield prismaClient_1.default.friendrequests.create({
            data: {
                sender_id,
                receiver_id,
                status: "pending",
            },
        });
        //send web socket notification
        io.emit("friendRequest", { sender_id, receiver_id });
        res.status(201).send("Friend Request Sent!");
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .send("Error sending friend request, please try again later.");
    }
});
exports.sendFriendRequest = sendFriendRequest;
const respondToFriendRequest = (req, res, io) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { request_id, response } = req.body;
        if (!request_id || !response) {
            return res.status(400).send("Missing required fields");
        }
        const updatedRequest = yield prismaClient_1.default.friendrequests.update({
            where: { friendrequest_id: request_id },
            data: { status: response },
        });
        const { sender_id, receiver_id } = updatedRequest;
        if (response === "accepted") {
            yield prismaClient_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
                //two way friendship established, will cause double the rows, but makes querying for friends so much easier
                yield prisma.friends.create({
                    data: {
                        user_id: sender_id,
                        friend_id: receiver_id,
                    },
                });
                yield prisma.friends.create({
                    data: {
                        user_id: receiver_id,
                        friend_id: sender_id,
                    },
                });
                //delete from friend requests
                yield prisma.friendrequests.deleteMany({
                    where: {
                        OR: [
                            { sender_id: sender_id, receiver_id: receiver_id },
                            { sender_id: receiver_id, receiver_id: sender_id },
                        ],
                    },
                });
            }));
        }
        else { //if they rejected the request, just delete the request
            yield prismaClient_1.default.friendrequests.delete({
                where: {
                    friendrequest_id: request_id
                }
            });
        }
        io.emit("friendRequestResponse", { sender_id, receiver_id, response });
        res.status(200).send(`Friend request ${response}.`);
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .send("Error responding to friend request, please try again later.");
    }
});
exports.respondToFriendRequest = respondToFriendRequest;
const getFriendsAndInvites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user_id } = req.params;
    try {
        const friends = yield getFriendsByUser(user_id);
        const friendRequests = yield getFriendRequestsByUser(user_id);
        const groupInvites = yield getGroupInvitesByUser(user_id);
        res.json({
            friends: friends,
            friendRequests: friendRequests,
            groupInvites: groupInvites,
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .send("Error getting friends and invites, please try again later.");
    }
});
exports.getFriendsAndInvites = getFriendsAndInvites;
const getFriendsByUser = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const friendIds = yield prismaClient_1.default.friends.findMany({
            where: {
                user_id: Number(user_id),
            },
            select: {
                friend_id: true,
            },
        });
        const friendIdList = friendIds.map((friend) => friend.friend_id);
        const friends = yield prismaClient_1.default.users.findMany({
            where: {
                user_id: {
                    in: friendIdList,
                },
            },
            select: {
                user_id: true,
                username: true,
                first_name: true,
                last_name: true,
            },
        });
        return friends;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
const getFriendRequestsByUser = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const requests = yield prismaClient_1.default.friendrequests.findMany({
            where: {
                receiver_id: Number(user_id),
                status: "pending",
            },
            select: {
                friendrequest_id: true,
                sender_id: true,
                users_friendrequests_sender_idTousers: {
                    select: {
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                }
            },
        });
        //map the data to a more readable format
        const mappedRequests = requests.map((request) => {
            return {
                request_id: request.friendrequest_id,
                sender_id: request.sender_id,
                username: request.users_friendrequests_sender_idTousers.username,
                first_name: request.users_friendrequests_sender_idTousers.first_name,
                last_name: request.users_friendrequests_sender_idTousers.last_name,
            };
        });
        return mappedRequests;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
const getGroupInvitesByUser = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invites = yield prismaClient_1.default.studygroup_invites.findMany({
            where: {
                receiver_id: Number(user_id),
                status: "pending", //where current user is recevier and status is pending
            },
            select: {
                studygroup_invite_id: true,
                studygroup_id: true,
                sender_id: true,
                studygroups: {
                    select: {
                        group_name: true,
                        studygroup_id: true,
                    },
                }, //get studygroup name
                users_studygroup_invites_sender_idTousers: {
                    select: {
                        username: true,
                        first_name: true,
                        last_name: true,
                    },
                },
            },
        });
        //map the data to a more readable format
        const mappedInvites = invites.map((invite) => {
            return {
                invite_id: invite.studygroup_invite_id,
                sender_id: invite.sender_id,
                studygroup_id: invite.studygroup_id,
                group_name: invite.studygroups.group_name,
                username: invite.users_studygroup_invites_sender_idTousers.username,
                first_name: invite.users_studygroup_invites_sender_idTousers.first_name,
                last_name: invite.users_studygroup_invites_sender_idTousers.last_name,
            };
        });
        return mappedInvites;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
const removeFriend = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, friend_id } = req.params;
        yield prismaClient_1.default.friends.deleteMany({
            where: {
                OR: [
                    { user_id: Number(user_id), friend_id: Number(friend_id) },
                    { user_id: Number(friend_id), friend_id: Number(user_id) },
                ],
            },
        });
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
