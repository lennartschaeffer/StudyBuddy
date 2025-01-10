import { Request, Response } from "express";
import { Server } from "socket.io";

import express from "express";
import {
  sendFriendRequest,
  respondToFriendRequest,
  getFriendsAndInvites,
  removeFriend,
  getAllFriendsInSession,
} from "../controllers/FriendsAndInvitesController";
import { authMiddleware } from "../controllers/AuthController";

export const FriendsAndInvitesRoutes = (io: Server) => {
  const router = express.Router();

  router.post("/send", async (req: Request, res: Response) => {
    await sendFriendRequest(req, res, io);
  });
  router.post("/respond", async (req: Request, res: Response) => {
    await respondToFriendRequest(req, res, io);
  });
  router.get("/:user_id", authMiddleware, getFriendsAndInvites);
  router.get("/getAllFriendsInSession/:user_id", authMiddleware, getAllFriendsInSession);
  router.delete("/removeFriend/:user_id/:friend_id", authMiddleware, removeFriend);

  return router;
};
