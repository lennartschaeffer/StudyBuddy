import express, { Request, Response } from "express";
import { Express } from "express";
import { Server } from "socket.io";
import {
  createStudySession,
  completeTask,
  getActiveStudySession,
  completeActiveStudySession,
  getRecentStudySessions,
  createGroupStudySession,
  getUpcomingStudySessionsByUser,
} from "../controllers/StudySessionController";
import { authMiddleware } from "../controllers/AuthController";

export const StudySessionRoutes = (io: Server) => {
  const router = express.Router();

  //POST
  router.post("/", async(req: Request, res: Response) => await createStudySession(req, res, io));
  router.post("/group", createGroupStudySession);

  router.put("/completeTask/:task_id",authMiddleware, completeTask);
  router.put(
    "/completeActiveStudySession/:session_id/:session_type",authMiddleware,
    completeActiveStudySession
  );

  //GET
  router.get("/activeStudySession/:user_id",authMiddleware, getActiveStudySession);
  router.get("/recentStudySessions/:user_id",authMiddleware, getRecentStudySessions);
  //router.get("/mapStudySessionInfo/:user_id", getMapStudySessionInfo);
  router.get("/upcomingGroupSessions/:user_id",authMiddleware, getUpcomingStudySessionsByUser);

  return router;
};
