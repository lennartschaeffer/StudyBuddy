import express from "express";

import { getPotentialFriends, getProfileInfo } from "../controllers/UsersController";
import { authMiddleware } from "../controllers/AuthController";

export const UserRoutes = () => {

    const router = express.Router();

    router.get("/getAllUsers/:user_id",authMiddleware, getPotentialFriends);
    router.get("/getProfileInfo/:user_id",authMiddleware, getProfileInfo);
    return router;
}
