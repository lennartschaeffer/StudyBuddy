import { Server } from "socket.io";
import { Express } from "express";

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
  router.post("/", createStudyGroup);
  router.post("/join", joinStudyGroup);
  router.post("/invite", inviteToStudyGroup);
  router.post("/respond", respondToStudyGroupInvite);

  return router;
};
