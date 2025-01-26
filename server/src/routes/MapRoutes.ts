import { Server } from "socket.io";
import { Express } from "express";
import { authMiddleware } from "../controllers/AuthController";
import express from "express";

import { getStudySpots } from "../controllers/MapController";

export const MapRoutes = () => {
  const router = express.Router();

  router.get("/studyspots/:lat/:lon", getStudySpots);

  return router;
};
