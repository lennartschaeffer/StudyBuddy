import { Request, Response } from "express";
import { Server } from "socket.io";
import { supabase } from "../supabaseClient";
import prisma from "../prismaClient";

const sendFriendRequest = async (req: Request, res: Response, io: Server) => {
  try {
    const { sender_id, receiver_id } = req.body;
    // Check if request already exists
    const exists = await prisma.friendrequests.findFirst({
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
    await prisma.friendrequests.create({
      data: {
        sender_id,
        receiver_id,
        status: "pending",
      },
    });

    //send web socket notification
    io.emit("friendRequest", { sender_id, receiver_id });

    res.status(201).send("Friend Request Sent!");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error sending friend request, please try again later.");
  }
};

const respondToFriendRequest = async (
  req: Request,
  res: Response,
  io: Server
) => {
  try {
    const { request_id, response } = req.body;
    if(!request_id || !response){
      return res.status(400).send("Missing required fields");
    }
    const updatedRequest = await prisma.friendrequests.update({
      where: { friendrequest_id: request_id },
      data: { status: response },
    });

    const { sender_id, receiver_id } = updatedRequest;

    if (response === "accepted") {
      await prisma.$transaction(async (prisma) => {
         //two way friendship established, will cause double the rows, but makes querying for friends so much easier
        await prisma.friends.create({
          data: {
            user_id: sender_id,
            friend_id: receiver_id,
          },
        });
        await prisma.friends.create({
          data: {
            user_id: receiver_id,
            friend_id: sender_id,
          },
        });
       //delete from friend requests
        await prisma.friendrequests.deleteMany({
          where: {
            OR: [
              { sender_id: sender_id, receiver_id: receiver_id },
              { sender_id: receiver_id, receiver_id: sender_id },
            ],
          },
        });
      });
    }
    else{ //if they rejected the request, just delete the request
      await prisma.friendrequests.delete({
        where: {
          friendrequest_id: request_id
        }
      });
    }

    io.emit("friendRequestResponse", { sender_id, receiver_id, response });

    res.status(200).send(`Friend request ${response}.`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error responding to friend request, please try again later.");
  }
};

const getFriendsAndInvites = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    const friends = await getFriendsByUser(user_id);
    const friendRequests = await getFriendRequestsByUser(user_id);
    res.json({
      friends: friends,
      friendRequests: friendRequests
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send("Error getting friends and invites, please try again later.");
  }
};

const getFriendsByUser = async (user_id: string) => {
  try {
    const friendIds = await prisma.friends.findMany({
      where: {
        user_id: Number(user_id),
      },
      select: {
        friend_id: true,
      },
    });

    const friendIdList = friendIds.map((friend) => friend.friend_id);

    const friends = await prisma.users.findMany({
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
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const getFriendRequestsByUser = async (user_id: string) => {
  try {
    const requests = await prisma.friendrequests.findMany({
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
    }
    );
    return mappedRequests;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const removeFriend = async (req: Request, res: Response) => {
  try {
    const { user_id, friend_id } = req.params;

    await prisma.friends.deleteMany({
      where: {
        OR: [
          { user_id: Number(user_id), friend_id: Number(friend_id) },
          { user_id: Number(friend_id), friend_id: Number(user_id) },
        ],
      },
    });
    
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

export {
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsAndInvites,
  removeFriend,
  getAllFriendsInSession,
};
