import { Server } from "socket.io";
import { Express } from "express";
import { authMiddleware } from "../controllers/AuthController";
import express from "express";

import {
  createStudyGroup,
  joinStudyGroup,
  getStudyGroupsByUser,
  inviteToStudyGroup,
  respondToStudyGroupInvite,
} from "../controllers/StudyGroupController";

export const StudyGroupRoutes = (io: Server) => {
  const router = express.Router();

  //GET
  router.get("/:user_id", getStudyGroupsByUser);

  //POST
  router.post("/", authMiddleware, createStudyGroup);
  router.post("/join",authMiddleware, joinStudyGroup);
  router.post("/invite",authMiddleware, inviteToStudyGroup);
  router.post("/respond",authMiddleware, respondToStudyGroupInvite);

  return router;
};
